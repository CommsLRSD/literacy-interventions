const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const read = file => readFileSync(join(__dirname, '..', file), 'utf8');
const data = JSON.parse(read('data/intervention-menu.json'));
const expectedDefinitions = [
    'The alphabetic principle is the understanding that letters and letter combinations represent the sounds (phonemes) of spoken language. It’s the foundation of reading and writing in alphabetic languages, where each symbol (letter) corresponds to a specific sound or group of sounds. This principle is crucial for children learning to read and write because it helps them understand how written words map to spoken language.',
    'Phonemic awareness is the ability to hear, identify, and manipulate sounds (phonemes) in spoken words. It’s crucial for learning to read, as it helps children understand how sounds form words and correspond to letters. Key skills include rhyming, blending, segmenting, isolating, and manipulating sounds. Developing phonemic awareness is essential for decoding (reading) and encoding (spelling) words.',
    'Phonics is a method that teaches reading and writing by connecting letters or letter combinations to their sounds. It helps learners decode (read) and encode (spell) words by recognizing these sound-symbol relationships. Phonics is essential for early reading education, improving both reading fluency and comprehension.',
    'Reading fluency is the ability to read text with accuracy, automaticity (appropriate speed), and prosody (expression) sufficient to support comprehension. Acting as a bridge between word recognition and understanding, fluency frees up limited cognitive resources so readers can focus on meaning rather than decoding.',
    'Vocabulary refers to the set of words that a person knows and uses. It includes both receptive vocabulary (words we understand when reading or listening) and productive vocabulary (words we use when speaking or writing). A strong vocabulary helps with reading comprehension, effective communication, and writing skills. Vocabulary can be developed through exposure to new words, context, and practice.',
    'Reading comprehension is the ability to understand and interpret written text, including recognizing main ideas, details, and making inferences. It’s essential for fully grasping the meaning of what’s being read, context, and practice.',
    'Orthography is the system of writing and spelling in a language, including the rules for spelling, punctuation, capitalization, and word formation. It involves the standardized representation of words and their correct written form.'
];

function setup() {
    const hosts = new Map();
    const context = vm.createContext({
        URL,
        document: {
            addEventListener() {},
            getElementById: id => hosts.get(id) || null,
            createElement: () => ({
                textContent: '',
                get innerHTML() {
                    return this.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                }
            })
        },
        window: {
            location: { href: 'https://example.org/literacy-interventions/' },
            matchMedia: () => ({ matches: false, addEventListener() {} })
        },
        localStorage: {
            setItem() { assert.fail('Definition help must not write saved data'); }
        }
    });
    const run = source => vm.runInContext(source, context);
    for (const file of ['translations.js', 'app.js']) run(read(file));
    run(`appState.interventionMenuData = ${JSON.stringify(data)};`);
    return { hosts, run };
}

test('all seven English definitions preserve the supplied wording and have French translations', () => {
    assert.deepEqual(data.pillars.map(pillar => pillar.definition), expectedDefinitions);
    const pillarNames = new Set(data.pillars.map(pillar => pillar.name));
    for (const resource of data.resources) {
        for (const tag of resource.tags || []) {
            if (tag.pillar) assert.ok(pillarNames.has(tag.pillar), `Missing definition for ${tag.pillar}`);
        }
    }
    for (const pillar of data.pillars) {
        assert.ok(pillar.definition_fr.trim());
        assert.notEqual(pillar.definition_fr, pillar.definition);
    }
});

test('shared guide renders every definition in the selected language and expands only selected pillars', () => {
    const { run } = setup();
    for (const language of ['en', 'fr']) {
        run(`appState.language = '${language}'`);
        const html = run("getPillarDefinitionsHtml(['Phonics', 'Vocabulary'])");
        assert.equal((html.match(/<details /g) || []).length, 7);
        assert.deepEqual([...html.matchAll(/data-pillar="([^"]+)" open/g)].map(match => match[1]),
            ['Phonics', 'Vocabulary']);
        for (const pillar of data.pillars) {
            assert.ok(html.includes(language === 'fr' ? pillar.name_fr : pillar.name));
            assert.ok(html.includes(language === 'fr' ? pillar.definition_fr : pillar.definition));
        }
    }
});

test('definition text and names are escaped, and unavailable data produces an explicit error', () => {
    const { run } = setup();
    run(`appState.interventionMenuData.pillars = [
        { name: '<img src=x>', definition: '<script>alert(1)</script>' }
    ]`);
    const html = run('getPillarDefinitionsHtml()');
    assert.match(html, /&lt;img src=x&gt;/);
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.doesNotMatch(html, /<script>|<img/);
    run('appState.interventionMenuData = null');
    assert.match(run('getPillarDefinitionsHtml()'), /role="alert".*could not be loaded/);
});

