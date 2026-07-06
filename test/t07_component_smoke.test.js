'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { makeProbe } = require('./helpers/probe');

const golden = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'golden', 't07_component.json'), 'utf8'));

const buildExpr = (c) =>
    "(() => { const o = new " + c + "('t-" + c.toLowerCase() + "', new " + c + "Config()); " +
    "return { name: o.constructor.name, hasView: typeof o.$view !== 'undefined', tag: (o.$view && o.$view.tagName) || null }; })()";

// 構築可能なリーフ4種は {constructor.name, $view有無, $view.tagName} を固定。
test('T-07 leaf components construct with expected view tags', () => {
    const probe = makeProbe();
    for (const c of ['Button', 'Title', 'NextButton', 'BackButton']) {
        assert.deepStrictEqual(probe(buildExpr(c)), golden[c], c);
    }
});

// TextField は Config クラスがソースに存在せず現状 new で ReferenceError(§T-07 縮退規則)。
// 構築の現挙動(失敗)を固定しつつ、識別子としては関数であることのみ確認する。
test('T-07 TextField construction currently throws (degraded to typeof)', () => {
    const probe = makeProbe();
    const built = probe(buildExpr('TextField'));
    assert.strictEqual(built.ok, false, 'TextField construction is expected to throw');
    assert.deepStrictEqual(built, golden.TextField);
    assert.deepStrictEqual(probe('typeof TextField'), { ok: true, value: 'function' });
});
