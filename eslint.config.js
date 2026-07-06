'use strict';
const globalsLib = require('globals');
const simplicityGlobals = Object.fromEntries(
    require('./scripts/simplicity_globals.json').map(n => [n, 'readonly']));

module.exports = [
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',   // import/export を構文エラーにする(設計の自己強制)
            globals: {
                ...globalsLib.browser,
                ...simplicityGlobals,
                Cookies: 'readonly',   // js-cookie(外部供給 §1.3)
                google: 'readonly',    // Google Maps JS API(外部供給 §1.3)
            },
        },
        rules: {
            'no-undef': 'error',
            'eqeqeq': 'warn',
            'no-var': 'warn',
            'no-unused-vars': 'warn',
        },
    },
];
