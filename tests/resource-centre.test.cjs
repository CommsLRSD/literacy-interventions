const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const read = file => readFileSync(join(__dirname, '..', file), 'utf8');

function setup() {
    const errors = [];
    const context = vm.createContext({
        URL,
        console: { error: message => errors.push(message) },
        document: {
            addEventListener() {},
            getElementById: () => null,
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
        }
    });
    const run = source => vm.runInContext(source, context);
    run(read('translations.js'));
    run(read('app.js'));
    return { run, context, errors };
}

test('both main menus group supporting pages under Resource Centre', () => {
    const html = read('index.html');
    const desktop = html.slice(html.indexOf('<nav class="side-nav"'), html.indexOf('<!-- Mobile nav overlay -->'));
    const mobile = html.slice(html.indexOf('<div class="mobile-nav-overlay"'), html.indexOf('<!-- Backdrop'));
    for (const menu of [desktop, mobile]) {
        assert.deepEqual([...menu.matchAll(/data-page="([^"]+)"/g)].map(match => match[1]),
            ['flowchart', 'interventions', 'schedule', 'resource-centre']);
        assert.match(menu, /onclick="openProgressTransfer\(\)"/);
    }
    const centre = html.slice(html.indexOf('<section id="resource-centre-section"'), html.indexOf('<!-- ── FLOWCHART'));
    assert.deepEqual([...centre.matchAll(/role="tab" data-page="([^"]+)"/g)].map(match => match[1]),
        ['favourites', 'scores', 'pillars', 'resources', 'faq', 'about']);
    assert.match(centre, /onclick="cycleResourceCentre\(-1\)"/);
    assert.match(centre, /onclick="cycleResourceCentre\(1\)"/);
    for (const page of ['favourites', 'scores', 'pillars', 'resources', 'faq', 'about']) {
        assert.match(html, new RegExp(`id="${page}-section"`));
    }
});

test('direct supporting-page destinations highlight Resource Centre without changing their destination', () => {
    const { run } = setup();
    for (const page of ['scores', 'pillars', 'resources', 'faq', 'favourites', 'about', 'resource-centre']) {
        assert.equal(run(`getNavigationPage('${page}')`), 'resource-centre');
    }
    for (const page of ['flowchart', 'interventions', 'schedule']) {
        assert.equal(run(`getNavigationPage('${page}')`), page);
    }
    assert.equal(run("getNavigationPage('home')"), 'flowchart');
});

test('Saved Items tab badge includes sessions and bookmarked resources', () => {
    const { run, context } = setup();
    const badges = [0, 1].map(() => ({
        textContent: '',
        classList: { toggle(name, value) { this[name] = value; } }
    }));
    const list = { innerHTML: '' };
    context.document.querySelectorAll = selector => {
        assert.equal(selector, '[data-page="favourites"] .nav-badge');
        return badges;
    };
    context.document.getElementById = () => list;
    run(`
        getFavouriteIds = () => new Set(['resource-1']);
        getAllResources = () => [];
        pathwaySessions = [{ id: 'session-1' }, { id: 'session-2' }];
        renderFavourites();
    `);
    for (const badge of badges) {
        assert.equal(badge.textContent, '3');
        assert.equal(badge.classList['is-empty'], false);
    }
    run('getFavouriteIds = () => new Set(); pathwaySessions = []; renderFavourites();');
    for (const badge of badges) {
        assert.equal(badge.textContent, '0');
        assert.equal(badge.classList['is-empty'], true);
    }
});

function setupCentre() {
    const setupResult = setup();
    const { run, context } = setupResult;
    const pages = ['favourites', 'scores', 'pillars', 'resources', 'faq', 'about'];
    const elements = new Map();
    const element = (id, text = '') => {
        const classes = new Set(['content-section']);
        const node = {
            id, textContent: text, dataset: {}, attributes: {}, hidden: false, scrollTop: 0,
            classList: {
                add: (...names) => names.forEach(name => classes.add(name)),
                remove: (...names) => names.forEach(name => classes.delete(name)),
                contains: name => classes.has(name),
                toggle(name, value) { if (value) classes.add(name); else classes.delete(name); }
            },
            setAttribute(name, value) { this.attributes[name] = value; },
            getAttribute(name) { return this.attributes[name]; },
            addEventListener(name, handler) { this[name === 'close' ? 'close-event' : name] = handler; },
            append(node) { node.parentElement = this; },
            focus() { context.document.activeElement = this; },
            open: false,
            showModal() { this.open = true; },
            close() { this.open = false; this['close-event']?.(); }
        };
        elements.set(id, node);
        return node;
    };
    const host = element('host');
    host.children = [];
    host.append = node => { host.children.push(node); node.parentElement = host; };
    const tablist = element('tablist');
    for (const page of pages) {
        element(`${page}-section`);
        const tab = element(`rc-tab-${page}`);
        tab.dataset.page = page;
        tab.parentElement = tablist;
    }
    for (const id of ['resource-centre-reader-title', 'resource-centre-reader-description',
        'resource-centre-position', 'resource-centre-previous-title', 'resource-centre-next-title',
        'pathway-sessions-drawer', 'resource-centre-section', 'home-section', 'interventions-section',
        'resource-centre-drawer', 'resource-centre-browse', 'desktop-navigation', 'drawer-navigation']) element(id);
    const nav = element('nav');
    nav.dataset.page = 'resource-centre';
    context.document.body = { dataset: {} };
    context.document.getElementById = id => elements.get(id) || null;
    context.document.querySelector = selector => {
        if (selector === '.resource-centre-panels') return host;
        if (selector === '.resource-centre-tablist') return tablist;
        if (selector === '.resource-centre-navigation') return elements.get('desktop-navigation');
        if (selector === '.resource-centre-drawer-navigation') return elements.get('drawer-navigation');
        if (selector.includes('.resource-centre-tab-label') || selector.includes('.section-subtitle')) {
            return { textContent: selector };
        }
        return null;
    };
    context.document.querySelectorAll = selector => {
        if (selector === '.nav-link' || selector === '.mobile-nav-item') return [nav];
        if (selector === '.content-section') return [...elements.values()].filter(node =>
            node.id.endsWith('-section') && node.classList.contains('content-section'));
        return [];
    };
    context.window.scrollTo = () => {};
    const compact = { matches: false, addEventListener(name, handler) { this.change = handler; } };
    context.window.matchMedia = () => compact;
    run(`
        setHomeDrawerOpen = () => {};
        clearFavouriteFeedback = () => {};
        closeVisualFlowchartModal = () => {};
        updateMobilePageTitle = () => {};
        updateGuidedHome = () => {};
        renderFavourites = () => {};
        setupResourceCentre();
    `);
    return { ...setupResult, elements, host, tablist, nav, pages, compact };
}

