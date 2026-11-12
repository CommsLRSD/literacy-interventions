const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

function setup({ language = 'en', grade = ['1'], pillars = ['Phonics'], resourceType = 'Intervention', emptyResources = true } = {}) {
    const results = { innerHTML: '' };
    const context = vm.createContext({
        URL,
        document: {
            addEventListener() {},
            getElementById: id => id === 'fw-results' ? results : null,
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
        }
    });
    const run = source => vm.runInContext(source, context);
    for (const file of ['translations.js', 'app.js']) {
        run(readFileSync(join(__dirname, '..', file), 'utf8'));
    }
    context.options = { language, grade, pillars, resourceType, emptyResources };
    run(`
        appState.language = options.language;
        appState.interventionMenuData = ${readFileSync(join(__dirname, '..', 'data/intervention-menu.json'), 'utf8')};
        appState.fwState = {
            tier: 2, program: 'English', resourceType: options.resourceType,
            grade: options.grade, pillars: options.pillars, selectedIds: ['stale-choice'],
            multiSelect: options.resourceType === 'Drill Down Assessment'
        };
        if (options.emptyResources) {
            getFilteredResources = () => [];
            fwLoadResults();
        }
    `);
    return { results, run };
}

test('empty resource steps include the selected grade and pillar and preserve the skip option', () => {
    for (const resourceType of ['Intervention', 'Drill Down Assessment']) {
        const { results, run } = setup({ resourceType });
        assert.match(results.innerHTML, /No matching items found for Gr\. 1 Phonics\./);
        assert.match(results.innerHTML, /Continue without a resource/);
        assert.equal(run('appState.fwState.selectedIds.length'), 0);
    }
});

test('empty resource steps include all selected pillars', () => {
    const { results } = setup({ grade: ['K'], pillars: ['Phonics', 'Fluency'] });
    assert.match(results.innerHTML, /No matching items found for K Phonics, Fluency\./);
});

test('empty resource steps translate the grade and literacy pillar', () => {
    const { results, run } = setup({ language: 'fr' });
    const pillar = run("translatePillar('Phonics')");
    assert.notEqual(pillar, 'Phonics');
    assert.ok(results.innerHTML.includes(`Aucun élément correspondant pour Année 1 ${pillar}.`));
});

test('empty resource messages escape selected criteria', () => {
    const { results } = setup({ pillars: ['<script>alert(1)</script>'] });
    assert.match(results.innerHTML, /Gr\. 1 &lt;script&gt;alert\(1\)&lt;\/script&gt;\./);
    assert.ok(!results.innerHTML.includes('<script>'));
});

test('no selected pillars still prompts for a pillar rather than reporting no matches', () => {
    const { results } = setup({ pillars: [] });
    assert.match(results.innerHTML, /Select at least one literacy pillar/);
    assert.ok(!results.innerHTML.includes('No matching items'));
    assert.ok(!results.innerHTML.includes('fw-skip-btn'));
});

function setupPillarMenu(options) {
    const context = setup({ ...options, emptyResources: false });
    context.run(`
        appState.visualFlowchart = { tierId: 'tier2' };
        appState.selectedProgram = 'English';
        pathwayContext = { program: 'English', grades: ['1'], screener: 'DIBELS' };
        getPathwayScreenerId = () => 'DIBELS';
        getPrecedingDrillDownPillars = () => null;
        appState.rememberedMenuFilters = { pillars: ['Vocabulary'], pillar: 'Vocabulary' };
        appState.interventionMenuData.resources = [{
            id: 'matching-resource', name: 'Matching resource', tags: [{
                program: 'English', tier: 2, resourceType: options.resourceType,
                pillar: 'Phonics', screeners: ['DIBELS'], gradeFilter: ['1']
            }]
        }];
    `);
    return context;
}

