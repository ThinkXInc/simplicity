'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { loadBundle } = require('./helpers/load_bundle');

// dist からトップレベル class/function 名を抽出する(ゴールデン生成と同一の正規表現)。
function extractInventory(code) {
    const n = [...code.matchAll(/^(?:class|function)\s+([A-Za-z_$][\w$]*)/gm)].map(m => m[1]);
    return [...new Set(n)].sort();
}

test('top-level class/function inventory matches golden', () => {
    const code = fs.readFileSync(
        path.join(__dirname, '..', 'dist', 'simplicity.js'), 'utf8');
    const actual = extractInventory(code);
    const golden = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'golden', 'class_inventory.json'), 'utf8'));
    assert.deepStrictEqual(actual, golden);
});

test('every inventory name is a function in page scope', () => {
    const { evalInPage } = loadBundle();
    const golden = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'golden', 'class_inventory.json'), 'utf8'));
    for (const name of golden) {
        assert.strictEqual(
            evalInPage('typeof ' + name), 'function', name + ' should be a function');
    }
});
