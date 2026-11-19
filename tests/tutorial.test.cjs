const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

function setup() {
    class Element {
        constructor() {
            this.handlers = new Map();
            this.style = {};
            this.classList = { add() {}, remove() {}, toggle() {} };
            this.value = '';
        }
        addEventListener(name, callback) { this.handlers.set(name, callback); }
        setAttribute() {}
        replaceChildren() {}
        append() {}
        contains() { return false; }
        matches(selector) { return this.control && selector.includes('select'); }
        querySelector(selector) { return elements.get(selector) || null; }
        getClientRects() { return [{}]; }
        getBoundingClientRect() { return { left: 20, top: 200, right: 200, bottom: 244, width: 180, height: 44 }; }
        scrollIntoView() {}
        focus() { this.focused = true; }
        show() { this.open = true; this.modal = false; }
        showModal() { this.open = true; this.modal = true; }
        close() { this.open = false; }
        click() { if (!this.disabled) this.handlers.get('click')?.(); }
    }
    const elements = new Map();
    const get = id => {
        if (!elements.has(id)) {
            const element = new Element();
            element.control = id.endsWith('-select');
            elements.set(id, element);
        }
        return elements.get(id);
    };
    for (const selector of ['.tutorial-panel', '.tutorial-spotlight', '.tutorial-close']) get(selector);
    get('program-prompt-modal').hidden = true;
    const events = new Map();
    const messages = [];
    const state = { currentPage: 'home', language: 'en', selectedProgram: null };
    const context = vm.createContext({
        URL, Element, tutorialPractice: true, appState: state,
        document: {
            documentElement: { lang: 'en' }, body: get('body'),
            getElementById: get,
            createElement: () => new Element(),
            querySelectorAll: selector => selector.startsWith('#') ? [get(selector.slice(1))] : [],
            addEventListener: (name, callback) => events.set(name, callback)
        },
        window: {
            location: { href: 'https://example.org/?tutorial-practice=1&tutorial=tutorial_setup', origin: 'https://example.org' },
            parent: { postMessage: message => messages.push(message) },
            innerWidth: 1024, innerHeight: 768, addEventListener() {}
        },
        MutationObserver: class { observe() {} },
        requestAnimationFrame: callback => { callback(); return 1; },
        cancelAnimationFrame() {}, clearTimeout() {},
        getComputedStyle: () => ({ visibility: 'visible' }),
        navigateToPage: page => { state.currentPage = page; },
        t: key => key === 'tutorial_progress' ? (section, index, total) => `${section}: ${index}/${total}` : key
    });
    vm.runInContext(readFileSync(join(__dirname, '..', 'tutorial.js'), 'utf8'), context);
    events.get('app-ready')();
    return {
        get, state, messages,
        change: id => events.get('change')({ type: 'change', target: get(id) })
    };
}

test('hands-on setup requires real selections and starting the app before it can finish', () => {
    const { get, state, change, messages } = setup();
    const next = get('tutorial-next');
    assert.equal(get('app-tutorial').modal, false, 'practice must leave the app controls interactive');
    assert.equal(next.disabled, true);
    next.click();
    assert.equal(get('tutorial-heading').textContent, 'Choose a teaching program');

    state.selectedProgram = 'English';
    change('home-program-select');
    assert.equal(next.disabled, false);
    state.selectedProgram = null;
    change('home-program-select');
    assert.equal(next.disabled, true, 'clearing a selection must revoke completion');
    state.selectedProgram = 'English';
    change('home-program-select');
    next.click();
    assert.equal(next.disabled, true);

    get('home-screener-select').value = 'dibels';
    change('home-screener-select');
    next.click();
    assert.equal(next.disabled, true);
    get('tutorial-try').click();
    assert.equal(get('home-grade-select').focused, true);
    get('home-grade-select').value = '3';
    change('home-grade-select');
    next.click();
    assert.equal(next.disabled, true, 'Next must not start a pathway on the user’s behalf');

    state.currentPage = 'flowchart';
    change('home-start-btn');
    assert.equal(next.disabled, false);
    next.click();
    assert.equal(get('app-tutorial').open, false);
    assert.equal(messages.at(-1), 'tutorial-close');
});
