'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { loadBundle } = require('./helpers/load_bundle');
test('dist/simplicity.js loads without throwing', () => {
    assert.doesNotThrow(() => loadBundle());
});
