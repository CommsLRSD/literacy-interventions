const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

function setup({ language = 'en', grade = ['1'], pillars = ['Phonics'], resourceType = 'Intervention' } = {}) {
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
    context.options = { language, grade, pillars, resourceType };
    run(`
        appState.language = options.language;
        appState.interventionMenuData = ${readFileSync(join(__dirname, '..', 'data/intervention-menu.json'), 'utf8')};
        appState.fwState = {
            tier: 2, program: 'English', resourceType: options.resourceType,
            grade: options.grade, pillars: options.pillars, selectedIds: ['stale-choice'],
            multiSelect: options.resourceType === 'Drill Down Assessment'
        };
        getFilteredResources = () => [];
        fwLoadResults();
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