test('all existing content is mounted inside one screen, with only the selected panel exposed', () => {
    const { run, host, elements, pages } = setupCentre();
    assert.deepEqual(host.children.map(node => node.id), pages.map(page => `${page}-section`));
    for (const page of pages) {
        run(`selectResourceCentrePage('${page}')`);
        for (const name of pages) {
            const panel = elements.get(`${name}-section`);
            assert.equal(panel.hidden, name !== page);
            assert.equal(panel.classList.contains('content-section'), false);
            assert.equal(panel.attributes.role, 'tabpanel');
            assert.equal(elements.get(`rc-tab-${name}`).tabIndex, name === page ? 0 : -1);
        }
    }
    assert.throws(() => run("selectResourceCentrePage('missing')"), /Unknown Resource Centre section/);
});

test('cycling wraps in both directions and direct shortcuts select a panel without leaving Resource Centre', () => {
    const { run, elements, nav } = setupCentre();
    run("cycleResourceCentre(-1)");
    assert.equal(run('resourceCentrePage'), 'about');
    run("cycleResourceCentre(1)");
    assert.equal(run('resourceCentrePage'), 'favourites');
    run("navigateToPage('scores')");
    assert.equal(run('appState.currentPage'), 'resource-centre');
    assert.equal(run('resourceCentrePage'), 'scores');
    assert.equal(elements.get('resource-centre-section').classList.contains('active'), true);
    assert.equal(nav.attributes['aria-selected'], 'true');
    run("navigateToPage('resource-centre')");
    assert.equal(run('resourceCentrePage'), 'scores');
});

test('tab keyboard controls cycle and expose just one keyboard tab stop', () => {
    const { context, run, tablist, elements } = setupCentre();
    let prevented = false;
    tablist.keydown({
        key: 'End',
        target: { closest: () => elements.get('rc-tab-favourites') },
        preventDefault() { prevented = true; }
    });

    assert.equal(prevented, true);
    assert.equal(run('resourceCentrePage'), 'about');
    assert.equal(context.document.activeElement.id, 'rc-tab-about');
    tablist.keydown({
        key: 'ArrowRight',
        target: { closest: () => elements.get('rc-tab-about') },
        preventDefault() {}
    });
    assert.equal(run('resourceCentrePage'), 'favourites');
});

test('mobile drawer shares desktop navigation, closes after selection, and restores on resize', () => {
    const { run, compact, tablist, elements, context } = setupCentre();
    const drawer = elements.get('resource-centre-drawer');
    const browse = elements.get('resource-centre-browse');
    assert.equal(tablist.parentElement.id, 'desktop-navigation');
    compact.matches = true;
    compact.change();
    assert.equal(tablist.parentElement.id, 'drawer-navigation');
    run('openResourceCentreDrawer()');
    assert.equal(drawer.open, true);
    assert.equal(browse.attributes['aria-expanded'], 'true');
    assert.equal(context.document.activeElement.id, 'rc-tab-favourites');
    tablist.click({ target: { closest: () => elements.get('rc-tab-pillars') } });
    assert.equal(run('resourceCentrePage'), 'pillars');
    assert.equal(drawer.open, false);
    assert.equal(browse.attributes['aria-expanded'], 'false');
    assert.equal(context.document.activeElement.id, 'resource-centre-reader-title');
    run('openResourceCentreDrawer()');
    compact.matches = false;
    compact.change();
    assert.equal(drawer.open, false);
    assert.equal(tablist.parentElement.id, 'desktop-navigation');
    assert.equal(run('resourceCentrePage'), 'pillars');
});

test('stale translation dictionaries preserve readable labels rather than showing raw keys', () => {
    const { run, context, errors } = setup();
    const label = { dataset: { i18n: 'nav_resource_centre' }, textContent: 'Resource Centre' };
    context.document.querySelectorAll = selector => selector === '[data-i18n]' ? [label] : [];
    context.document.documentElement = {};
    run(`
        delete TRANSLATIONS.en.nav_resource_centre;
        delete TRANSLATIONS.fr.nav_resource_centre;
        applyTranslations();
        applyTranslations();
    `);
    assert.equal(label.textContent, 'Resource Centre');
    assert.equal(errors.length, 1);
    assert.match(errors[0], /Missing translation: nav_resource_centre/);
});
