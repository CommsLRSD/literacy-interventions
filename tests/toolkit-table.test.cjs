const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const read = file => readFileSync(join(__dirname, '..', file), 'utf8');

function setup() {
    const hosts = new Map(['toolkit-table-head', 'toolkit-table-body', 'toolkit-table-count',
        'toolkit-table-search'].map(id => [id, { innerHTML: '', textContent: '', value: '' }]));
    const context = vm.createContext({
        URL,
        document: {
            addEventListener() {},
            getElementById: id => hosts.get(id) || null,
            querySelectorAll: () => [],
            querySelector: () => null,
            createElement: () => ({
                textContent: '',
                get innerHTML() {
                    return this.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                }
            })
        },
        window: {
            location: { href: 'https://example.org/literacy-interventions/' },
            matchMedia: () => ({ addEventListener() {} })
        },
        localStorage: { getItem: () => null, setItem() {} }
    });
    const run = source => vm.runInContext(source, context);
    for (const file of ['translations.js', 'app.js']) run(read(file));
    run(`
        appState.interventionMenuData = ${read('data/intervention-menu.json')};
        appState.interventionMenuDataLoaded = true;
        favouriteIds = new Set();
    `);
    const json = source => JSON.parse(run(`JSON.stringify(${source})`));
    return { hosts, run, json };
}

test('with no program selected the unfiltered table includes every resource once', () => {
    const { run, json } = setup();
    run(`
        Object.assign(menuState, { program: 'English', pillar: ['Phonics'], tier: '2', resourceType: 'Intervention' });
        appState.fwState = { pillars: ['Vocabulary'] };
        const before = JSON.stringify({ menuState, fwState: appState.fwState, remembered: appState.rememberedMenuFilters });
    `);
    const rows = json('getToolkitTableRows().map(row => row.item.id)');
    assert.equal(rows.length, run('getAllResources().length'));
    assert.equal(new Set(rows).size, rows.length);
    assert.ok(rows.includes(run("getAllResources().find(item => item.tags.every(tag => tag.program === 'French Immersion')).id")));
    assert.equal(run('before === JSON.stringify({ menuState, fwState: appState.fwState, remembered: appState.rememberedMenuFilters })'), true);
});

test('the table follows program selection changes while preserving manual filters until the program changes', () => {
    const { run, json, hosts } = setup();
    const layout = { hidden: false, querySelectorAll: () => [] };
    const table = { hidden: true };
    const toggle = { setAttribute() {} };
    hosts.set('interventions-menu-layout', layout);
    hosts.set('toolkit-table-view', table);
    hosts.set('toolkit-view-toggle', toggle);
    run(`
        appState.interventionMenuData.resources = [
            { id: 'en', name: 'English', tags: [{ program: 'English', pillar: 'Phonics' }] },
            { id: 'fr', name: 'French', tags: [{ program: 'French Immersion', pillar: 'Phonics' }] },
            { id: 'both', name: 'Both', tags: [
                { program: 'English', pillar: 'Phonics', urls: ['https://example.org/en'] },
                { program: 'French Immersion', pillar: 'Vocabulary', urls: ['https://example.org/fr'] }
            ] }
        ];
        appState.selectedProgram = PROGRAM_ENGLISH;
        menuState.pillar = ['Vocabulary'];
        setToolkitView('table');
    `);
    assert.deepEqual(json('toolkitTableState.filters.program'), ['English']);
    assert.deepEqual(json('getToolkitTableRows().map(row => row.item.id)'), ['both', 'en']);
    assert.match(hosts.get('toolkit-table-head').innerHTML, /type="checkbox" value="English" checked/);
    assert.match(hosts.get('toolkit-table-body').innerHTML, /href="https:\/\/example.org\/en"/);
    assert.doesNotMatch(hosts.get('toolkit-table-body').innerHTML, /href="https:\/\/example.org\/fr"/);
    run("clearToolkitColumnFilter('program'); setToolkitView('guided'); setToolkitView('table')");
    assert.equal(run('getToolkitTableRows().length'), 3);
    run(`
        onToolkitTableFilterChange('pillar', 'Phonics', true);
        storeProgramPreference = () => {};
        applyTranslations = () => {};
        updateTopProgramLangControls = () => {};
        rerenderForLanguage = () => renderToolkitTable();
        applyProgramAcrossApp = () => {};
        finalizeProgramSelection(PROGRAM_FRENCH_IMMERSION, 'fr');
    `);
    assert.deepEqual(json('toolkitTableState.filters'), { pillar: ['Phonics'], program: ['French Immersion'] });
    assert.deepEqual(json('getToolkitTableRows().map(row => row.item.id)'), ['fr']);
    assert.match(hosts.get('toolkit-table-head').innerHTML, /type="checkbox" value="French Immersion" checked/);
    assert.deepEqual(json('menuState.pillar'), ['Vocabulary']);
    run("resetToolkitTableFilters(); setToolkitView('guided'); setToolkitView('table')");
    assert.equal(run('getToolkitTableRows().length'), 3);
    run("finalizeProgramSelection(PROGRAM_ENGLISH, 'en'); appState.selectedProgram = null; setToolkitView('table')");
    assert.equal(run("'program' in toolkitTableState.filters"), false);
    assert.equal(run('getToolkitTableRows().length'), 3);
});

