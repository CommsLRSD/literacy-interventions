const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

function setup({ language = 'en', grade = ['1'], pillars = ['Phonics'], resourceType = 'Intervention', emptyResources = true } = {}) {
    const results = { innerHTML: '' };
    const context = vm.createContext({
        URL, Blob, TextEncoder, structuredClone, crypto: require('node:crypto').webcrypto,
        CSS: { escape: value => value },
        DOMParser: class {
            parseFromString(text) {
                return { body: { textContent: text.replace(/<[^>]*>/g, '') } };
            }
        },
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

test('resource choices use highlighted toggle buttons without checkbox graphics', () => {
    for (const resourceType of ['Drill Down Assessment', 'Intervention']) {
        const { run, results } = setupPillarMenu({ resourceType });
        results.querySelectorAll = () => [];
        results.querySelector = () => null;
        run(`
            appState.interventionMenuData.resources[0].tags[0].recommended = true;
            appState.fwState.selectedIds = ['matching-resource'];
            fwLoadResults();
        `);
        assert.doesNotMatch(results.innerHTML, /fw-result-check|role="checkbox"|aria-checked/);
        assert.match(results.innerHTML, /resource-recommended-badge[^>]*>★/);
        if (resourceType === 'Drill Down Assessment') {
            assert.match(results.innerHTML, /class="fw-result-item is-recommended is-selected" role="button" aria-pressed="true"/);
            assert.match(results.innerHTML, /event\.key==='Enter'\|\|event\.key===' '/);
            assert.doesNotMatch(results.innerHTML, /fw-result-arrow/);
        } else {
            assert.match(results.innerHTML, /class="fw-result-item[^"]*" role="button" tabindex="0"/);
            assert.match(results.innerHTML, /fw-result-arrow/);
        }
    }
});

test('toggling multiple resources updates highlights, accessible state and continuation without rerendering', () => {
    const { run, results } = setup({ resourceType: 'Drill Down Assessment', emptyResources: false });
    const items = ['first', 'second'].map(resourceId => ({
        dataset: { resourceId },
        classList: { toggle(name, selected) { this[name] = selected; } },
        setAttribute(name, value) { this[name] = value; }
    }));
    const count = { textContent: '' };
    const button = { disabled: true };
    results.innerHTML = 'preserve focused resource';
    results.querySelectorAll = () => items;
    results.querySelector = selector => selector === '.fw-multi-count' ? count : button;
    run('appState.fwState.selectedIds = []');
    for (const [id, expected] of [['first', [true, false]], ['second', [true, true]], ['first', [false, true]], ['second', [false, false]]]) {
        run(`fwToggleItem('${id}')`);
        assert.deepEqual(items.map(item => item.classList['is-selected']), expected);
        assert.deepEqual(items.map(item => item['aria-pressed']), expected.map(String));
        assert.equal(button.disabled, !expected.some(Boolean));
        assert.equal(count.textContent, run("t('fw_selected_count')(appState.fwState.selectedIds.length)"));
        assert.equal(results.innerHTML, 'preserve focused resource');
    }
});

function setupIndividualPathway(language = 'en', { atResult = false, grade = ['3'] } = {}) {
    const { run } = setup({ language, grade, emptyResources: false });
    run(`
        document.querySelector = () => null;
        document.getElementById = id => id === 'flowchart-steps' ? { innerHTML: '' } : null;
        appState.tierFlowchartData = ${readFileSync(join(__dirname, '..', 'data/tier-flowcharts.json'), 'utf8')};
        appState.selectedProgram = PROGRAM_ENGLISH;
        pathwayContext = { program: PROGRAM_ENGLISH, screener: 'dibels', grades: ${JSON.stringify(grade)} };
        renderJourney = () => {};
        completeJourneyMap = () => {};
        updateGuidedHome = () => {};
        updatePathwaySelections = () => {};
        persistProgressStorage = () => {};
        appState.visualFlowchart = {
            tierId: 'tier1', currentNodeId: 'tier1-principles',
            selectedPath: [{ nodeId: 'tier1-principles' }],
            choices: { 'tier1-principles': { id: 'completed', name: 'Reviewed' } }
        };
        showIntegratedNode(getFlowchartDefs().tier1.nodes['tier1-principles'].nextNode, 'tier1-principles', 'completed');
    `);
    if (!atResult) choose(run, 'ineffective');
    return { run };
}

function choose(run, choiceId) {
    run(`{
        const node = getFlowchartDefs().tier1.nodes[appState.visualFlowchart.currentNodeId];
        const choice = node.choices.find(item => item.id === ${JSON.stringify(choiceId)});
        makeIntegratedDecision(node.id, choice.id, choice.nextNode);
    }`);
}

const individualLeaves = [
    { weakCount: 0, lastChoice: 'proficient', outcome: 'curriculum',
        recommendation: 'Continue to provide evidence-based, curriculum-aligned instruction.' },
    { weakCount: 1, lastChoice: 'proficient', outcome: 'vocabulary',
        recommendation: 'Teach vocabulary, syntax, knowledge, and comprehension strategies.' },
    { weakCount: 2, lastChoice: 'proficient', outcome: 'fluency',
        recommendation: 'Consider fluency instruction (repeated reading, etc.) with lots of oral practice.' },
    { weakCount: 3, lastChoice: 'proficient', outcome: 'multisyllabic',
        recommendation: 'Teach multisyllabic decoding, providing lots of text-level reading.' },
    { weakCount: 4, lastChoice: 'proficient', outcome: 'phonics',
        recommendation: 'Provide explicit, systematic instruction in phonics, decoding, and spelling.' },
    { weakCount: 4, lastChoice: 'weak', outcome: 'awareness',
        recommendation: 'Teach phonemic awareness and phonics.' }
];

test('all six PDF routes reach the correct recommendation and return without erasing individual decisions', () => {
    for (const leaf of individualLeaves) {
        const { run } = setupIndividualPathway();
        assert.equal(run('appState.visualFlowchart.currentNodeId'), 'tier1-approach');
        choose(run, 'individual');
        for (let i = 0; i < leaf.weakCount; i++) choose(run, 'weak');
        choose(run, leaf.lastChoice);
        assert.equal(run('appState.visualFlowchart.currentNodeId'), `tier1-student-outcome-${leaf.outcome}`);
        assert.equal(run('getFlowchartDefs().tier1.nodes[appState.visualFlowchart.currentNodeId].description'), leaf.recommendation);
        assert.equal(run('getSessionNotes(pathwaySessions[0]).outcomes.at(-1).response'), leaf.recommendation);
        assert.equal(run('getSessionNotes(pathwaySessions[0]).outcomes.at(-1).final'), true);

        const before = run('JSON.stringify(serializeTierPathway(appState.visualFlowchart))');
        run('continueWholeClassIntegrated()');
        const after = JSON.parse(run('JSON.stringify(serializeTierPathway(appState.visualFlowchart))'));
        const original = JSON.parse(before);
        assert.deepEqual(after.selectedPath.slice(0, -1), original.selectedPath);
        for (const [id, choice] of Object.entries(original.choices)) assert.deepEqual(after.choices[id], choice);
        assert.equal(after.selectedPath.at(-1).nodeId, 'tier1-percentage');
        assert.equal(run('getSessionNotes(pathwaySessions[0]).outcomes.at(-1).final'), undefined);
        assert.match(run('getSessionNotes(pathwaySessions[0]).next'), /Whole Class Approach: Step 3: Instruction Ineffective/);

        // Validate the same serialized state used by reloads and progress transfers.
        run(`savedPathway = readSavedPathway(JSON.parse(JSON.stringify(savedPathway)));
            pathwaySessions = readPathwaySessions(JSON.parse(JSON.stringify(pathwaySessions)));`);
        assert.equal(run('savedPathway.current.selectedPath.at(-1).nodeId'), 'tier1-percentage');
        assert.equal(run('pathwaySessions[0].pathway.current.choices["tier1-approach"].id'), 'individual');
        assert.equal(run('getSessionNotes(pathwaySessions[0]).outcomes[0].response'), leaf.recommendation);

        choose(run, 'more-20');
        assert.equal(run('appState.visualFlowchart.currentNodeId'), 'tier1-reteach');
        assert.equal(run('getSessionNotes(pathwaySessions[0]).outcomes.length'), 2);
        assert.equal(run('getSessionNotes(pathwaySessions[0]).outcomes[0].final'), undefined);
        assert.equal(run('getSessionNotes(pathwaySessions[0]).outcomes[1].final'), true);
    }
});

test('Kindergarten through Grade 2 use the risk-area pathway and the phonemic-awareness success follow-up', () => {
    const riskAreas = [
        ['phonemic-awareness', 'tier1-student-k2-awareness', 'tier1_recommend_awareness'],
        ['decoding', 'tier1-student-k2-decoding', 'tier1_recommend_phonics'],
        ['accuracy', 'tier1-student-k2-accuracy', 'tier1_recommend_multisyllabic'],
        ['rate', 'tier1-student-k2-rate', 'tier1_k2_recommend_fluency'],
        ['comprehension', 'tier1-student-k2-comprehension', 'tier1_k2_recommend_comprehension']
    ];
    for (const grade of ['K', '1', '2']) {
        for (const language of ['en', 'fr']) {
            for (const [riskArea, nextNode, recommendation] of riskAreas) {
                const { run } = setupIndividualPathway(language, { grade: [grade] });
                choose(run, 'individual');
                assert.equal(run('appState.visualFlowchart.currentNodeId'), 'tier1-student-risk');
                assert.deepEqual(
                    JSON.parse(run('JSON.stringify(getFlowchartDefs().tier1.nodes["tier1-student-risk"].choices.map(choice => choice.id))')),
                    riskAreas.map(([id]) => id)
                );
                choose(run, riskArea);
                if (riskArea === 'phonemic-awareness') {
                    assert.equal(run('appState.visualFlowchart.currentNodeId'), nextNode);
                    assert.equal(run('getFlowchartDefs().tier1.nodes[appState.visualFlowchart.currentNodeId].title'),
                        run('t("tier1_k2_recommend_awareness")'));
                    choose(run, 'successful');
                    assert.equal(run('appState.visualFlowchart.currentNodeId'), 'tier1-student-k2-outcome-phonics');
                    assert.equal(run('getFlowchartDefs().tier1.nodes[appState.visualFlowchart.currentNodeId].description'),
                        run('t("tier1_recommend_phonics")'));
                } else {
                    assert.equal(run('appState.visualFlowchart.currentNodeId'), nextNode);
                    assert.equal(run('getFlowchartDefs().tier1.nodes[appState.visualFlowchart.currentNodeId].description'),
                        run(`t(${JSON.stringify(recommendation)})`));
                }
            }
        }
    }
});

test('risk-area dropdown routes each selection and shows the saved choice read-only in review', () => {
    for (const language of ['en', 'fr']) {
        for (const riskArea of ['phonemic-awareness', 'decoding', 'accuracy', 'rate', 'comprehension']) {
            const { run } = setupIndividualPathway(language, { grade: ['1'] });
            choose(run, 'individual');
            const html = run('createIntegratedDecisionNode(getTier1ApproachNodes()["tier1-student-risk"])');
            assert.match(html, /<select class="fw-select" aria-label="[^"]+"/);
            assert.match(html, /<option value="" disabled selected>/);
            assert.equal((html.match(/data-next-node=/g) || []).length, 5);
            assert.doesNotMatch(html, /class="decision-btn/);
            const handler = html.match(/onchange="([^"]+)"/)[1];
            run(`{
                const node = getTier1ApproachNodes()["tier1-student-risk"];
                const choice = node.choices.find(item => item.id === ${JSON.stringify(riskArea)});
                (function () { ${handler} }).call({
                    value: choice.id, selectedOptions: [{ dataset: { nextNode: choice.nextNode } }]
                });
            }`);
            assert.equal(run('appState.visualFlowchart.choices["tier1-student-risk"].id'), riskArea);
            const review = run('buildStepReviewContent(getTier1ApproachNodes()["tier1-student-risk"], appState.visualFlowchart.choices["tier1-student-risk"])');
            assert.match(review, /<select[^>]+disabled/);
            assert.match(review, new RegExp(`<option value="${riskArea}"\\s+data-next-node="[^"]+" selected>`));
            assert.doesNotMatch(review, /onchange=/);
        }
    }
});

test('phonemic-awareness follow-up clearly indicates successful instruction before continuing', () => {
    for (const language of ['en', 'fr']) {
        const { run } = setupIndividualPathway(language, { grade: ['K'] });
        choose(run, 'individual');
        choose(run, 'phonemic-awareness');
        const html = run('createIntegratedDecisionNode(getTier1ApproachNodes()["tier1-student-k2-awareness"])');
        assert.ok(html.includes(run('t("tier1_k2_successful")')));
        const hint = `<p class="decision-hint"><em>${run('t("tier1_k2_successful_hint")')}</em></p>`;
        assert.ok(html.includes(hint));
        assert.ok(html.indexOf(hint) > html.indexOf('</button>', html.indexOf('class="decision-btn')));
        assert.match(html, /class="decision-grid decision-grid-with-hint"/);
        assert.match(html, /class="decision-trend-icon" aria-hidden="true">✓/);
        choose(run, 'successful');
        assert.equal(run('appState.visualFlowchart.currentNodeId'), 'tier1-student-k2-outcome-phonics');
    }
});

test('choosing whole class follows the existing result pathways without adding student decisions', () => {
    const { run: effectiveRun } = setupIndividualPathway('en', { atResult: true });
    choose(effectiveRun, 'effective');
    assert.equal(effectiveRun('appState.visualFlowchart.currentNodeId'), 'tier1-success');
    assert.equal(effectiveRun('appState.visualFlowchart.selectedPath.some(step => step.nodeId === "tier1-approach")'), false);

    for (const [choice, endpoint] of [['more-20', 'tier1-reteach'], ['less-20', 'tier1-move-tier2']]) {
        const { run } = setupIndividualPathway();
        choose(run, 'whole-class');
        assert.equal(run('appState.visualFlowchart.currentNodeId'), 'tier1-percentage');
        run('window.startTier2VisualIntegrated = () => {}');
        choose(run, choice);
        assert.equal(run('appState.visualFlowchart.currentNodeId'), endpoint);
        assert.equal(run('appState.visualFlowchart.selectedPath.some(step => step.nodeId.startsWith("tier1-student-"))'), false);
    }
});

test('older whole-class sessions migrate in both languages and invalid student shortcuts are rejected', () => {
    for (const language of ['en', 'fr']) {
        const { run } = setupIndividualPathway(language);
        run(`const legacy = {
            tierId: 'tier1',
            selectedPath: [{ nodeId: 'tier1-principles' }, { nodeId: 'tier1-effectiveness' }, { nodeId: 'tier1-percentage' }],
            choices: { 'tier1-principles': { id: 'completed' }, 'tier1-effectiveness': { id: 'ineffective' } }
        };`);
        assert.equal(run('validateTierPathway(legacy).choices["tier1-approach"].id'), 'whole-class');
        assert.equal(run('validateTierPathway(legacy).selectedPath[2].nodeId'), 'tier1-approach');
        choose(run, 'individual');
        run(`const invalid = serializeTierPathway(appState.visualFlowchart);
            invalid.selectedPath.push({ nodeId: 'tier1-percentage' });`);
        assert.equal(run('validateTierPathway(invalid)'), null);
    }
});

test('DOCX records the scoped student findings, recommendation, return, and whole-class outcome in order', async () => {
    for (const language of ['en', 'fr']) {
        const { run } = setupIndividualPathway(language);
        choose(run, 'individual');
        choose(run, 'weak');
        choose(run, 'proficient');
        run('continueWholeClassIntegrated()');
        choose(run, 'more-20');
        const notes = run('getSessionNotes(pathwaySessions[0])');
        const blob = run('buildSessionNotesDocx(getSessionNotes(pathwaySessions[0]))');
        const zip = Buffer.from(await blob.arrayBuffer());
        let documentXml;
        for (let offset = 0; zip.readUInt32LE(offset) === 0x04034b50;) {
            const size = zip.readUInt32LE(offset + 18);
            const nameLength = zip.readUInt16LE(offset + 26);
            const extraLength = zip.readUInt16LE(offset + 28);
            const name = zip.subarray(offset + 30, offset + 30 + nameLength).toString();
            const start = offset + 30 + nameLength + extraLength;
            if (name === 'word/document.xml') documentXml = zip.subarray(start, start + size).toString();
            offset = start + size;
        }
        assert.ok(documentXml);
        const text = [...documentXml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(match => match[1]).join('\n');
        const individualLabel = run('t("tier1_individual")');
        const wholeClassLabel = run('t("tier1_whole_class")');
        const comprehension = `${individualLabel}: ${run('t("tier1_student_comprehension")')}`;
        const rate = `${individualLabel}: ${run('t("tier1_student_rate")')}`;
        const recommendation = run('t("tier1_recommend_vocabulary")');
        const returnAction = run('t("tier1_return_whole_class")');
        const result = `${wholeClassLabel}: ${run('stripEmoji(getFlowchartDefs().tier1.nodes["tier1-percentage"].title)')}`;
        const stepsText = text.slice(text.indexOf(comprehension));
        const ordered = [comprehension, rate, recommendation, returnAction, result];
        let lastIndex = -1;
        for (const value of ordered) {
            const index = stepsText.indexOf(value);
            assert.ok(index > lastIndex, `${language}: missing or out-of-order ${value}`);
            lastIndex = index;
        }
        const tableRows = [...documentXml.matchAll(/<w:tr>([\s\S]*?)<\/w:tr>/g)].map(match => match[1]);
        const rowFor = value => tableRows.find(row => row.includes(`<w:t xml:space="preserve">${value}</w:t>`));
        for (const value of [comprehension, rate]) {
            const row = rowFor(value);
            assert.ok(row, `${language}: missing DOCX row for ${value}`);
            assert.equal((row.match(/<w:shd w:val="clear" w:color="auto" w:fill="F4CCCC"\/>/g) || []).length, 3);
        }
        const wholeClassRow = rowFor(result);
        assert.ok(wholeClassRow, `${language}: missing DOCX row for ${result}`);
        assert.doesNotMatch(wholeClassRow, /w:fill="F4CCCC"/);
        assert.ok(notes.outcomes[0].title.startsWith(individualLabel));
        assert.ok(notes.outcomes[1].title.startsWith(wholeClassLabel));
        assert.equal(notes.outcomes[1].final, true);
        assert.equal(notes.steps.filter(step => step.response === recommendation).length, 1);
    }
});

test('the approach choice follows Step 2 and is replaced by either approach at Step 3', () => {
    for (const language of ['en', 'fr']) {
        for (const approach of ['whole-class', 'individual']) {
            const { run } = setupIndividualPathway(language, { atResult: true });
            assert.equal(run('appState.visualFlowchart.currentNodeId'), 'tier1-effectiveness');
            assert.equal(run('getActiveStepNumber()'), 2);
            assert.equal(run('getVisualFlowchartEntries().at(-1).number'), 2);
            choose(run, 'ineffective');
            assert.equal(run('appState.visualFlowchart.currentNodeId'), 'tier1-approach');
            assert.equal(run('getActiveStepNumber()'), 3);
            assert.equal(run('getVisualFlowchartEntries().at(-1).number'), 3);

            choose(run, approach);
            const nextId = approach === 'whole-class' ? 'tier1-percentage' : 'tier1-student-comprehension';
            assert.equal(run('appState.visualFlowchart.currentNodeId'), nextId);
            assert.equal(run('getActiveStepNumber()'), 3);
            assert.equal(run('getVisualFlowchartEntries().at(-1).number'), 3);
            assert.equal(run('getJourneyDisplayPath().some(step => step.nodeId === "tier1-approach")'), false);
            assert.equal(run('getVisualFlowchartEntries().some(entry => entry.node.id === "tier1-approach")'), false);
            assert.doesNotMatch(run('buildCompletedTrailHTML()'), /tier1-approach/);
            assert.equal(run('appState.visualFlowchart.choices["tier1-approach"].id'), approach);
            run(`const restored = validateTierPathway(serializeTierPathway(appState.visualFlowchart));`);
            assert.equal(run('getJourneyDisplayPath(restored).at(-1).nodeId'), nextId);
            assert.equal(run('getJourneyDisplayPath(restored).length'), 3);

            run('goToPreviousStep()');
            assert.equal(run('appState.visualFlowchart.currentNodeId'), 'tier1-approach');
            assert.equal(run('getActiveStepNumber()'), 3);
            choose(run, approach === 'whole-class' ? 'individual' : 'whole-class');
            assert.equal(run('getActiveStepNumber()'), 3);
        }
    }
});

test('individual cards use an approach title and a prominent skill heading without the redundant question', () => {
    for (const language of ['en', 'fr']) {
        const { run } = setupIndividualPathway(language);
        const nodes = run('Object.values(getTier1ApproachNodes()).filter(node => node.approach === "individual")');
        for (const node of nodes) {
            run(`studentNode = getTier1ApproachNodes()[${JSON.stringify(node.id)}]`);
            assert.equal(run('getStepCardTitle(studentNode)'), run('t("tier1_individual")'));
            if (node.type !== 'decision') continue;
            const html = run('createIntegratedDecisionNode(studentNode)');
            const body = html.slice(html.indexOf('<div class="step-content">'));
            assert.ok(body.includes(`<h3>${node.title}</h3>`));
            assert.ok(body.includes(node.description));
            assert.ok(!body.includes(run('t("tier1_individual")')));
            assert.equal(node.subtitle, undefined);
            assert.ok(body.includes(run('t("tier1_weak")')));
            assert.ok(body.includes(run('t("tier1_proficient")')));
        }
    }
});

test('the approach chooser and individual outcomes show only their primary message above the actions', () => {
    for (const language of ['en', 'fr']) {
        const { run } = setupIndividualPathway(language);
        const chooser = run('createIntegratedDecisionNode(getTier1ApproachNodes()["tier1-approach"])');
        assert.ok(chooser.includes(`<h3>${language === 'en' ? 'Choose an approach' : 'Choisir une approche'}</h3>`));
        assert.doesNotMatch(chooser, /<p>/);
        for (const leaf of individualLeaves) {
            const html = run(`createIntegratedEndpointNode(getTier1ApproachNodes()["tier1-student-outcome-${leaf.outcome}"])`);
            const message = run(`t("tier1_recommend_${leaf.outcome}")`);
            assert.ok(html.includes(`<h3 class="individual-recommendation">${message}</h3>`));
            assert.doesNotMatch(html, /<h2>/);
            assert.ok(html.includes('continueWholeClassIntegrated()'));
            assert.ok(html.includes('closePathwaySession()'));
        }
    }
});

function renderVisualPathway(run) {
    run(`
        globalThis.testStage = { style: {}, innerHTML: '', querySelector: () => null };
        {
            const lookup = document.getElementById;
            document.getElementById = id => id === 'visual-flowchart-stage' ? testStage
                : id === 'visual-flowchart-viewport' ? {} : lookup(id);
            requestAnimationFrame = () => {};
            wireVisualFlowchartPanZoom = () => {};
            updateVisualFlowchartTierBar = () => {};
            refreshVisualFlowchartModal();
            document.getElementById = lookup;
        }
    `);
    return run('testStage.innerHTML');
}

test('terminal pathway actions use a separate footer in both languages and endpoint renderers', () => {
    for (const language of ['en', 'fr']) {
        const { run } = setupIndividualPathway(language);
        choose(run, 'individual');
        choose(run, 'proficient');
        run('appState.visualFlowchartModal = { expandedTiers: new Set() };');
        const visual = renderVisualPathway(run);
        const integrated = run('createIntegratedEndpointNode(appState.visualFlowchart.summaryEndpointNodeData)');
        for (const html of [visual, integrated]) {
            const footer = html.match(/<div class="pathway-card-actions">([\s\S]*?)<\/div>/)?.[1];
            assert.ok(footer, 'Endpoint actions must be in a separate footer');
            assert.match(footer, /onclick="continueWholeClassIntegrated\(\)"/);
            assert.match(footer, /onclick="downloadSessionNotes\(activePathwaySessionId\)"/);
            assert.match(footer, /onclick="closePathwaySession\(\)"/);
            assert.ok(footer.includes(language === 'en' ? 'Download summary' : 'Télécharger le résumé'));
            assert.doesNotMatch(footer, /action-primary|action-secondary|visual-flowchart-tier-review-btn/);
        }
        assert.match(visual, /<\/span>\s*<div class="pathway-card-actions">/);
        run('continueWholeClassIntegrated()');
        const decision = run('createIntegratedDecisionNode(getFlowchartDefs().tier1.nodes[appState.visualFlowchart.currentNodeId])');
        assert.doesNotMatch(decision, /pathway-card-actions|pathway-card-action"/);
    }
});

test('potential endpoints and tier review cards keep their continuation controls in the footer', () => {
    for (const choice of ['more-20', 'less-20']) {
        const { run } = setupIndividualPathway();
        run('requestAnimationFrame = () => {};');
        choose(run, 'whole-class');
        choose(run, choice);
        run('appState.visualFlowchartModal = { expandedTiers: new Set() };');
        const html = renderVisualPathway(run);
        const handler = choice === 'more-20' ? 'restartTier1VisualIntegrated' : 'confirmVisualFlowchartTierTransition';
        assert.match(html, new RegExp(`<div class="pathway-card-actions">\\s*<button[^>]+onclick="${handler}\\(\\)"`));
        if (choice === 'less-20') {
            run(`
                appState.visualFlowchart.pendingTierTransition = 'tier3';
                appState.visualFlowchart.currentNodeId = null;
            `);
            const review = renderVisualPathway(run);
            assert.match(review, /visual-flowchart-card-tier-review/);
            assert.match(review, /<\/span>\s*<div class="pathway-card-actions">\s*<button[^>]+onclick="confirmVisualFlowchartTierTransition\(\)"/);
        }
    }
});

function assertSingleRow(html) {
    const tops = [...html.matchAll(/style="left:(\d+)px;top:(\d+)px;width:(\d+)px"/g)];
    assert.ok(tops.length > 1);
    assert.equal(new Set(tops.map(match => match[2])).size, 1);
    for (let i = 1; i < tops.length; i++) {
        assert.ok(Number(tops[i][1]) > Number(tops[i - 1][1]) + Number(tops[i - 1][3]));
    }
    const connectors = [...html.matchAll(/d="M \d+ (\d+) C \d+ (\d+), \d+ (\d+), \d+ (\d+)"/g)];
    assert.equal(connectors.length, tops.length - 1);
    for (const connector of connectors) assert.equal(new Set(connector.slice(1)).size, 1);
}

test('individual decisions and outcomes remain on a single row', () => {
    const { run } = setupIndividualPathway();
    run('appState.visualFlowchartModal = { expandedTiers: new Set() };');
    choose(run, 'individual');
    for (let i = 0; i < 5; i++) {
        choose(run, 'weak');
        assertSingleRow(renderVisualPathway(run));
    }
});

test('classic layout restores outcome-based row shifts while keeping classic straight-route exceptions', () => {
    const { run } = setupIndividualPathway();
    const { single, classic } = JSON.parse(run(`JSON.stringify((() => {
        const items = [
            { type: 'entry', variant: 'effective', entry: { node: { id: 'tier1-effectiveness' } } },
            { type: 'entry', variant: 'ineffective', entry: { node: { id: 'tier2-progress' } } },
            { type: 'entry', variant: 'effective', entry: { node: { approach: 'individual' } } },
            { type: 'entry', variant: 'ineffective', entry: { node: { id: 'tier1-percentage' }, choice: { id: 'less-20' } } },
            { type: 'collapsed', variant: 'ineffective' },
            { type: 'tier-review', variant: 'step1' }
        ];
        return {
            single: layoutVisualFlowchartCards(items, () => 220),
            classic: layoutVisualFlowchartCards(items, () => 220, true)
        };
    })())`));
    assert.deepEqual(classic.positions.map(({ y }) => y), [270, 90, 270, 270, 270, 270]);
    assert.deepEqual(classic.positions.map(({ x }) => x), single.positions.map(({ x }) => x));
    assert.ok(classic.stageHeight > single.stageHeight);
});

test('the Settings layout choice changes card routing and persists across visits', () => {
    function setupLayoutSettings(savedLayout) {
        const { run } = setupIndividualPathway('en', { atResult: true });
        choose(run, 'effective');
        run(`
            globalThis.storedLayout = ${JSON.stringify(savedLayout)};
            globalThis.layoutSelect = {
                addEventListener(event, listener) { this[event] = listener; }
            };
            const layoutStatus = { textContent: '' };
            globalThis.localStorage = {
                getItem: key => key === 'literacy-interventions-visual-flowchart-layout' ? storedLayout : null,
                setItem: (key, value) => {
                    if (key === 'literacy-interventions-visual-flowchart-layout') storedLayout = value;
                }
            };
            const lookup = document.getElementById;
            document.getElementById = id => id === 'settings-visual-flowchart-layout' ? layoutSelect
                : id === 'settings-visual-flowchart-layout-status' ? layoutStatus : lookup(id);
            initializeVisualFlowchartLayoutPreference();
            appState.visualFlowchartModal = { expandedTiers: new Set() };
        `);
        return run;
    }

    const run = setupLayoutSettings(null);
    assert.equal(run('layoutSelect.value'), 'single');
    assertSingleRow(renderVisualPathway(run));

    run('layoutSelect.value = "classic"; layoutSelect.change();');
    const classic = renderVisualPathway(run);
    const tops = [...classic.matchAll(/style="left:\d+px;top:(\d+)px;width:\d+px"/g)].map(match => Number(match[1]));
    assert.ok(tops.at(-1) < tops.at(-2));
    const saved = run('storedLayout');
    assert.equal(saved, 'classic');
    const returningVisit = setupLayoutSettings(saved);
    assert.equal(returningVisit('layoutSelect.value'), 'classic');
    assert.equal(renderVisualPathway(returningVisit), classic);

    returningVisit('layoutSelect.value = "single"; layoutSelect.change();');
    assertSingleRow(renderVisualPathway(returningVisit));
    assert.equal(returningVisit('storedLayout'), 'single');
});

test('tier changes, expanded history and review cards keep one row and independent card variants', () => {
    const { run } = setupIndividualPathway();
    run(`
        appState.visualFlowchart.tierId = 'tier3';
        appState.visualFlowchart.currentNodeId = null;
        appState.visualFlowchart.pendingTierTransition = 'tier2';
        appState.visualFlowchartModal = { expandedTiers: new Set(['tier1', 'tier2']) };
        getVisualFlowchartEntries = () => ['tier1', 'tier2', 'tier3'].flatMap(tierId =>
            ['effective', 'ineffective'].map((variant, index) => ({
                tierId, tierLabel: tierId, variant, number: index + 1,
                node: { id: tierId + '-' + variant, type: 'info', title: variant }
            }))
        );
    `);
    const expanded = renderVisualPathway(run);
    assertSingleRow(expanded);
    for (const tier of ['tier1', 'tier2', 'tier3']) {
        for (const variant of ['effective', 'ineffective']) {
            assert.match(expanded, new RegExp(`data-tier="${tier}" class="visual-flowchart-card visual-flowchart-card-${variant}`));
        }
    }
    assert.match(expanded, /visual-flowchart-card-tier-review visual-flowchart-card-current"\s+data-tier="tier3"/);
    run('appState.visualFlowchartModal.expandedTiers.clear();');
    const collapsed = renderVisualPathway(run);
    assertSingleRow(collapsed);
    for (const tier of ['tier1', 'tier2']) {
        assert.match(collapsed, new RegExp(`visual-flowchart-card-collapsed visual-flowchart-card-ineffective"\\s+data-tier="${tier}"`));
    }
});

test('fitting pins the row high and keeps a tall active card visible when the viewport shrinks', () => {
    const { run } = setupIndividualPathway();
    const { initialTop, resizedCard, resizedScale } = run(`
        (() => {
            const activeCard = {
                offsetLeft: 1200, offsetTop: 90, offsetWidth: 360, offsetHeight: 450,
                classList: { contains: () => false }
            };
            const firstCard = { offsetLeft: 90, offsetTop: 90, offsetWidth: 280, offsetHeight: 210 };
            const stage = {
                style: {},
                querySelector: selector => selector === '.visual-flowchart-card-current' ? activeCard : null,
                querySelectorAll: () => [firstCard, activeCard]
            };
            const viewport = { clientWidth: 1700, clientHeight: 900 };
            const state = appState.visualFlowchartModal = { scale: 1 };
            document.getElementById = id => id === 'visual-flowchart-stage' ? stage
                : id === 'visual-flowchart-viewport' ? viewport : null;
            fitRenderedVisualFlowchart(stage, viewport);
            const initialTop = state.y + activeCard.offsetTop * state.scale;
            viewport.clientWidth = 640;
            viewport.clientHeight = 255;
            fitRenderedVisualFlowchart(stage, viewport);
            return { initialTop, resizedScale: state.scale, resizedCard: {
                left: state.x + activeCard.offsetLeft * state.scale,
                right: state.x + (activeCard.offsetLeft + activeCard.offsetWidth) * state.scale,
                top: state.y + activeCard.offsetTop * state.scale,
                bottom: state.y + (activeCard.offsetTop + activeCard.offsetHeight) * state.scale
            } };
        })()
    `);
    assert.ok(initialTop >= 40 && initialTop <= 60);
    assert.ok(resizedScale < 1);
    assert.ok(resizedCard.left >= 0 && resizedCard.right <= 640);
    assert.ok(resizedCard.top >= 0 && resizedCard.bottom <= 255);
});

test('returning to whole class collapses the reviewable individual detour and restores direct-route numbering', () => {
    for (const language of ['en', 'fr']) {
        for (const leaf of individualLeaves) {
            const { run } = setupIndividualPathway(language);
            choose(run, 'individual');
            for (let i = 0; i < leaf.weakCount; i++) choose(run, 'weak');
            choose(run, leaf.lastChoice);
            assert.equal(run('buildVisualFlowchartDisplayItems(getVisualFlowchartEntries()).some(item => item.type === "collapsed")'), false);
            run('continueWholeClassIntegrated()');
            assert.equal(run('getActiveStepNumber()'), 3);
            assert.equal(run('getVisualFlowchartEntries().at(-1).number'), 3);
            const collapsed = run('buildVisualFlowchartDisplayItems(getVisualFlowchartEntries()).find(item => item.type === "collapsed")');
            assert.equal(collapsed.tierId, 'tier1-individual');
            assert.equal(collapsed.entries.length, leaf.weakCount + 2);
            assert.equal(collapsed.entries.at(-1).node.type, 'endpoint');
            assert.equal(collapsed.entries[0].tierId, 'tier1');

            run('appState.visualFlowchartModal = { expandedTiers: new Set() };');
            const closedHtml = renderVisualPathway(run);
            assert.match(closedHtml, /id="visual-flowchart-individual-review"[^>]+hidden/);
            run('appState.visualFlowchartModal.expandedTiers.add("tier1-individual");');
            const openHtml = renderVisualPathway(run);
            assert.doesNotMatch(openHtml, /id="visual-flowchart-individual-review"[^>]+hidden/);
            const coordinates = html => html.match(/style="left:\d+px;top:\d+px;width:\d+px"/g);
            assert.deepEqual(coordinates(openHtml), coordinates(closedHtml));
            const panel = openHtml.slice(openHtml.indexOf('id="visual-flowchart-individual-review"'));
            assert.match(panel, new RegExp(run('t("tier1_student_comprehension")')));
            assert.equal(run('getVisualFlowchartEntries().at(-1).number'), 3);
            run('appState.visualFlowchartModal.expandedTiers.clear();');
            assert.equal(run('buildVisualFlowchartDisplayItems(getVisualFlowchartEntries()).filter(item => item.type === "collapsed").length'), 1);
            run(`appState.visualFlowchart = validateTierPathway(serializeTierPathway(appState.visualFlowchart));
                appState.visualFlowchart.currentNodeId = appState.visualFlowchart.selectedPath.at(-1).nodeId;`);
            assert.equal(run('getActiveStepNumber()'), 3);
            assert.equal(run('buildVisualFlowchartDisplayItems(getVisualFlowchartEntries()).filter(item => item.type === "collapsed").length'), 1);
            run('appState.visualFlowchartModal = null;');
            choose(run, 'more-20');
            assert.equal(run('getActiveStepNumber()'), 4);
            assert.equal(run('getVisualFlowchartEntries().at(-1).number'), 4);
        }
    }
});
