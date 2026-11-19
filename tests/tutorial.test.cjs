const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

function setup(tour = 'tutorial_setup') {
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
        matches(selector) { return this.open && selector === 'details[open]'; }
        querySelector(selector) { return elements.get(selector) || null; }
        getClientRects() { return [{}]; }
        getBoundingClientRect() { return this.rect || { left: 20, top: 200, right: 200, bottom: 244, width: 180, height: 44 }; }
        closest(selector) { return selector === '[data-schedule-grade]' && this.scheduleGrade ? this : null; }
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
            elements.set(id, new Element());
        }
        return elements.get(id);
    };
    for (const selector of ['.tutorial-panel', '.tutorial-body', '.tutorial-spotlight', '.tutorial-close', '.tutorial-arrow']) get(selector);
    get('program-prompt-modal').hidden = true;
    const events = new Map();
    const messages = [];
    const state = { currentPage: 'home', language: 'en', selectedProgram: null };
    const context = vm.createContext({
        URL, Element, CSS: { escape: value => value }, tutorialPractice: true, appState: state,
        document: {
            documentElement: { lang: 'en' }, body: get('body'),
            getElementById: get,
            createElement: () => new Element(),
            querySelector: selector => elements.get(selector) || null,
            querySelectorAll: selector => selector.startsWith('#') ? [get(selector.slice(1))] : [],
            addEventListener: (name, callback) => events.set(name, callback)
        },
        window: {
            location: { href: `https://example.org/?tutorial-practice=1&tutorial=${tour}`, origin: 'https://example.org' },
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
        get, state, messages, viewport: context.window,
        action: (id, type = 'change') => events.get(type)({ type, target: get(id) })
    };
}

test('setup advances after real selections, with Finish only after the pathway opens', () => {
    const { get, state, action, messages } = setup();
    const finish = get('tutorial-finish');
    const title = () => get('tutorial-heading').textContent;
    assert.equal(get('app-tutorial').modal, false, 'practice must leave the app controls interactive');
    assert.equal(finish.hidden, true);
    action('home-program-select');
    assert.equal(title(), 'Choose a teaching program');

    state.selectedProgram = 'French Immersion';
    get('program-prompt-modal').hidden = false;
    action('home-program-select');
    assert.equal(title(), 'Choose a teaching program', 'wait until the app language choice is resolved');
    get('program-prompt-modal').hidden = true;
    action('program-prompt-language', 'click');
    assert.equal(title(), 'Select a screener');
    get('home-screener-select').value = 'dibels';
    action('home-screener-select');
    assert.equal(title(), 'Select a grade');
    get('home-grade-select').value = '3';
    action('home-grade-select');
    assert.equal(title(), 'Start the practice pathway');
    assert.equal(finish.hidden, true);
    state.currentPage = 'flowchart';
    action('home-start-btn', 'click');
    assert.equal(title(), 'Your pathway is ready');
    assert.equal(finish.hidden, false);
    finish.click();
    assert.equal(get('app-tutorial').open, false);
    assert.equal(messages.at(-1), 'tutorial-close');
});

test('schedule advances on opening the actual menu, changing a grade and closing it', () => {
    const { get, state, action } = setup('nav_schedule');
    const title = () => get('tutorial-heading').textContent;
    state.selectedProgram = 'English';
    action('home-program-select');
    assert.equal(title(), 'Open the grade filter');
    const dropdown = get('schedule-grade-filter');
    dropdown.open = true;
    action('schedule-grade-filter', 'toggle');
    assert.equal(title(), 'Change the displayed grades');
    action('unrelated-input');
    assert.equal(title(), 'Change the displayed grades');
    get('sample-grade').scheduleGrade = true;
    action('sample-grade');
    assert.equal(title(), 'Close the menu');
    dropdown.open = false;
    action('schedule-grade-filter', 'toggle');
    assert.equal(title(), 'Explore an assessment');
    assert.equal(get('tutorial-finish').hidden, false);
});

test('callout sits beside the highlight and flips above controls near the viewport bottom', () => {
    const { get, action, viewport } = setup();
    const panel = get('.tutorial-panel');
    const arrow = get('.tutorial-arrow');
    assert.ok(parseFloat(panel.style.top) > 244, 'place below the control when there is room');
    assert.equal(arrow.hidden, false);
    assert.equal(arrow.style.rotate, '45deg');

    viewport.innerWidth = 390;
    viewport.innerHeight = 660;
    get('home-program-select').rect = { left: 20, top: 560, right: 360, bottom: 604, width: 340, height: 44 };
    action('home-program-select', 'click');
    assert.ok(parseFloat(panel.style.top) + panel.getBoundingClientRect().height < 560);
    assert.equal(arrow.style.rotate, '225deg');
    assert.ok(parseFloat(panel.style.left) + parseFloat(panel.style.width) <= viewport.innerWidth);
});
