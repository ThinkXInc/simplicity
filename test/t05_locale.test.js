'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { makeProbe } = require('./helpers/probe');

const golden = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'golden', 't05_locale.json'), 'utf8'));

const DICT = "new Locale({greet: {en: 'Hello', ja: 'こんにちは'}})";

// 正常取得2件と、キー不在・言語不在の throw を固定。
test('T-05 Locale.get characterization', () => {
    const probe = makeProbe();
    assert.deepStrictEqual(probe("(" + DICT + ").get('greet','en')"), golden.greet_en);
    assert.deepStrictEqual(probe("(" + DICT + ").get('greet','ja')"), golden.greet_ja);
    assert.deepStrictEqual(probe("(" + DICT + ").get('nope','en')"), golden.missing_key);
    assert.deepStrictEqual(probe("(" + DICT + ").get('greet','de')"), golden.missing_lang);
});
