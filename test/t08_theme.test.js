'use strict';
// test/t08_theme.test.js — Simplicity.setTheme / getTheme の特性テスト(ST-10)。
// テーマ=スタイルシート1枚(D-44)。setTheme は simplicity_<name>.css の link を
// 差し替えるだけであり、html 属性・localStorage 等の副作用を持たないことを固定する。

const { test } = require('node:test');
const assert = require('node:assert');
const { makeProbe } = require('./helpers/probe');

const setup = `
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/js/simplicity/dist/simplicity_default.css';
    document.head.appendChild(link);
`;

test('T-08 getTheme parses the linked theme name', () => {
    const probe = makeProbe();
    const result = probe(`(() => { ${setup} return Simplicity.getTheme(); })()`);
    assert.deepStrictEqual(result, { ok: true, value: 'default' });
});

test('T-08 setTheme inserts the renamed link after the current one', () => {
    const probe = makeProbe();
    const result = probe(`(() => { ${setup}
        Simplicity.setTheme('dark');
        const hrefs = [...document.querySelectorAll('link[rel=stylesheet]')]
            .map(l => l.getAttribute('href'));
        return { hrefs, theme: Simplicity.getTheme() };
    })()`);
    assert.deepStrictEqual(result, {
        ok: true,
        value: {
            hrefs: [
                '/js/simplicity/dist/simplicity_default.css',
                '/js/simplicity/dist/simplicity_dark.css'
            ],
            theme: 'dark'
        }
    });
});

test('T-08 setTheme to the current theme is a no-op', () => {
    const probe = makeProbe();
    const result = probe(`(() => { ${setup}
        Simplicity.setTheme('default');
        return document.querySelectorAll('link[rel=stylesheet]').length;
    })()`);
    assert.deepStrictEqual(result, { ok: true, value: 1 });
});

test('T-08 setTheme has no html-attribute / storage side effects', () => {
    const probe = makeProbe();
    const result = probe(`(() => { ${setup}
        Simplicity.setTheme('dark');
        return {
            htmlAttrs: document.documentElement.getAttributeNames(),
            storageLength: window.localStorage ? window.localStorage.length : 0
        };
    })()`);
    assert.deepStrictEqual(result, { ok: true, value: { htmlAttrs: [], storageLength: 0 } });
});

test('T-08 setTheme without a theme link does not throw', () => {
    const probe = makeProbe();
    const result = probe(`(() => { Simplicity.setTheme('dark'); return Simplicity.getTheme(); })()`);
    assert.deepStrictEqual(result, { ok: true, value: null });
});
