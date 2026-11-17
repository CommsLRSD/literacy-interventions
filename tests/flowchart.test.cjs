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

function setupIndividualPathway(language = 'en', { atResult = false } = {}) {
    const { run } = setup({ language, emptyResources: false });
    run(`
        document.querySelector = () => null;
        document.getElementById = id => id === 'flowchart-steps' ? { innerHTML: '' } : null;
        appState.tierFlowchartData = ${readFileSync(join(__dirname, '..', 'data/tier-flowcharts.json'), 'utf8')};
        appState.selectedProgram = PROGRAM_ENGLISH;
        pathwayContext = { program: PROGRAM_ENGLISH, screener: 'dibels', grades: ['1'] };
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

test('individual decisions route laterally for both choices without changing other decision routes', () => {
    const { run } = setupIndividualPathway();
    choose(run, 'individual');
    for (let i = 0; i < 5; i++) {
        choose(run, 'weak');
        assert.equal(run(`getVisualFlowchartRouteDirection({
            type: 'entry', entry: getVisualFlowchartEntries().at(-2),
            variant: getVisualFlowchartEntries().at(-2).variant
        })`), 'straight');
    }
    assert.equal(run(`getVisualFlowchartRouteDirection({
        type: 'entry', entry: { node: getTier1ApproachNodes()['tier1-student-comprehension'] },
        variant: 'effective'
    })`), 'straight');
    assert.equal(run(`getVisualFlowchartRouteDirection({
        type: 'entry', entry: { node: { id: 'tier1-effectiveness' } }, variant: 'ineffective'
    })`), 'down');
    assert.equal(run(`getVisualFlowchartRouteDirection({
        type: 'entry', entry: { node: { id: 'tier2-progress' } }, variant: 'effective'
    })`), 'up');
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
            assert.equal(run('getVisualFlowchartRouteDirection(buildVisualFlowchartDisplayItems(getVisualFlowchartEntries()).at(-2))'), 'straight');

            run(`appState.visualFlowchartModal = { expandedTiers: new Set(), x: 10, y: 20, scale: 1 };
                refreshVisualFlowchartModal = () => {};
                applyVisualFlowchartTransform = () => {};
                toggleVisualFlowchartTier('tier1-individual');`);
            const expanded = run('buildVisualFlowchartDisplayItems(getVisualFlowchartEntries()).filter(item => item.expandedTierId === "tier1-individual")');
            assert.equal(expanded.length, collapsed.entries.length);
            assert.equal(expanded.at(-1).endsExpandedTier, true);
            assert.equal(expanded[0].entry.node.id, 'tier1-student-comprehension');
            assert.equal(run('getVisualFlowchartEntries().at(-1).number'), 3);
            run("toggleVisualFlowchartTier('tier1-individual')");
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
