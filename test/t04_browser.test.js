'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { makeProbe } = require('./helpers/probe');

const golden = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'golden', 't04_browser.json'), 'utf8'));

// window.location 依存メソッドは jsdom の url='https://localhost/'(search 空)前提で固定。
// _getValueFromParams は 'number' 型を解さず default 分岐で null になる(現コードのまま)。
test('T-04 Browser url helpers characterization', () => {
    const probe = makeProbe();
    const g = golden.parseQueryStrings;
    assert.deepStrictEqual(probe("JSON.stringify(Browser.parseQueryStrings('?a=1&b=hello'))"), g.a1_bhello);
    assert.deepStrictEqual(probe("JSON.stringify(Browser.parseQueryStrings(''))"), g.empty);
    assert.deepStrictEqual(probe("JSON.stringify(Browser.parseQueryStrings('?a=1&a=2'))"), g.dup_a);
    assert.deepStrictEqual(probe("JSON.stringify(Browser.parseQueryStrings('?flag'))"), g.flag_only);

    const p = golden.getValueFromParams;
    assert.deepStrictEqual(probe("Browser._getValueFromParams('a', 'string', {a:'1'})"), p.present_string);
    assert.deepStrictEqual(probe("Browser._getValueFromParams('x', 'string', {a:'1'})"), p.absent_string);
    assert.deepStrictEqual(probe("Browser._getValueFromParams('a', 'number', {a:'1'})"), p.present_number);
    assert.deepStrictEqual(probe("Browser._getValueFromParams('x', 'number', {a:'1'})"), p.absent_number);
    assert.deepStrictEqual(probe("Browser._getValueFromParams('a', 'int', {a:'42'})"), p.present_int);
    assert.deepStrictEqual(probe("Browser._getValueFromParams('a', 'float', {a:'3.14'})"), p.present_float);

    assert.deepStrictEqual(
        probe("Browser.getValueFromSearchParams('anything', 'string')"),
        golden.getValueFromSearchParams_emptyLocation.any_string);
});