test('the view switch toggles the opt-in table and back while preserving guided selections', () => {
    const { run, hosts } = setup();
    const dropdown = { open: true };
    const layout = { hidden: false, querySelectorAll: () => [dropdown] };
    const table = { hidden: true };
    const toggle = { 'aria-checked': 'false', setAttribute(key, value) { this[key] = value; }, getAttribute(key) { return this[key]; } };
    hosts.set('interventions-menu-layout', layout);
    hosts.set('toolkit-table-view', table);
    hosts.set('toolkit-view-toggle', toggle);
    run(`
        menuState.pillar = ['Phonics'];
        menuUiState.view = 'results';
        const before = JSON.stringify({ menuState, menuUiState });
        toggleToolkitView();
    `);
    assert.equal(layout.hidden, true);
    assert.equal(table.hidden, false);
    assert.equal(toggle['aria-checked'], 'true');
    assert.equal(dropdown.open, false);
    run('toggleToolkitView()');
    assert.equal(layout.hidden, false);
    assert.equal(table.hidden, true);
    assert.equal(toggle['aria-checked'], 'false');
    assert.equal(run('before === JSON.stringify({ menuState, menuUiState })'), true);
});

test('column filters allow several values per column, match any of them, and combine columns on the same tag', () => {
    const { run, json, hosts } = setup();
    run(`
        appState.interventionMenuData.resources = [
            { id: 'a', name: 'A', tags: [{ program: 'English', tier: 1, pillar: 'Phonics', screeners: ['DIBELS'] }] },
            { id: 'b', name: 'B', tags: [{ program: 'English', tier: 2, pillar: 'Vocabulary' }] },
            { id: 'c', name: 'C', tags: [{ program: 'French Immersion', tier: 3, pillar: 'Fluency', screeners: ['THaFoL'] }] }
        ];
        renderToolkitTable();
        onToolkitTableFilterChange('pillar', 'Phonics', true);
        onToolkitTableFilterChange('pillar', 'Fluency', true);
    `);
    assert.deepEqual(json('getToolkitTableRows().map(row => row.item.id)'), ['a', 'c']);
    run("onToolkitTableFilterChange('screener', NO_SPECIFIC_SCREENER_VALUE, true); onToolkitTableFilterChange('screener', 'DIBELS', true)");
    assert.deepEqual(json('getToolkitTableRows().map(row => row.item.id)'), ['a']);
    run("onToolkitTableFilterChange('pillar', 'Vocabulary', true)");
    assert.deepEqual(json('getToolkitTableRows().map(row => row.item.id)'), ['a', 'b']);
    run("clearToolkitColumnFilter('screener'); onToolkitTableFilterChange('pillar', 'Phonics', false)");
    assert.deepEqual(json('toolkitTableState.filters'), { pillar: ['Fluency', 'Vocabulary'] });
    assert.deepEqual(json('getToolkitTableRows().map(row => row.item.id)'), ['b', 'c']);
    run("renderToolkitTable()");
    const head = hosts.get('toolkit-table-head').innerHTML;
    assert.equal((head.match(/class="cal-grade-dropdown toolkit-column-filter/g) || []).length, 7);
    assert.doesNotMatch(head, /data-field="evidence"/);
    assert.match(head, /toolkit-column-filter is-active" data-field="pillar"/);
    assert.match(head, /aria-label="Filter Literacy Pillar \(2 selected\)"|aria-label="Filter [^"]+ \(2 selected\)"/);
    assert.match(head, /type="checkbox" value="Vocabulary" checked/);
    for (const field of ['program', 'pillar', 'tier', 'grade', 'screener']) {
        assert.doesNotMatch(head, new RegExp(`onclick="sortToolkitTable\\('${field}'\\)"`));
        assert.match(head, new RegExp(`data-field="${field}"`));
    }
    assert.match(head, /onclick="sortToolkitTable\('name'\)"/);
    assert.match(head, /onclick="sortToolkitTable\('resourceType'\)"/);
});

test('table filters must match the same tag and metadata and links only use matching tags', () => {
    const { run, json, hosts } = setup();
    run(`
        appState.interventionMenuData.resources = [{
            id: 'mixed', name: 'Mixed program resource', tags: [
                { program: 'English', tier: 1, pillar: 'Phonics', resourceType: 'Intervention',
                  gradeFilter: ['1'], screeners: ['DIBELS'], urls: ['https://example.org/en'] },
                { program: 'French Immersion', tier: 2, pillar: 'Vocabulary', resourceType: 'Intervention',
                  gradeFilter: ['2'], screeners: ['THaFoL'], urls: ['https://example.org/fr'] }
            ]
        }];
        toolkitTableState.filters = { program: ['English'], tier: ['2'] };
    `);
    assert.deepEqual(json('getToolkitTableRows()'), []);
    run("toolkitTableState.filters = { program: ['French Immersion'], grade: ['2'], screener: ['THaFoL'] }; renderToolkitTable()");
    const [row] = json('getToolkitTableRows()');
    assert.equal(row.values.pillar, 'Vocabulary');
    assert.equal(row.values.screener, 'THaFoL');
    assert.equal(row.values.grade, 'Gr. 2');
    assert.match(hosts.get('toolkit-table-body').innerHTML, /href="https:\/\/example.org\/fr"/);
    assert.doesNotMatch(hosts.get('toolkit-table-body').innerHTML, /href="https:\/\/example.org\/en"/);
});

test('sortable columns toggle direction and report the active sort accessibly', () => {
    const { run, json, hosts } = setup();
    run(`
        appState.interventionMenuData.resources = [
            { id: '10', name: 'Resource 10', tags: [{ resourceType: 'Intervention' }] },
            { id: '2', name: 'Resource 2', tags: [{ resourceType: 'Assessment' }] },
            { id: 'K', name: 'Resource K', tags: [{ resourceType: 'Assessment' }] }
        ];
    `);
    assert.deepEqual(json('getToolkitTableRows().map(row => row.item.id)'), ['2', '10', 'K']);
    run("sortToolkitTable('name')");
    assert.deepEqual(json('getToolkitTableRows().map(row => row.item.id)'), ['K', '10', '2']);
    assert.match(hosts.get('toolkit-table-head').innerHTML, /aria-sort="descending"/);
    run("sortToolkitTable('grade')");
    assert.equal(run('toolkitTableState.sort'), 'name');
    run("sortToolkitTable('resourceType')");
    assert.deepEqual(json('getToolkitTableRows().map(row => row.item.id)'), ['2', 'K', '10']);
    assert.match(hosts.get('toolkit-table-head').innerHTML, /aria-sort="ascending"/);
});

test('resource menu filters or sorts recommendations using matching tags and resets', () => {
    const { run, json, hosts } = setup();
    run(`
        appState.interventionMenuData.resources = [
            { id: 'rec', name: 'Rec', tags: [{ pillar: 'Phonics', recommended: true }, { pillar: 'Vocabulary' }] },
            { id: 'plain', name: 'A plain', tags: [{ pillar: 'Phonics' }] },
            { id: 'rec2', name: 'Z rec', tags: [{ pillar: 'Vocabulary', recommended: true }] }
        ];
        renderToolkitTable();
    `);
    const head = hosts.get('toolkit-table-head').innerHTML;
    assert.match(head, /name="toolkit-recommendation" value="all" checked/);
    assert.match(head, /Recommended only/);
    assert.match(head, /Recommended first/);
    assert.doesNotMatch(head, /onToolkitTableFilterChange\('name'/);
    run("onToolkitTableRecommendationChange('first')");
    assert.deepEqual(json('getToolkitTableRows().map(row => row.item.id)'), ['rec', 'rec2', 'plain']);
    run("sortToolkitTable('name')");
    assert.deepEqual(json('getToolkitTableRows().map(row => row.item.id)'), ['rec2', 'rec', 'plain']);
    assert.match(hosts.get('toolkit-table-head').innerHTML, /aria-sort="other"/);
    run("onToolkitTableFilterChange('pillar', 'Phonics', true); onToolkitTableRecommendationChange('only')");
    assert.deepEqual(json('getToolkitTableRows().map(row => row.item.id)'), ['rec']);
    run("clearToolkitColumnFilter('pillar'); onToolkitTableFilterChange('pillar', 'Vocabulary', true); onToolkitTableSearch('Rec')");
    assert.deepEqual(json('getToolkitTableRows().map(row => row.item.id)'), ['rec2']);
    run("onToolkitTableSearch('not present')");
    assert.match(hosts.get('toolkit-table-body').innerHTML, /colspan="8"/);
    run('resetToolkitTableFilters()');
    assert.equal(run('toolkitTableState.recommendation'), 'all');
    assert.equal(run('getToolkitTableRows().length'), 3);
});

test('table groups consecutive grades without merging M and K and preserves grade search', () => {
    const { run } = setup();
    assert.equal(run("formatToolkitGrades(['12','K','1','2','3','4','5','6','7','8','9','10','11'])"), 'K–Gr. 12');
    assert.equal(run("formatToolkitGrades(['M','K','1','2','4','5','7','8','9','11'])"), 'M, K–Gr. 2, Gr. 4, Gr. 5, Gr. 7–Gr. 9, Gr. 11');
    assert.equal(run("formatToolkitGrades(['M','1','2'])"), 'M–Gr. 2');
    assert.equal(run("formatToolkitGrades(['2','1','1'])"), 'Gr. 1, Gr. 2');
    run("appState.language = 'fr'");
    assert.equal(run("formatToolkitGrades(['K','1','2'])"), 'K–Année 2');
    run("appState.interventionMenuData.resources = [{ id: 'a', name: 'A', tags: [{ gradeFilter: ['1','2','3'] }] }]; onToolkitTableSearch('Année 2')");
    assert.equal(run('getToolkitTableRows().length'), 1);
});

test('table shows an accessible unavailable icon instead of missing link text', () => {
    const { run, hosts } = setup();
    run("appState.interventionMenuData.resources = [{ id: 'a', name: 'A', tags: [{}] }]; renderToolkitTable()");
    const body = hosts.get('toolkit-table-body').innerHTML;
    assert.match(body, /toolkit-link-unavailable" role="img" aria-label="No link available"/);
    assert.match(body, />open_in_new<\/span>/);
    assert.doesNotMatch(body, />No link available</);
});

test('search includes notes and subtests and no-match filters remain clearable without changing guided state', () => {
    const { run, json, hosts } = setup();
    run(`
        appState.interventionMenuData.resources = [
            { id: 'note', name: 'Note resource', tags: [{ notes: 'Multilingual learners', subtests: ['Elision'] }] },
            { id: 'other', name: 'Other resource', tags: [{}] }
        ];
        menuState.pillar = ['Vocabulary'];
        onToolkitTableSearch('  MULTILINGUAL  ');
    `);
    assert.deepEqual(json('getToolkitTableRows().map(row => row.item.id)'), ['note']);
    run("onToolkitTableSearch('elision')");
    assert.deepEqual(json('getToolkitTableRows().map(row => row.item.id)'), ['note']);
    run("onToolkitTableSearch('not present')");
    assert.match(hosts.get('toolkit-table-body').innerHTML, /No resources match/);
    run('resetToolkitTableFilters()');
    assert.equal(run('getToolkitTableRows().length'), 2);
    assert.equal(hosts.get('toolkit-table-search').value, '');
    assert.deepEqual(json('menuState.pillar'), ['Vocabulary']);
});

test('table labels and values translate without translating resource names, and output is escaped', () => {
    const { run, hosts } = setup();
    run(`
        appState.interventionMenuData.resources = [{
            id: 'escaped', name: '<img src=x onerror="bad">', tags: [{
                program: 'French Immersion', pillar: 'Vocabulary', resourceType: 'Intervention',
                gradeFilter: ['2'], notes: '<script>bad</script>', evidence: '*'
            }]
        }];
        appState.language = 'fr';
        renderToolkitTable();
    `);
    const body = hosts.get('toolkit-table-body').innerHTML;
    assert.match(body, /&lt;img src=x onerror="bad"&gt;/);
    assert.match(body, /&lt;script&gt;bad&lt;\/script&gt;/);
    assert.doesNotMatch(body, /<img|<script>/);
    assert.ok(body.includes(run("translatePillar('Vocabulary')")));
    assert.match(body, /Année 2/);
    assert.match(body, /Immersion française/);
    assert.match(hosts.get('toolkit-table-head').innerHTML, /Liens vers les ressources/);
    assert.match(hosts.get('toolkit-table-head').innerHTML, /aria-label="Filtrer : /);
    assert.match(hosts.get('toolkit-table-head').innerHTML, />Effacer</);
});

test('failed resource loading is explicit rather than appearing as an empty catalogue', () => {
    const { run, hosts } = setup();
    run('appState.interventionMenuDataLoaded = false; renderToolkitTable()');
    assert.match(hosts.get('toolkit-table-body').innerHTML, /role="alert"/);
    assert.match(hosts.get('toolkit-table-body').innerHTML, /Resources could not be loaded/);
    assert.doesNotMatch(hosts.get('toolkit-table-body').innerHTML, /No resources match/);
});
