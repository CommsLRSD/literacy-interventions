const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const read = file => readFileSync(join(__dirname, '..', file), 'utf8');

function setup() {
    const context = vm.createContext({
        URL,
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
    return { run, context };
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
    assert.deepEqual([...centre.matchAll(/onclick="navigateToPage\('([^']+)'\)"/g)].map(match => match[1]),
        ['favourites', 'scores', 'resources', 'faq', 'about']);
    for (const page of ['favourites', 'scores', 'resources', 'faq', 'about']) {
        assert.match(html, new RegExp(`id="${page}-section"`));
    }
});

test('direct supporting-page destinations highlight Resource Centre without changing their destination', () => {
    const { run } = setup();
    for (const page of ['scores', 'resources', 'faq', 'favourites', 'about', 'resource-centre']) {
        assert.equal(run(`getNavigationPage('${page}')`), 'resource-centre');
    }
    for (const page of ['flowchart', 'interventions', 'schedule']) {
        assert.equal(run(`getNavigationPage('${page}')`), page);
    }
    assert.equal(run("getNavigationPage('home')"), 'flowchart');
});

test('Saved Items card badge includes sessions and bookmarked resources', () => {
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