test('both guide surfaces preserve their own expanded pillars when language changes', () => {
    const { run, hosts } = setup();
    for (const [id, pillar] of [
        ['literacy-pillars-reference', 'Vocabulary'],
        ['literacy-pillars-context', 'Phonics']
    ]) {
        hosts.set(id, { innerHTML: '', querySelectorAll: () => [{ dataset: { pillar } }] });
    }
    run("appState.language = 'fr'; renderLiteracyPillars()");
    assert.match(hosts.get('literacy-pillars-reference').innerHTML, /data-pillar="Vocabulary" open/);
    assert.match(hosts.get('literacy-pillars-context').innerHTML, /data-pillar="Phonics" open/);
    assert.ok(hosts.get('literacy-pillars-context').innerHTML.includes(data.pillars[2].definition_fr));
});

test('contextual help opens all definitions closed without changing filters or pathway progress', () => {
    const { run, hosts } = setup();
    const body = { scrollTop: 100 };
    const dialog = { showModal() { this.open = true; }, querySelector: () => body };
    hosts.set('literacy-pillars-dialog', dialog);
    hosts.set('literacy-pillars-context', { innerHTML: '' });
    run(`
        appState.fwState = { pillars: ['Reading Fluency', 'Vocabulary'], selectedIds: ['chosen-resource'] };
        appState.visualFlowchart = { tierId: 'tier2', choices: { assessment: { id: 'chosen-resource' } } };
        menuState.pillar = ['Orthography'];
        const before = JSON.stringify({ appState, menuState });
        const trigger = { focus() { this.focused = true; } };
        openLiteracyPillars(trigger);
    `);
    assert.equal(dialog.open, true);
    assert.equal(body.scrollTop, 0);
    assert.equal(run('trigger.focused'), true);
    assert.equal((hosts.get('literacy-pillars-context').innerHTML.match(/<details /g) || []).length, 7);
    assert.doesNotMatch(hosts.get('literacy-pillars-context').innerHTML, /<details[^>]* open/);
    hosts.get('literacy-pillars-context').innerHTML = run("getPillarDefinitionsHtml(['Reading Fluency'])");
    run('openLiteracyPillars(trigger)');
    assert.doesNotMatch(hosts.get('literacy-pillars-context').innerHTML, /<details[^>]* open/);
    assert.equal(run('JSON.stringify({ appState, menuState }) === before'), true);
});

test('help remains available beside unlocked and inherited locked flowchart pillars', () => {
    const { run } = setup();
    run(`
        appState.visualFlowchart = { tierId: 'tier2' };
        appState.selectedProgram = 'English';
        getPathwayScreenerId = () => 'DIBELS';
        setRememberedMenuFilters = () => {};
        getPrecedingDrillDownPillars = () => ['Vocabulary'];
    `);
    for (const options of ['drillDownAssessments', 'interventions']) {
        const html = run(`createIntegratedSelectionNode({ id: 'test-${options}', options: '${options}' })`);
        assert.match(html, /What do these pillars mean\?/);
        assert.match(html, /aria-haspopup="dialog" aria-controls="literacy-pillars-dialog"/);
        assert.equal(html.includes('id="fw-pillar-filter"'), options === 'drillDownAssessments');
    }
});

test('Toolkit pillar menus retain every pillar even when the program has no matching resources', () => {
    const { hosts, run } = setup();
    const chips = { innerHTML: '', contains: () => false };
    hosts.set('filter-pillar-chips', chips);
    hosts.set('menu-pillar-value', { textContent: '' });
    run(`
        menuState.program = 'French Immersion';
        menuState.resourceType = 'Intervention';
        appState.interventionMenuData.resources = [];
        renderMenuMultiselectOptions('pillar', 'pillar', translatePillar, 'filter_choose_pillars');
    `);
    assert.equal((chips.innerHTML.match(/type="checkbox"/g) || []).length, 7);
    assert.equal((chips.innerHTML.match(/ disabled/g) || []).length, 7);
    assert.equal((chips.innerHTML.match(/No resources are available/g) || []).length, 14);
    assert.match(chips.innerHTML, /Program: French Immersion; Resource Type: Intervention/);
    assert.match(chips.innerHTML, /multiselect-done-btn/);
});

test('checklist help is outside checkbox labels and the reference guide is part of Resources', () => {
    const { run } = setup();
    run('appState.visualFlowchart = { checklistChecked: {} }');
    const html = run("renderChecklistBody({ items: ['Review the five pillars of reading.'] })");
    assert.ok(html.indexOf('openLiteracyPillars(this)') > html.lastIndexOf('</label>'));
    const page = read('index.html');
    assert.doesNotMatch(page, /data-page="pillars"|id="pillars-section"/);
    assert.match(page, /class="nav-link" data-page="resources"/);
    assert.match(page, /class="mobile-nav-item" data-page="resources"/);
    const resources = page.slice(page.indexOf('<section id="resources-section"'), page.indexOf('<!-- /.resources-page-wrapper -->'));
    assert.match(resources, /id="resources-pillars-title"/);
    assert.match(resources, /id="literacy-pillars-reference"/);
    assert.equal((page.match(/id="literacy-pillars-reference"/g) || []).length, 1);
    assert.doesNotMatch(page, /Selected pillars are expanded below/);
    assert.match(page, /onclick="openLiteracyPillars\(this\)"/);
    assert.match(page, /<dialog id="literacy-pillars-dialog".*onkeydown="event.stopPropagation\(\)"/);
});
