const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

const root = join(__dirname, '..');
const read = path => readFileSync(join(root, path), 'utf8');

function setup() {
    const elements = new Map();
    const listeners = new Map();
    const storage = new Map();
    const element = () => ({
        hidden: false, disabled: false, textContent: '', value: '', children: [], handlers: new Map(),
        dataset: {}, attributes: new Map(), classes: new Set(),
        classList: {
            toggle(name, active) { if (active) this.owner.classes.add(name); else this.owner.classes.delete(name); },
            contains(name) { return this.owner.classes.has(name); }
        },
        get innerHTML() {
            return String(this.textContent).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        },
        addEventListener(name, callback) { this.handlers.set(name, callback); },
        replaceChildren(...children) { this.children = children; },
        append(...children) { this.children.push(...children); },
        appendChild(child) { this.children.push(child); },
        close() { this.open = false; },
        setAttribute(name, value) { this.attributes.set(name, value); },
        focus() { this.focused = true; }
    });
    const getElement = id => {
        if (!elements.has(id)) {
            const item = element();
            item.id = id;
            item.classList.owner = item;
            elements.set(id, item);
        }
        return elements.get(id);
    };
    const pages = ['home', 'settings'];
    const navigation = prefix => pages.map(page => {
        const item = getElement(`${prefix}-${page}`);
        item.dataset.page = page;
        return item;
    });
    const context = vm.createContext({
        console, URL, Blob, TextEncoder, TextDecoder, CompressionStream, DecompressionStream,
        btoa, atob, structuredClone, crypto: webcrypto,
        document: {
            body: { dataset: {} },
            baseURI: 'https://example.org/literacy-interventions/',
            addEventListener() {}, getElementById: getElement, createElement: element,
            querySelector: selector => selector === '#settings-section .section-title' ? getElement('settings-title') : null,
            querySelectorAll: selector => selector === '.nav-link' ? navigation('desktop')
                : selector === '.mobile-nav-item' ? navigation('mobile')
                : selector === '.content-section' ? pages.map(page => getElement(`${page}-section`)) : []
        },
        window: {
            location: { href: 'https://example.org/literacy-interventions/', hash: '', pathname: '/literacy-interventions/', search: '', reloads: 0,
                reload() { this.reloads++; } },
            confirm: () => true,
            scrollTo() {},
            addEventListener(name, callback) { listeners.set(name, callback); },
            matchMedia: () => ({ matches: false, addEventListener() {} })
        },
        navigator: {},
        localStorage: {
            getItem: key => storage.get(key) ?? null,
            setItem: (key, value) => storage.set(key, value),
            removeItem: key => storage.delete(key)
        },
        sessionStorage: {
            getItem: key => storage.get(`session:${key}`) ?? null,
            setItem: (key, value) => storage.set(`session:${key}`, value),
            removeItem: key => storage.delete(`session:${key}`)
        },
        history: { replaceState() {} }
    });
    const run = source => vm.runInContext(source, context);
    for (const file of ['translations.js', 'app.js', 'transfer.js']) run(read(file));
    run(`
        appState.tierFlowchartData = ${read('data/tier-flowcharts.json')};
        appState.interventionMenuData = ${read('data/intervention-menu.json')};
        schedulesData = ${read('data/assessment-schedules.json')};
        appState.selectedProgram = PROGRAM_ENGLISH;
        appState.language = 'en';
        appReady = true;
        const session = {
            id: 'active-session', number: 1, startedAt: 1700000000000, status: 'draft',
            context: { program: PROGRAM_ENGLISH, screener: 'dibels', grades: ['1'] },
            choices: [], resources: [],
            pathway: { version: 2, program: PROGRAM_ENGLISH,
                context: { program: PROGRAM_ENGLISH, screener: 'dibels', grades: ['1'] },
                current: { tierId: 'tier1', selectedPath: [{ nodeId: getFlowchartDefs().tier1.startNode }],
                    choices: {}, checklistChecked: {}, layoutMode: 'summary' },
                fullJourney: [], filters: {} }
        };
        pathwaySessions = [session, { ...session, id: 'archived', status: 'completed', pathway: null }];
        savedPathway = session.pathway;
        activePathwaySessionId = session.id;
        pathwayDefaults = { English: { screener: 'dibels', grades: ['1'], pillar: 'Phonics' } };
        favouriteIds = new Set([getAllResources()[0].id]);
        localStorage.setItem(MENU_LANGUAGE_KEY, PROGRAM_FRENCH_IMMERSION);
        localStorage.setItem(SCHEDULE_GRADE_PREFERENCE_KEY, JSON.stringify(
            Object.fromEntries(schedulesData.programs.map(program => [program.id, [program.grades[0].id]]))));
        savePathwayProgress = () => {};
        closeMobileMenu = () => {};
        closeResourceCentreDrawer = () => {};
        setHomeDrawerOpen = () => {};
        clearFavouriteFeedback = () => {};
        closeVisualFlowchartModal = () => {};
        updateGuidedHome = () => {};
        getSessionNotes = item => ({ date: new Date(item.startedAt), program: item.context.program,
            grade: item.context.grades[0], screener: item.context.screener });
    `);
    return { context, run, getElement, storage, listeners };
}

