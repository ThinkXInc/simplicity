'use strict';
// scripts/check_gallery_coverage.js — ギャラリー網羅+CSSセレクタ一致の機械検査(ST-1)。
// (1) 全30対象が data-gallery-component としてDOM上に存在すること。
// (2) 各対象のDOM(カード配下)にマッチする dist/simplicity_default.css のセレクタ集合が、
//     凍結ゴールデン(test/golden/gallery_css_match.json)と完全一致すること。
//     「当たるべきCSSが当たらない」(NextButton型)と「当たらないはずのCSSが当たる」
//     (疑似DOM型)の両方を検出する。ゴールデン更新は --update 明示時のみ。

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const goldenPath = path.join(root, 'test', 'golden', 'gallery_css_match.json');
const update = process.argv.includes('--update');

const html = fs.readFileSync(path.join(root, 'preview', 'gallery.html'), 'utf8')
    .replace(/<script[\s\S]*?<\/script>/g, '');
const fixtures = fs.readFileSync(path.join(root, 'preview', 'fixtures.js'), 'utf8');
const bundle = fs.readFileSync(path.join(root, 'dist', 'simplicity.js'), 'utf8');
const cssText = fs.readFileSync(path.join(root, 'dist', 'simplicity_default.css'), 'utf8');
const termsFixture = fs.readFileSync(path.join(root, 'preview', 'terms_fixture.html'), 'utf8');

const required = [
  'LoadingMessage', 'Notification', 'Mesh', 'LoadButton', 'ColorPicker',
  'TermsScrollView', 'VerifyCodeForm', 'RadioButton', 'PageView', 'Page',
  'LastNameFirstNamePage', 'SingleTextInputPage', 'Title', 'Button',
  'NextButton', 'BackButton', 'TextField', 'TableView', 'ModalView',
  'KeywordsField', 'DropdownButton', 'FileUploadView', 'FileUploadTableViewCell',
  'GradientLoadingBar', 'GradientViewLoader', 'PositionMap', 'MapPointer',
  'AlertMessage', 'Draggable', 'InputPageViewController'
];

const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'http://127.0.0.1:8000/preview/gallery.html'
});
dom.window.console = { log() {}, warn() {}, error() {}, warning() {}, table() {} };
// TermsScrollView.loadTemplate が fetch する templateUrl を、同梱 fixture の内容で応答する。
dom.window.fetch = () => Promise.resolve({ text: () => Promise.resolve(termsFixture) });
dom.window.eval([
    'window.google = { maps: { OverlayView: class {} } };',
    bundle,
    fixtures
].join('\n'));

const document = dom.window.document;

// dist の CSS を <style> として解析させ、全ルールのセレクタを平坦化して取り出す。
const styleElement = document.createElement('style');
styleElement.textContent = cssText;
document.head.appendChild(styleElement);

const selectors = [];
const collectRules = (rules) => {
    for (const rule of rules) {
        if (rule.type === 1 /* STYLE_RULE */ && rule.selectorText) {
            for (const s of rule.selectorText.split(',')) {
                const selector = s.trim();
                if (selector) selectors.push(selector);
            }
        } else if (rule.cssRules) {
            collectRules(rule.cssRules); // @media 等は中を再帰。@keyframes は cssRules が keyframe 型で type 1 を含まない
        }
    }
};
collectRules(styleElement.sheet.cssRules);
const uniqueSelectors = [...new Set(selectors)];

const finish = () => {
    // (1) 網羅検査
    const rendered = new Set(
        [...document.querySelectorAll('[data-gallery-component]')]
            .flatMap(element => element.dataset.galleryComponent.split(/ +/))
    );
    const missing = required.filter(name => !rendered.has(name));
    if (missing.length) {
        console.error(`Gallery coverage missing: ${missing.join(', ')}`);
        process.exit(1);
    }
    if (!document.querySelector('#gallery-page-view')) {
        console.error('Gallery PageView was not mounted');
        process.exit(1);
    }

    // (2) CSSセレクタ一致検査
    const matchesByName = {};
    for (const name of required) {
        const roots = [...document.querySelectorAll(`[data-gallery-component~="${name}"]`)];
        const scope = roots.flatMap(r => [r, ...r.querySelectorAll('*')]);
        const matched = new Set();
        for (const selector of uniqueSelectors) {
            let hit = false;
            for (const element of scope) {
                try {
                    if (element.matches(selector)) { hit = true; break; }
                } catch (e) { break; /* 未対応セレクタは全要素で不成立扱い */ }
            }
            if (hit) matched.add(selector);
        }
        matchesByName[name] = [...matched].sort();
    }

    if (update) {
        fs.writeFileSync(goldenPath, JSON.stringify(matchesByName, null, 2) + '\n');
        console.log(`gallery_css_match golden updated: ${goldenPath}`);
        process.exit(0);
    }

    if (!fs.existsSync(goldenPath)) {
        console.error(`Golden not found: ${goldenPath} (run with --update to freeze)`);
        process.exit(1);
    }
    const golden = JSON.parse(fs.readFileSync(goldenPath, 'utf8'));
    const problems = [];
    for (const name of required) {
        const expected = golden[name] || [];
        const actual = matchesByName[name] || [];
        const missingSelectors = expected.filter(s => !actual.includes(s));
        const extraSelectors = actual.filter(s => !expected.includes(s));
        if (missingSelectors.length || extraSelectors.length) {
            problems.push({ name, missingSelectors, extraSelectors });
        }
    }
    if (problems.length) {
        for (const p of problems) {
            console.error(`CSS match changed for ${p.name}:`);
            if (p.missingSelectors.length) console.error(`  no longer matches: ${p.missingSelectors.join(' | ')}`);
            if (p.extraSelectors.length) console.error(`  newly matches: ${p.extraSelectors.join(' | ')}`);
        }
        process.exit(1);
    }

    console.log(`Gallery initialization and coverage: ${required.length}/${required.length}`);
    console.log(`Gallery CSS selector match: ${required.length}/${required.length} targets match golden`);
    process.exit(0);
};

// fetch(TermsScrollView)や表示系の非同期処理が settle するのを待ってから検査する。
setTimeout(finish, 100);
