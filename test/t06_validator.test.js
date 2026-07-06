'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { makeProbe } = require('./helpers/probe');

const golden = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'golden', 't06_validator.json'), 'utf8'));

// gen_golden.js と文字列完全一致であること(同一評価で凍結が成立する)。
const inputsExpr = "['', null, 'a', 'A'.repeat(200), 'test@example.com', '12345', 'Password1', '+81-90-1234-5678', 'example.com', '100', '3.14', 'notanemail']";
const validators = {
    required: "{errorType: ValidationErrorType.required, errorMessage: 'req'}",
    maxLength: "{errorType: ValidationErrorType.maxLength, errorMessage: 'max $0', maxLength: 5}",
    emailFormat: "{errorType: ValidationErrorType.emailFormat, errorMessage: 'email'}",
    passwordFormat: "{errorType: ValidationErrorType.passwordFormat, errorMessage: 'pw'}",
    telFormat: "{errorType: ValidationErrorType.telFormat, errorMessage: 'tel'}",
    postalCodeFormat: "{errorType: ValidationErrorType.postalCodeFormat, errorMessage: 'postal'}",
    domainFormat: "{errorType: ValidationErrorType.domainFormat, errorMessage: 'domain'}",
    positiveIntegerFormat: "{errorType: ValidationErrorType.positiveIntegerFormat, errorMessage: 'posint $0 $1', min: 1, max: 100}",
    positiveFloatFormat: "{errorType: ValidationErrorType.positiveFloatFormat, errorMessage: 'posfloat $0 $1', min: 0, max: 100}",
    notCorresponding: "{errorType: ValidationErrorType.notCorresponding, errorMessage: 'notcorr'}",
};

// 全 errorType × 全入力の validate() 戻り値/例外を固定。
// 既知の穴(postalCodeFormat=case欠落で常にnull、notCorresponding=未定義メソッドでTypeError、
// maxLength=null入力でTypeError)も現挙動として凍結する(修正禁止)。
test('T-06 Validator.validate characterization', () => {
    const probe = makeProbe();
    for (const [name, ctor] of Object.entries(validators)) {
        const build = probe('(() => { new Validator(' + ctor + '); return "constructed"; })()');
        assert.deepStrictEqual(build, golden[name].construct, name + ' construct');
        const results = probe(
            '(() => { const v = new Validator(' + ctor + '); return ' + inputsExpr +
            '.map(inp => { try { return { ok: true, value: v.validate(inp) }; } catch (e) { return { ok: false, error: e.name + ": " + e.message }; } }); })()'
        );
        assert.deepStrictEqual(results.value, golden[name].resultsByInput, name + ' results');
    }
});
