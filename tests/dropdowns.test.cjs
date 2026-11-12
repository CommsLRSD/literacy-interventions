const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

function setup(anchor, { width = 800, height = 600, viewport } = {}) {
    const listeners = {};
    const properties = {};
    const panel = {
        style: { setProperty: (key, value) => { properties[key] = value; } },
        setAttribute() {},
        toggleAttribute(name, enabled) { panel[name] = enabled; },
        contains: () => false,
        matches: () => panel.visible,
        showPopover() { panel.visible = true; },
        hidePopover() { panel.visible = false; }
    };
    const summary = { getBoundingClientRect: () => anchor, focus() { summary.focused = true; } };
    const dropdown = {
        open: true,
        matches: selector => selector === '.cal-grade-dropdown',
        querySelector: selector => selector === 'summary' ? summary : panel,
        getClientRects: () => [anchor],
        contains: target => target === summary
    };
    const context = vm.createContext({
        URL,
        document: {
            addEventListener: (name, handler) => { (listeners[name] ||= []).push(handler); },
            getElementById: () => null,
            querySelectorAll: () => dropdown.open ? [dropdown] : []
        },
        window: {
            innerWidth: width, innerHeight: height, visualViewport: viewport,
            location: { href: 'https://example.org/literacy-interventions/' },
            matchMedia: () => ({ addEventListener() {} }),
            addEventListener: (name, handler) => { (listeners[name] ||= []).push(handler); }
        }
    });
    const run = source => vm.runInContext(source, context);
    run(readFileSync(join(__dirname, '..', 'app.js'), 'utf8'));
    for (const name of Object.keys(listeners)) delete listeners[name];
    run('setupDropdownMenus()');
    const dispatch = (name, target = dropdown, extra = {}) => {
        listeners[name].forEach(handler => handler({ target, ...extra }));
    };
    dispatch('toggle');
    return { properties, panel, dropdown, summary, dispatch, context };
}

test('dropdowns overlay in the top layer and are limited to the space below their trigger', () => {
    const { properties, panel } = setup({ left: 100, top: 100, bottom: 140, width: 280 });
    assert.equal(panel.visible, true);
    assert.equal(properties['--dropdown-top'], '144px');
    assert.equal(properties['--dropdown-bottom'], 'auto');
    assert.equal(properties['--dropdown-height'], '420px');
});

test('dropdowns open above a low trigger instead of extending past the footer or viewport', () => {
    const { properties } = setup({ left: 100, top: 240, bottom: 280, width: 280 }, { height: 300 });
    assert.equal(properties['--dropdown-top'], 'auto');
    assert.equal(properties['--dropdown-bottom'], '64px');
    assert.equal(properties['--dropdown-height'], '228px');
});

test('very short dropdowns scroll the entire panel so the footer cannot squeeze out the options', () => {
    const { panel, properties } = setup({ left: 8, top: 50, bottom: 80, width: 280 }, { height: 100 });
    assert.equal(panel['data-compact-menu'], true);
    assert.equal(properties['--dropdown-height'], '38px');
});

test('dropdown bounds follow a reduced visual viewport and stay within its horizontal edges', () => {
    const viewport = { offsetTop: 100, offsetLeft: 20, width: 300, height: 240, addEventListener() {} };
    const { properties } = setup({ left: 260, top: 120, bottom: 160, width: 400 }, { viewport });
    assert.equal(properties['--dropdown-left'], '28px');
    assert.equal(properties['--dropdown-width'], '284px');
    assert.equal(properties['--dropdown-height'], '168px');
});

test('open menus reposition on resize and scrolling, then close when their trigger leaves the viewport', () => {
    const anchor = { left: 100, top: 100, bottom: 140, width: 280 };
    const { properties, context, dropdown, panel, dispatch } = setup(anchor);
    context.window.innerHeight = 250;
    dispatch('resize', context.window);
    assert.equal(properties['--dropdown-height'], '98px');
    anchor.top = 200;
    anchor.bottom = 240;
    dispatch('scroll', context.document);
    assert.equal(properties['--dropdown-top'], 'auto');
    assert.equal(properties['--dropdown-height'], '188px');
    anchor.top = 300;
    anchor.bottom = 340;
    dispatch('scroll', context.document);
    assert.equal(dropdown.open, false);
    assert.equal(panel.visible, false);
});

test('Escape closes the floating menu and restores focus; clicking outside also dismisses it', () => {
    const anchor = { left: 100, top: 100, bottom: 140, width: 280 };
    const { dropdown, panel, summary, dispatch } = setup(anchor);
    let prevented = false;
    dispatch('keydown', summary, { key: 'Escape', preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
    assert.equal(dropdown.open, false);
    assert.equal(panel.visible, false);
    assert.equal(summary.focused, true);
    dropdown.open = true;
    dispatch('toggle');
    dispatch('click', {});
    assert.equal(dropdown.open, false);
    assert.equal(panel.visible, false);
});
