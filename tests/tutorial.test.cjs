const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

function setup(tour = 'nav_flowchart', query = '', compact = false) {
    const checks = Array.from({ length: 8 }, () => ({ checked: false, dispatchEvent() {} }));
    class Element {
        constructor() {
            this.handlers = new Map();
            this.style = { setProperty(name, value) { this[name] = value; } };
            this.attributes = new Map();
            this.classList = { add() {}, remove() {}, toggle() {} };
            this.value = '';
        }
        addEventListener(name, callback) { this.handlers.set(name, callback); }
        setAttribute(name, value) { this.attributes.set(name, value); }
        getAttribute(name) { return this.attributes.get(name); }
        replaceChildren() {}
        append() {}
        contains(element) { return this === element || (!!element?.parent && this.contains(element.parent)); }
        matches(selector) { return this.open && selector === 'details[open]'; }
        querySelector(selector) { return elements.get(selector) || null; }
        querySelectorAll(selector) { return selector === '.checklist-line input' ? checks : []; }
        getClientRects() { return this.hidden ? [] : [{}]; }
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
    if (compact) {
        for (const id of ['favourites', 'scores', 'pillars', 'resources', 'tutorials', 'faq', 'about']) {
            get(`rc-tab-${id}`).parent = get('resource-centre-drawer');
        }
    }
    get('program-prompt-modal').hidden = true;
    const events = new Map();
    const windowEvents = new Map();
    const messages = [];
    const visitedSections = [];
    const state = { currentPage: 'home', language: 'en', selectedProgram: null };
    const menuState = { resourceType: '' };
    const context = vm.createContext({
        URL, Element, Event, CSS: { escape: value => value }, tutorialPractice: true, appState: state,
        menuState,
        openVisualFlowchartModal() {},
        selectResourceCentrePage: section => {
            for (const id of ['favourites', 'scores', 'pillars', 'resources', 'tutorials', 'faq', 'about']) {
                get(`rc-tab-${id}`).setAttribute('aria-selected', String(id === section));
                get(`${id}-section`).hidden = id !== section;
            }
            visitedSections.push(section);
        },
        closeResourceCentreDrawer: () => get('resource-centre-drawer').close(),
        document: {
            documentElement: { lang: 'en' }, body: get('body'),
            getElementById: get,
            createElement: () => new Element(),
            querySelector: selector => elements.get(selector) || null,
            querySelectorAll: selector => selector.startsWith('#') ? [get(selector.slice(1))] : [],
            addEventListener: (name, callback) => events.set(name, callback)
        },
        window: {
            location: { href: `https://example.org/?tutorial-practice=1&tutorial=${tour}${query}`, origin: 'https://example.org' },
            parent: { postMessage: message => messages.push(message) },
            innerWidth: 1024, innerHeight: 768, addEventListener: (name, callback) => windowEvents.set(name, callback)
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
        get, state, messages, checks, menuState, visitedSections, viewport: context.window,
        action: (id, type = 'change') => events.get(type)({ type, target: get(id) }),
        selectSection: context.selectResourceCentrePage,
        clickBlocked(id) {
            let blocked = false;
            windowEvents.get('click')({
                target: get(id),
                preventDefault() { blocked = true; },
                stopImmediatePropagation() {}
            });
            return blocked;
        }
    };
}

test('flowchart uses real setup selections and leaves only the last practice item unchecked', () => {
    const { get, state, action, messages, checks } = setup();
    const finish = get('tutorial-finish');
    const title = () => get('tutorial-heading').textContent;
    assert.equal(get('app-tutorial').modal, false, 'practice must leave the app controls interactive');
    assert.equal(finish.hidden, true);
    assert.equal(get('tutorial-next').hidden, true);
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
    state.visualFlowchart = { currentNodeId: 'tier1-principles' };
    get('.flowchart-step[data-node-id="tier1-principles"]');
    action('home-start-btn', 'click');
    assert.equal(title(), 'Review the checklist');
    assert.deepEqual(checks.map(check => check.checked), [true, true, true, true, true, true, true, false]);
    checks.at(-1).checked = true;
    action('last-check');
    assert.equal(title(), 'Review the checklist');
    state.visualFlowchart.currentNodeId = 'result';
    action('continue-to-results', 'click');
    assert.equal(title(), 'Make a practice decision');
    state.visualFlowchart.currentNodeId = 'outcome';
    action('decision', 'click');
    assert.equal(title(), 'See your pathway in action');
    assert.equal(finish.hidden, false);
    finish.click();
    assert.equal(get('app-tutorial').open, false);
    assert.equal(messages.at(-1), 'tutorial-close');
});

test('Centre tour spotlights each navigation button before displaying the real section', () => {
    const { get, action, selectSection, visitedSections, clickBlocked } = setup('tutorial_centre_settings');
    const next = get('tutorial-next');
    const sections = ['favourites', 'scores', 'pillars', 'resources', 'tutorials', 'faq', 'about'];
    for (const [index, section] of sections.entries()) {
        assert.equal(clickBlocked(`rc-tab-${section}`), false);
        assert.equal(clickBlocked(`rc-tab-${sections[(index + 1) % sections.length]}`), true);
        assert.equal(next.hidden, false);
        if (index % 2) {
            selectSection(section); // The real tab handler runs before the tutorial sees the result.
            action(`rc-tab-${section}`, 'click');
        } else {
            next.click();
        }
        assert.equal(visitedSections.at(-1), section);
        assert.equal(get(`${section}-section`).hidden, false);
        assert.equal(clickBlocked(`rc-tab-${section}`), true);
        assert.equal(clickBlocked(`${section}-section`), false);
        assert.equal(next.hidden, false);
        next.click();
    }
    assert.deepEqual(visitedSections, sections);
    assert.equal(get('tutorial-heading').textContent, 'Open Settings');
});

test('Settings lets users toggle dark mode repeatedly before advancing with Next', () => {
    const { get, state, action, messages } = setup('tutorial_centre_settings');
    const next = get('tutorial-next');
    const finish = get('tutorial-finish');
    const title = () => get('tutorial-heading').textContent;
    for (let i = 0; i < 14; i++) next.click();
    assert.equal(get('tutorial-heading').textContent, 'Open Settings');
    assert.equal(next.hidden, true);
    state.currentPage = 'settings';
    action('settings-nav', 'click');
    for (let i = 0; i < 2; i++) {
        action('settings-dark-mode');
        assert.equal(title(), 'Try dark mode');
        assert.equal(next.hidden, false);
        assert.equal(finish.hidden, true);
    }
    next.click();
    for (const expected of ['Choose a flowchart layout', 'Transfer saved data']) {
        assert.equal(title(), expected);
        next.click();
    }
    assert.equal(title(), 'Reset saved data');
    assert.equal(next.hidden, true);
    assert.equal(finish.hidden, false);
    finish.click();
    assert.equal(messages.at(-1), 'tutorial-close');
});

test('mobile Centre tour opens the real tab drawer for navigation and closes it for the preview', () => {
    const { get } = setup('tutorial_centre_settings', '', true);
    const drawer = get('resource-centre-drawer');
    const next = get('tutorial-next');
    assert.equal(drawer.open, true);
    assert.equal(drawer.modal, false, 'the callout must remain usable while the drawer is open');
    next.click();
    assert.equal(drawer.open, false);
    assert.equal(get('favourites-section').hidden, false);
    next.click();
    assert.equal(drawer.open, true);
    get('.tutorial-close').click();
    assert.equal(drawer.open, false);
});

test('schedule advances on opening the actual menu, changing a grade and closing it', () => {
    const { get, state, action } = setup('nav_schedule', '&program=French+Immersion&grade=3');
    const title = () => get('tutorial-heading').textContent;
    assert.equal(state.currentPage, 'schedule');
    assert.equal(state.selectedProgram, null);
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

test('toolkit opens directly without applying carried-over filters', () => {
    const { get, state } = setup('nav_interventions', '&program=French+Immersion&grade=2');
    assert.equal(state.currentPage, 'interventions');
    assert.equal(state.selectedProgram, null);
    assert.equal(get('tutorial-heading').textContent, 'Choose a resource type');
});

test('Toolkit advances for a non-Intervention resource type, but not a blank selection', () => {
    const { get, menuState, action } = setup('nav_interventions');
    action('menu-type-filter');
    assert.equal(get('tutorial-heading').textContent, 'Choose a resource type');
    menuState.resourceType = 'Classroom Resource';
    action('menu-type-filter');
    assert.equal(get('tutorial-heading').textContent, 'Open the skills menu');
});

test('clicks outside the highlight are blocked and the allowed control follows the step', () => {
    const { state, action, clickBlocked } = setup();
    assert.equal(clickBlocked('home-start-btn'), true);
    assert.equal(clickBlocked('home-program-select'), false);
    state.selectedProgram = 'English';
    action('home-program-select');
    assert.equal(clickBlocked('home-program-select'), true);
    assert.equal(clickBlocked('home-screener-select'), false);
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

test('a large highlight does not reduce the callout height to its remaining gap', () => {
    const { get, action, viewport } = setup();
    viewport.innerWidth = 390;
    viewport.innerHeight = 370;
    const panel = get('.tutorial-panel');
    panel.rect = { height: 245 };
    get('home-program-select').rect = { left: 0, top: 170, right: 390, bottom: 370, width: 390, height: 200 };
    action('home-program-select', 'click');
    assert.ok(parseFloat(panel.style.maxHeight) >= panel.rect.height);
    assert.ok(parseFloat(panel.style.top) + panel.rect.height <= viewport.innerHeight);
});