test('resource menus show all pillars, disable only unavailable ones, and explain the actual pathway filters', () => {
    for (const resourceType of ['Drill Down Assessment', 'Intervention']) {
        const { run } = setupPillarMenu({ resourceType });
        const nodeOptions = resourceType === 'Intervention' ? 'interventions' : 'drillDownAssessments';
        const html = run(`createIntegratedSelectionNode({ id: 'test-node', options: '${nodeOptions}' })`);
        const labels = [...html.matchAll(/<label class="cal-grade-option"([^>]*)>([\s\S]*?)<\/label>/g)];
        assert.equal(labels.length, 7);
        for (const [, attributes, contents] of labels) {
            if (contents.includes('value="Phonics"')) {
                assert.doesNotMatch(contents, /disabled/);
                assert.doesNotMatch(attributes, /title=/);
            } else {
                assert.match(contents, / disabled/);
                assert.match(attributes, /tabindex="0"/);
                assert.match(attributes, /No resources are available/);
                assert.match(attributes, /Grade: Gr\. 1/);
                assert.match(attributes, /Screener: DIBELS/);
                assert.match(attributes, /Tier: Tier 2/);
                assert.ok(attributes.includes(`Resource Type: ${resourceType}`));
                assert.match(attributes, /aria-label=/);
                assert.doesNotMatch(contents, /\schecked(?:\s|>)/);
            }
        }
        assert.equal(run('appState.fwState.pillars.length'), 0);
    }
});

test('pillar availability respects every filter on the same resource tag and updates when grade changes', () => {
    const { run } = setupPillarMenu({ resourceType: 'Drill Down Assessment' });
    run(`
        appState.interventionMenuData.resources[0].tags.push(
            { program: 'English', tier: 2, resourceType: 'Drill Down Assessment',
              pillar: 'Vocabulary', screeners: ['DIBELS'], gradeFilter: ['2'] },
            { program: 'English', tier: 2, resourceType: 'Drill Down Assessment',
              pillar: 'Vocabulary', screeners: ['Other'], gradeFilter: ['1'] }
        );
    `);
    const render = () => run("createIntegratedSelectionNode({ id: 'test-node', options: 'drillDownAssessments' })");
    assert.match(render(), /value="Vocabulary"[^>]* disabled/);
    run("pathwayContext.grades = ['2']");
    const updated = render();
    assert.match(updated, /value="Vocabulary"[^>]*onchange/);
    assert.doesNotMatch(updated, /value="Vocabulary"[^>]* disabled/);
    assert.match(updated, /value="Phonics"[^>]* disabled/);
});

test('unavailable pillar explanations are localized and safely escape filter values', () => {
    const { run } = setupPillarMenu({ language: 'fr', resourceType: 'Intervention' });
    const attributes = run(`buildUnavailablePillarAttributes('Vocabulary', {
        program: 'English', grade: ['1'], screener: '<img src=x onerror="bad">', resourceType: 'Intervention'
    })`);
    assert.match(attributes, /Aucune ressource/);
    assert.match(attributes, /Année 1/);
    assert.match(attributes, /&lt;img src=x onerror=&quot;bad&quot;&gt;/);
    assert.doesNotMatch(attributes, /<img/);
});

test('all-unavailable resource steps keep the continuation path instead of asking for a disabled pillar', () => {
    const { run, results } = setupPillarMenu({ resourceType: 'Drill Down Assessment' });
    run(`
        pathwayContext.grades = ['8'];
        createIntegratedSelectionNode({ id: 'test-node', options: 'drillDownAssessments' });
        fwLoadResults();
    `);
    assert.match(results.innerHTML, /Continue without a resource/);
    assert.doesNotMatch(results.innerHTML, /Select at least one literacy pillar/);
    assert.equal(run('appState.fwState.pillars.length'), 0);
});

test('unavailable pillars cannot be selected through the flowchart toggle handler', () => {
    const { run } = setupPillarMenu({ resourceType: 'Drill Down Assessment' });
    run(`
        createIntegratedSelectionNode({ id: 'test-node', options: 'drillDownAssessments' });
        fwOnPillarToggle('Vocabulary', true);
    `);
    assert.equal(run('appState.fwState.pillars.length'), 0);
});
