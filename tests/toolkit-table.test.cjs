const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const read = file => readFileSync(join(__dirname, '..', file), 'utf8');

function setup() {
    const hosts = new Map(['toolkit-table-head', 'toolkit-table-body', 'toolkit-table-count',
        'toolkit-table-filters', 'toolkit-table-search'].map(id => [id, { innerHTML: '', textContent: '', value: '' }]));
    const context = vm.createContext({
        URL,
        document: {
            addEventListener() {},
            getElementById: id => hosts.get(id) || null,
            querySelectorAll: () => [],
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

test('the unfiltered table includes every resource once, independent of guided selections', () => {
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

test('switching to the opt-in table and back preserves guided selections and updates the view controls', () => {
    const { run, hosts } = setup();
    const dropdown = { open: true };
    const layout = { hidden: false, querySelectorAll: () => [dropdown] };
    const table = { hidden: true };
    const guidedButton = { setAttribute(key, value) { this[key] = value; } };
    const tableButton = { setAttribute(key, value) { this[key] = value; } };
    hosts.set('interventions-menu-layout', layout);
    hosts.set('toolkit-table-view', table);
    hosts.set('toolkit-guided-view-button', guidedButton);
    hosts.set('toolkit-table-view-button', tableButton);
    run(`
        menuState.pillar = ['Phonics'];
        menuUiState.view = 'results';
        const before = JSON.stringify({ menuState, menuUiState });
        setToolkitView('table');
    `);
    assert.equal(layout.hidden, true);
    assert.equal(table.hidden, false);
    assert.equal(tableButton['aria-pressed'], 'true');
    assert.equal(guidedButton['aria-pressed'], 'false');
    assert.equal(dropdown.open, false);
    run("setToolkitView('guided')");
    assert.equal(layout.hidden, false);
    assert.equal(table.hidden, true);
    assert.equal(tableButton['aria-pressed'], 'false');
    assert.equal(run('before === JSON.stringify({ menuState, menuUiState })'), true);
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
        toolkitTableState.filters = { program: 'English', tier: '2' };
    `);
    assert.deepEqual(json('getToolkitTableRows()'), []);
    run("toolkitTableState.filters = { program: 'French Immersion', grade: '2', screener: 'THaFoL' }; renderToolkitTable()");
    const [row] = json('getToolkitTableRows()');
    assert.equal(row.values.pillar, 'Vocabulary');
    assert.equal(row.values.screener, 'THaFoL');
    assert.equal(row.values.grade, 'Gr. 2');
    assert.match(hosts.get('toolkit-table-body').innerHTML, /href="https:\/\/example.org\/fr"/);
    assert.doesNotMatch(hosts.get('toolkit-table-body').innerHTML, /href="https:\/\/example.org\/en"/);
});

test('table sorting toggles direction, uses numeric grade order, and reports the active sort accessibly', () => {
    const { run, json, hosts } = setup();
    run(`
        appState.interventionMenuData.resources = [
            { id: '10', name: 'Resource 10', tags: [{ gradeFilter: ['10'] }] },
            { id: '2', name: 'Resource 2', tags: [{ gradeFilter: ['2'] }] },
            { id: 'K', name: 'Resource K', tags: [{ gradeFilter: ['K'] }] }
        ];
    `);
    assert.deepEqual(json('getToolkitTableRows().map(row => row.item.id)'), ['2', '10', 'K']);
    run("sortToolkitTable('name')");
    assert.deepEqual(json('getToolkitTableRows().map(row => row.item.id)'), ['K', '10', '2']);
    assert.match(hosts.get('toolkit-table-head').innerHTML, /aria-sort="descending"/);
    run("sortToolkitTable('grade')");
    assert.deepEqual(json('getToolkitTableRows().map(row => row.item.id)'), ['K', '2', '10']);
    run("sortToolkitTable('grade')");
    assert.deepEqual(json('getToolkitTableRows().map(row => row.item.id)'), ['10', '2', 'K']);
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
        renderToolkitTableFilters();
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
    assert.match(hosts.get('toolkit-table-filters').innerHTML, />Tous<\/option>/);
});

test('failed resource loading is explicit rather than appearing as an empty catalogue', () => {
    const { run, hosts } = setup();
    run('appState.interventionMenuDataLoaded = false; renderToolkitTable()');
    assert.match(hosts.get('toolkit-table-body').innerHTML, /role="alert"/);
    assert.match(hosts.get('toolkit-table-body').innerHTML, /Resources could not be loaded/);
    assert.doesNotMatch(hosts.get('toolkit-table-body').innerHTML, /No resources match/);
});