test('Settings is a full screen in both navigation menus with visible transfer steps', () => {
    const html = read('index.html');
    const desktop = html.slice(html.indexOf('<nav class="side-nav"'), html.indexOf('<!-- Mobile nav overlay'));
    const mobile = html.slice(html.indexOf('<!-- Mobile nav overlay'), html.indexOf('<!-- Backdrop'));
    for (const navigation of [desktop, mobile]) {
        assert.equal((navigation.match(/data-page="settings"/g) || []).length, 1);
        assert.match(navigation, /translate="no">settings<\/span>/);
        assert.match(navigation, /data-i18n="settings_title">Settings/);
        assert.doesNotMatch(navigation, /onclick="hardResetApp\(\)"/);
    }
    assert.doesNotMatch(html, /progress-transfer-dialog|openProgressTransfer/);
    const settings = html.slice(html.indexOf('<section id="settings-section"'), html.indexOf('<!-- ── HOME'));
    assert.match(settings, /data-i18n="settings_title">Settings/);
    for (const handler of ['emailProgressTransfer', 'previewEmailedProgressLink', 'restoreProgressTransfer', 'hardResetApp']) {
        assert.ok(settings.includes(`onclick="${handler}()"`));
    }
    assert.doesNotMatch(settings, /<details|<dialog/);
    assert.equal((settings.match(/class="transfer-steps"/g) || []).length, 2);
    assert.match(settings, /role="switch"/);
});

test('Settings navigation updates page selection, title and focus, and leaving cancels previews', async () => {
    const { context, getElement } = setup();
    getElement('settings-title').textContent = 'Settings';
    context.navigateToPage('settings');
    assert.equal(context.document.body.dataset.page, 'settings');
    assert.equal(getElement('settings-section').classes.has('active'), true);
    assert.equal(getElement('home-section').classes.has('active'), false);
    assert.equal(getElement('desktop-settings').attributes.get('aria-selected'), 'true');
    assert.equal(getElement('mobile-settings').classes.has('active'), true);
    assert.equal(getElement('mobile-page-title').textContent, 'Settings');
    assert.equal(getElement('settings-title').focused, true);
    await context.previewProgressTransfer(await context.encodeProgressTransfer(context.captureProgressTransfer()));
    context.navigateToPage('home');
    await context.restoreProgressTransfer();
    assert.equal(getElement('transfer-restore').hidden, true);
    assert.equal(context.window.location.reloads, 0);
    context.navigateToPage('settings');
    assert.equal(getElement('transfer-email').disabled, false);
});

