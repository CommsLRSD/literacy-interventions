const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const source = readFileSync(join(__dirname, '..', 'theme.js'), 'utf8');

function setup(saved = null, { readFails = false, writeFails = false } = {}) {
    const storage = new Map(saved === null ? [] : [['literacy-interventions-theme', saved]]);
    const dataset = {};
    const toggle = { checked: false, addEventListener(event, listener) { this.change = listener; } };
    const status = { textContent: '' };
    const warnings = [];
    let ready;
    const context = vm.createContext({
        console: { warn: (...args) => warnings.push(args) },
        document: {
            documentElement: { dataset },
            addEventListener(event, listener) { ready = listener; },
            getElementById: id => id === 'settings-dark-mode' ? toggle : status
        },
        localStorage: {
            getItem(key) {
                if (readFails) throw new Error('Storage blocked');
                return storage.get(key) ?? null;
            },
            setItem(key, value) {
                if (writeFails) throw new Error('Storage blocked');
                storage.set(key, value);
            }
        },
        t: key => `translated:${key}`
    });
    vm.runInContext(source, context);
    return { dataset, toggle, status, storage, warnings, ready: () => ready() };
}

test('saved dark appearance is applied before DOM ready and synchronized with Settings', () => {
    const { dataset, toggle, ready } = setup('dark');
    assert.equal(dataset.theme, 'dark');
    ready();
    assert.equal(toggle.checked, true);
});

test('new visits keep light appearance and Settings changes persist in both directions', () => {
    const { dataset, toggle, ready, storage } = setup();
    assert.equal(dataset.theme, 'light');
    ready();
    assert.equal(toggle.checked, false);
    for (const checked of [true, false]) {
        toggle.checked = checked;
        toggle.change();
        const expected = checked ? 'dark' : 'light';
        assert.equal(dataset.theme, expected);
        assert.equal(storage.get('literacy-interventions-theme'), expected);
        const returningVisit = setup(storage.get('literacy-interventions-theme'));
        assert.equal(returningVisit.dataset.theme, expected);
    }
});

test('invalid stored appearance does not opt users into dark mode', () => {
    const { dataset, toggle, ready } = setup('unexpected');
    ready();
    assert.equal(dataset.theme, 'light');
    assert.equal(toggle.checked, false);
});

test('unavailable storage reports the error but still allows appearance changes', () => {
    const { dataset, toggle, ready, status, warnings } = setup(null, { readFails: true, writeFails: true });
    assert.equal(dataset.theme, 'light');
    ready();
    assert.equal(status.textContent, 'translated:settings_theme_storage_error');
    toggle.checked = true;
    toggle.change();
    assert.equal(dataset.theme, 'dark');
    assert.equal(status.textContent, 'translated:settings_theme_storage_error');
    assert.equal(warnings.length, 2);
});

test('a successful save clears a prior read error', () => {
    const { toggle, ready, status, warnings } = setup(null, { readFails: true });
    ready();
    toggle.checked = true;
    toggle.change();
    assert.equal(status.textContent, '');
    assert.equal(warnings.length, 1);
});
