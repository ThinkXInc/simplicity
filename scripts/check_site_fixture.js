'use strict';
// scripts/check_site_fixture.js — ST-2: site fixture の代表ページを jsdom で実行し、
// (1) スクリプト実行中の未捕捉エラーが無いこと、(2) ページ固有の描画マーカーが
// DOM に生成されることを機械判定する。起動済みランチャ(127.0.0.1:8500)に対して実行する。
// 実行: node scripts/check_site_fixture.js

const { JSDOM, VirtualConsole } = require('jsdom');

const BASE = 'http://127.0.0.1:8500';
const PAGES = [
    { url: '/v1/en/signin', markers: ['#signin *'] },
    { url: '/v1/en/signup', markers: ['#signup *'] },
    { url: '/v1/en/home', markers: ['#VerticalHeader', '#MaterialListContainer *', '#MaterialCreateView *'],
      // 実テンプレート materials.html が material_keywords_field.js を2回ロードするため、
      // 実ブラウザでも同じ SyntaxError が出る(現行挙動=正解。findings 記録済み)。
      knownErrors: [/Identifier 'MaterialKeywordsField' has already been declared/] },
    { url: '/v1/en/interviews', markers: ['#VerticalHeader', '#MainContent.interviews *'] }
];

const settle = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    let failed = 0;
    for (const page of PAGES) {
        const errors = [];
        const virtualConsole = new VirtualConsole();
        virtualConsole.on('jsdomError', (e) => {
            const text = String(e.detail || e.message || e);
            if (!/Could not load img|Could not load link|css parsing/i.test(text)) errors.push(text);
        });
        let dom;
        try {
            dom = await JSDOM.fromURL(`${BASE}${page.url}`, {
                resources: 'usable',
                runScripts: 'dangerously',
                pretendToBeVisual: true,
                virtualConsole,
                beforeParse(window) {
                    window.fetch = (input, init) =>
                        fetch(new URL(String(input), `${BASE}${page.url}`).href, init);
                    window.console = { log() {}, warn() {}, error(...a) { /* アプリ内 console.error は許容 */ },
                        info() {}, table() {}, debug() {} };
                }
            });
        } catch (e) {
            console.error(`${page.url}: load failed: ${e.message}`);
            failed++;
            continue;
        }
        await settle(1500);
        const missing = page.markers.filter(sel => !dom.window.document.querySelector(sel));
        const known = page.knownErrors || [];
        const pageErrors = errors.filter(Boolean).filter(e => !known.some(re => re.test(e)));
        if (missing.length || pageErrors.length) {
            failed++;
            console.error(`${page.url}: NG`);
            for (const m of missing) console.error(`  marker not rendered: ${m}`);
            for (const e of pageErrors.slice(0, 5)) console.error(`  error: ${e.split('\n')[0]}`);
        } else {
            console.log(`${page.url}: OK (markers rendered, no uncaught errors)`);
        }
        dom.window.close();
    }
    if (failed) process.exit(1);
    console.log(`site fixture smoke: ${PAGES.length}/${PAGES.length} pages OK`);
    process.exit(0);
})();