test('only the Tier 1 benchmark phrase toggles the existing guidance in either pathway view', () => {
    const { context, run, getElement } = setup();
    for (const language of ['en', 'fr']) {
        run(`appState.language = '${language}';`);
        const node = context.getFlowchartDefs().tier1.nodes['tier1-percentage'];
        const html = context.createIntegratedDecisionNode(node);
        if (language === 'en') {
            assert.equal(node.subtitle, 'Based on screener results, what percentage of students are below the benchmark?');
        }
        const question = html.match(/<h3>([\s\S]*?)<\/h3>/)[1];
        const trigger = question.match(/<button[^>]*>([^<]+)<\/button>/);
        assert.equal(trigger[1], language === 'en' ? 'below the benchmark' : 'en dessous du niveau de référence');
        assert.equal(question.replace(trigger[0], trigger[1]), node.subtitle);
        assert.ok(question.indexOf('<button') > 0);
        assert.equal((question.match(/<button/g) || []).length, 1);
        assert.match(html, /aria-haspopup="dialog"/);
        assert.equal(node.description, undefined);
        assert.doesNotMatch(html, /<p>/);
        assert.equal((html.match(/onclick="makeIntegratedDecision/g) || []).length, 2);
        const handler = html.match(/class="benchmark-guidance-link" onclick="([^"]+)"/)[1];
        for (const visual of [false, true]) {
            const prefix = visual ? 'visual-flowchart' : 'flowchart';
            const popup = getElement(`${prefix}-guidance-popup`);
            const button = getElement(`${prefix}-guidance-btn`);
            let focused = false;
            let expanded;
            popup.hidden = true;
            popup.querySelector = () => ({ focus() { focused = true; } });
            button.setAttribute = (name, value) => { if (name === 'aria-expanded') expanded = value; };
            run(`appState.visualFlowchartModal = ${visual ? '{ guidanceOpen: false }' : 'null'};`);
            const trigger = { closest(selector) {
                assert.equal(selector, '#visual-flowchart-modal');
                return visual ? {} : null;
            } };
            run(`(function () { ${handler} })`).call(trigger);
            assert.equal(popup.hidden, false);
            assert.equal(expanded, 'true');
            assert.equal(focused, true);
            if (visual) assert.equal(run('appState.visualFlowchartModal.guidanceOpen'), true);
            const pointerHandler = read('app.js').match(visual
                ? /modal\.addEventListener\('pointerdown', event => \{([\s\S]*?)\n    \}\);/
                : /document\.addEventListener\('pointerdown', event => \{([\s\S]*?)\n\}\);/)[1];
            const pointerdown = run(`(event => { ${pointerHandler} })`);
            pointerdown({ target: { closest(selector) {
                assert.ok(selector.includes('.benchmark-guidance-link'));
                return trigger;
            } } });
            assert.equal(popup.hidden, false);
            run(`(function () { ${handler} })`).call(trigger);
            assert.equal(popup.hidden, true);
            assert.equal(expanded, 'false');
            if (visual) assert.equal(run('appState.visualFlowchartModal.guidanceOpen'), false);
            run(`(function () { ${handler} })`).call(trigger);
            assert.equal(popup.hidden, false);
            pointerdown({ target: { closest: () => null } });
            assert.equal(popup.hidden, true);
        }
    }
});

test('both replacement monitoring tools retain the original searchable tag coverage', () => {
    const { context } = setup();
    for (const tier of [2, 3]) {
        for (const pillar of ['Reading Fluency', 'Reading Comprehension']) {
            for (const screener of ['DIBELS', 'CTOPP-2']) {
                const resources = context.getFilteredResources({
                    program: 'English', tier, pillar, screener, grade: ['2', '8'], resourceType: 'Progress Monitoring'
                });
                assert.equal(resources.length, 2);
                assert.deepEqual(Array.from(resources, item => item.name).sort(), [
                    'DIBELS Progress Monitoring Charts (Excel Sheets)', 'DIBELS Progress Monitoring Forms'
                ]);
                for (const item of resources) {
                    assert.equal(context.isRecommendedResource(item, { tier }), tier === 3);
                    assert.equal(context.getResourceUrls(item, { tier }).length, 1);
                    assert.equal(item.url, item.urls[0]);
                    assert.ok(read(`EN_Tier-${tier}.csv`).includes(`${item.name},Reading Fluency; Reading Comprehension,`));
                    assert.ok(read(`EN_Tier-${tier}.csv`).includes(item.url));
                }
            }
        }
    }
    assert.doesNotMatch(read('data/intervention-menu.json'), /DIBELS (Maze|Oral Reading Fluency) Progress Monitoring/);
});

test('every intervention step appends monitoring links after existing card content', () => {
    const { context, run } = setup();
    run(`appReady = false; pathwayContext = { program: 'English', screener: 'dibels', grades: ['K'] };`);
    let count = 0;
    for (const [tierId, tier] of Object.entries(context.getFlowchartDefs())) {
        for (const node of Object.values(tier.nodes)) {
            if (node.options !== 'interventions') continue;
            run(`appState.visualFlowchart = { tierId: '${tierId}', selectedPath: [], choices: {} };`);
            for (const render of [context.createIntegratedSelectionNode, context.createSelectionNode]) {
                const html = render(node);
                assert.equal((html.match(/class="progress-monitoring-tools"/g) || []).length, 1);
                assert.ok(html.indexOf('progress-monitoring-tools') > html.indexOf(node.description));
                assert.match(html, /DIBELS Progress Monitoring Forms/);
                assert.match(html, /DIBELS Progress Monitoring Charts \(Excel Sheets\)/);
                assert.equal((html.match(/rel="noopener noreferrer"/g) || []).length >= 2, true);
                assert.match(html, /d=w9f0016a4415a47b59c2ae08f59485ee1&amp;csf=1&amp;web=1&amp;e=DinOuP/);
                assert.match(html, /DIBELS%20Intervention%20and%20Tracking&amp;viewid=/);
            }
            count++;
        }
    }
    assert.equal(count, 3);
    assert.equal(context.buildProgressMonitoringLinksHtml('tier1'), '');
    run(`appState.selectedProgram = PROGRAM_FRENCH_IMMERSION;`);
    assert.equal(context.buildProgressMonitoringLinksHtml('tier2'), '');
});

test('whole saved snapshot round-trips with and without compression', async () => {
    const { context, run } = setup();
    const snapshot = context.captureProgressTransfer();
    assert.equal(snapshot.sessions.length, 2);
    assert.equal(snapshot.activeSessionId, 'active-session');
    assert.ok(snapshot.pathway);
    assert.equal(snapshot.favourites.length, 1);
    assert.equal(snapshot.defaults.English.screener, 'dibels');
    assert.equal(snapshot.menuLanguage, 'French Immersion');
    assert.ok(Object.keys(snapshot.scheduleGrades).length);
    for (const compressed of [true, false]) {
        context.CompressionStream = compressed ? CompressionStream : undefined;
        const code = await context.encodeProgressTransfer(snapshot);
        assert.match(code, compressed ? /^LIP2\.g\./ : /^LIP2\.j\./);
        assert.equal(JSON.stringify(await context.decodeProgressTransfer(code)), JSON.stringify(snapshot));
    }
});

test('one email link includes all saved data, not a selected session', async () => {
    const { context, getElement } = setup();
    await context.prepareTransferLink();
    assert.equal(getElement('transfer-email').disabled, false);
    await context.emailProgressTransfer();
    const email = new URL(context.window.location.href);
    assert.equal(email.protocol, 'mailto:');
    const body = email.searchParams.get('body');
    const link = new URL(body.match(/https:\/\/\S+/)[0]);
    assert.equal(link.pathname, '/literacy-interventions/');
    assert.equal(link.search, '');
    const snapshot = await context.decodeProgressTransfer(link.hash.slice('#progress='.length));
    assert.equal(snapshot.sessions.length, 2);
    assert.equal(snapshot.favourites.length, 1);
    assert.equal(typeof context.copyProgressHistory, 'undefined');
    assert.equal(typeof context.shareProgressTransfer, 'undefined');
});

test('opening link only previews; canceled confirmation preserves data; restore replaces once confirmed', async () => {
    const { context, run, getElement, storage } = setup();
    const source = context.captureProgressTransfer();
    const code = await context.encodeProgressTransfer(source);
    run(`pathwaySessions = [{ ...session, id: 'destination-only' }]; favouriteIds = new Set();`);
    context.window.location.hash = `#progress=${code}`;
    await context.receiveProgressTransferLink();
    assert.equal(context.document.body.dataset.page, 'settings');
    assert.equal(getElement('transfer-send').hidden, false);
    assert.equal(getElement('transfer-receive').hidden, false);
    assert.equal(getElement('transfer-email').disabled, false);
    assert.equal(getElement('transfer-restore').hidden, false);
    assert.equal(run('pathwaySessions[0].id'), 'destination-only');
    context.window.confirm = () => false;
    await context.restoreProgressTransfer();
    assert.equal(run('pathwaySessions[0].id'), 'destination-only');
    assert.equal(context.window.location.reloads, 0);
    context.window.confirm = () => true;
    await context.restoreProgressTransfer();
    assert.equal(run('pathwaySessions.length'), 2);
    assert.equal(run('activePathwaySessionId'), 'active-session');
    assert.equal(run('savedPathway.context.screener'), 'dibels');
    assert.equal(context.window.location.reloads, 1);
    assert.equal(storage.get('literacy-interventions-favourites'), JSON.stringify(source.favourites));
    assert.equal(storage.get('literacy-interventions-menu-language'), source.menuLanguage);
    const progress = JSON.parse(storage.get('session:literacy-interventions-progress-session'));
    assert.equal(progress.sessions.length, 2);
    assert.equal(progress.activeSessionId, 'active-session');
});

test('empty history remains transferable and restored data is allowlisted', async () => {
    const { context } = setup();
    const snapshot = context.captureProgressTransfer();
    snapshot.sessions = [];
    snapshot.pathway = null;
    snapshot.activeSessionId = null;
    snapshot.favourites = ['not-a-resource'];
    snapshot.defaults.English.screener = 'not-a-screener';
    snapshot.auth = 'not-transferable';
    const restored = await context.decodeProgressTransfer(await context.encodeProgressTransfer(snapshot));
    assert.equal(restored.sessions.length, 0);
    assert.equal(restored.favourites.length, 0);
    assert.equal(restored.defaults.English.screener, '');
    assert.equal(restored.auth, undefined);
});

test('reject invalid snapshots, truncated input, mismatched context and decompression bombs', async () => {
    const { context } = setup();
    const original = context.captureProgressTransfer();
    for (const mutate of [
        snapshot => { snapshot.version = 99; },
        snapshot => { snapshot.sessions.push(snapshot.sessions[0]); },
        snapshot => { snapshot.sessions = Array(31).fill(snapshot.sessions[0]); },
        snapshot => { snapshot.sessions[0].context.screener = 'idapel'; },
        snapshot => { snapshot.activeSessionId = 'missing'; },
        snapshot => { snapshot.language = '<script>'; }
    ]) {
        const snapshot = structuredClone(original);
        mutate(snapshot);
        await assert.rejects(() => context.decodeProgressTransfer(`LIP2.j.${Buffer.from(JSON.stringify(snapshot)).toString('base64url')}`));
    }
    const code = await context.encodeProgressTransfer(original);
    for (const invalid of ['bad', code.slice(0, -10), 'LIP2.g.%%%%', 'x'.repeat(1400001)]) {
        await assert.rejects(() => context.decodeProgressTransfer(invalid));
    }
    const bomb = await new Response(new Blob(['x'.repeat(1000001)]).stream()
        .pipeThrough(new CompressionStream('gzip'))).arrayBuffer();
    await assert.rejects(() => context.decodeProgressTransfer(`LIP2.g.${Buffer.from(bomb).toString('base64url')}`));
});

test('oversized full email is disabled without partial sends or data removal', async () => {
    const { context, run, getElement } = setup();
    run(`encodeProgressTransfer = async () => 'LIP2.j.' + 'A'.repeat(32000);`);
    await context.prepareTransferLink();
    assert.equal(getElement('transfer-email').disabled, true);
    assert.match(getElement('transfer-status').textContent, /No data was sent or removed/);
    await context.emailProgressTransfer();
    assert.equal(context.window.location.href, 'https://example.org/literacy-interventions/');
    assert.equal(run('pathwaySessions.length'), 2);
});

test('failed persistence does not reload or replace existing progress and preferences', async () => {
    const { context, run, storage, getElement } = setup();
    const code = await context.encodeProgressTransfer(context.captureProgressTransfer());
    run(`
        pathwaySessions = [{ ...session, id: 'destination-only' }];
        localStorage.setItem(FAVOURITES_KEY, '["destination-only"]');
        persistProgressStorage = async () => {};
    `);
    await context.previewProgressTransfer(code);
    await context.restoreProgressTransfer();
    assert.equal(context.window.location.reloads, 0);
    assert.equal(run('pathwaySessions[0].id'), 'destination-only');
    assert.equal(storage.get('literacy-interventions-favourites'), '["destination-only"]');
    assert.match(getElement('transfer-status').textContent, /could not be prepared or restored/);
});

test('clearing Settings invalidates a preview and the interface offers only email', async () => {
    const { context, run, getElement } = setup();
    await context.previewProgressTransfer(await context.encodeProgressTransfer(context.captureProgressTransfer()));
    context.clearProgressTransfer();
    await context.restoreProgressTransfer();
    assert.equal(getElement('transfer-restore').hidden, true);
    assert.equal(context.window.location.reloads, 0);
    assert.equal(run('pathwaySessions.length'), 2);
    const html = read('index.html');
    assert.match(html, /onclick="emailProgressTransfer\(\)"/);
    assert.doesNotMatch(html, /transfer-(?:output|copy-link|session|share)|copyProgressHistory|shareProgressTransfer/);
    assert.doesNotMatch(read('app.js'), /data-session-transfer/);
});

test('an installed app can restore the emailed snapshot independently of the default browser', async () => {
    const sender = setup();
    await sender.context.prepareTransferLink();
    await sender.context.emailProgressTransfer();
    const body = new URL(sender.context.window.location.href).searchParams.get('body');
    const link = body.match(/https:\/\/\S+/)[0];
    assert.match(body, /inside that app/);

    const browser = setup();
    browser.run(`pathwaySessions = [{ ...session, id: 'browser-only' }];`);
    const app = setup();
    app.run(`pathwaySessions = [{ ...session, id: 'app-only' }];`);
    app.context.navigateToPage('settings');
    assert.equal(app.getElement('transfer-receive').hidden, false);
    app.getElement('transfer-link-input').value = `  ${link}\n`;
    await app.context.previewEmailedProgressLink();
    assert.equal(app.getElement('transfer-restore').hidden, false);
    assert.equal(app.run('pathwaySessions[0].id'), 'app-only');
    app.context.window.confirm = () => false;
    await app.context.restoreProgressTransfer();
    assert.equal(app.run('pathwaySessions[0].id'), 'app-only');
    app.context.window.confirm = () => true;
    await app.context.restoreProgressTransfer();
    assert.equal(app.run('pathwaySessions[0].id'), 'active-session');
    assert.equal(app.context.window.location.reloads, 1);
    assert.equal(browser.run('pathwaySessions[0].id'), 'browser-only');
    assert.equal(browser.context.window.location.reloads, 0);
    assert.equal(app.context.window.location.href, 'https://example.org/literacy-interventions/');
});

test('pasted links are validated locally without navigating or changing saved data', async () => {
    const { context, run, getElement } = setup();
    const code = await context.encodeProgressTransfer(context.captureProgressTransfer());
    const base = 'https://example.org/literacy-interventions/';
    for (const url of [
        'javascript:alert(1)', `${base}#other=${code}`, `https://other.example/#progress=${code}`,
        `https://example.org/other/#progress=${code}`, `${base}#progress=truncated`,
        `https://user@example.org/literacy-interventions/#progress=${code}`, 'x'.repeat(1400001)
    ]) {
        getElement('transfer-link-input').value = url;
        await context.previewEmailedProgressLink();
        await context.restoreProgressTransfer();
        assert.equal(getElement('transfer-restore').hidden, true);
        assert.equal(run('pathwaySessions.length'), 2);
        assert.equal(context.window.location.reloads, 0);
        assert.equal(context.window.location.href, base);
    }
    getElement('transfer-link-input').value = `${base}index.html#progress=${code}`;
    await context.previewEmailedProgressLink();
    assert.equal(getElement('transfer-restore').hidden, false);
});

test('editing or leaving Settings cancels stale and in-flight previews', async () => {
    const { context, getElement } = setup();
    context.navigateToPage('settings');
    const code = await context.encodeProgressTransfer(context.captureProgressTransfer());
    const input = getElement('transfer-link-input');
    const link = `https://example.org/literacy-interventions/#progress=${code}`;
    input.value = link;
    await context.previewEmailedProgressLink();
    assert.equal(input.value, link);
    input.value = 'changed';
    input.handlers.get('input')();
    await context.restoreProgressTransfer();
    assert.equal(getElement('transfer-restore').hidden, true);
    assert.equal(context.window.location.reloads, 0);
    input.value = link;
    const pending = context.previewEmailedProgressLink();
    input.handlers.get('input')();
    await pending;
    assert.equal(getElement('transfer-restore').hidden, true);
    input.value = link;
    await context.previewEmailedProgressLink();
    context.navigateToPage('home');
    assert.equal(input.value, '');
    await context.restoreProgressTransfer();
    assert.equal(context.window.location.reloads, 0);
});

test('emailing a backup after a preview captures current device data without losing the preview', async () => {
    const { context, run, getElement } = setup();
    const incoming = await context.encodeProgressTransfer(context.captureProgressTransfer());
    run(`pathwaySessions = [{ ...session, id: 'destination-only' }]; activePathwaySessionId = 'destination-only';`);
    await context.previewProgressTransfer(incoming);
    await context.emailProgressTransfer();
    const body = new URL(context.window.location.href).searchParams.get('body');
    const link = new URL(body.match(/https:\/\/\S+/)[0]);
    const backup = await context.decodeProgressTransfer(link.hash.slice('#progress='.length));
    assert.equal(backup.sessions.length, 1);
    assert.equal(backup.sessions[0].id, 'destination-only');
    assert.equal(getElement('transfer-restore').hidden, false);
    await context.restoreProgressTransfer();
    assert.equal(run('pathwaySessions[0].id'), 'active-session');
});

test('leaving Settings cancels an in-flight email even if a newer email is prepared', async () => {
    const { context, run } = setup();
    context.navigateToPage('settings');
    const code = await context.encodeProgressTransfer(context.captureProgressTransfer());
    run(`let finishEncoding; encodeProgressTransfer = () => new Promise(resolve => { finishEncoding = resolve; });`);
    const pending = context.emailProgressTransfer();
    context.navigateToPage('home');
    context.navigateToPage('settings');
    run(`encodeProgressTransfer = async () => '${code}';`);
    await context.prepareTransferLink();
    run(`finishEncoding('${code}');`);
    await pending;
    assert.equal(context.window.location.href, 'https://example.org/literacy-interventions/');
});
