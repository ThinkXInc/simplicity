'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { makeProbe } = require('./helpers/probe');

const golden = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'golden', 't03_utils.json'), 'utf8'));

// Utils.isInheritedFrom は object.constructor の親プロトタイプ鎖を辿るため、
// 同一クラス(親から探索開始)は false になる。現挙動をゴールデンで固定。
test('T-03 Utils.isInheritedFrom characterization', () => {
    const probe = makeProbe();
    assert.deepStrictEqual(
        probe('Utils.isInheritedFrom(new NextButtonConfig(), ViewComponentConfig)'),
        golden.nextButtonConfig_from_viewComponentConfig);
    assert.deepStrictEqual(
        probe('Utils.isInheritedFrom(new ViewComponentConfig(), ViewComponentConfig)'),
        golden.viewComponentConfig_from_itself);
    assert.deepStrictEqual(
        probe('(() => { class A {} return Utils.isInheritedFrom(new A(), ViewComponentConfig); })()'),
        golden.plainClassA_from_viewComponentConfig);
});
