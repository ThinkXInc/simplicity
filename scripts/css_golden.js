'use strict';
// scripts/css_golden.js — ST-3(a): CSS 宣言ゴールデン。
// dist/simplicity_default.css を「(メディア文脈, セレクタ) → 正規化宣言集合」へ落とし、
// test/golden/css_declarations.json と比較する。ビルド(npx gulp styles 相当)後に実行する。
//
// 使い方:
//   node scripts/css_golden.js              比較(差分があれば exit 1)
//   node scripts/css_golden.js --update     ゴールデンを凍結し直す(意図的な更新のみ)
//   node scripts/css_golden.js --map rename_map.json
//       ゴールデン側セレクタのクラス名に写像(旧名→新名)を適用してから比較(ST-5 の判定器)
//   node scripts/css_golden.js --resolve-vars
//       両側の値の var(--x[, fallback]) を :root のカスタムプロパティで解決してから比較(ST-9 の判定器)

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const CSS_PATH = path.join(ROOT, 'dist', 'simplicity_default.css');
const GOLDEN_PATH = path.join(ROOT, 'test', 'golden', 'css_declarations.json');

const args = process.argv.slice(2);
const update = args.includes('--update');
const resolveVars = args.includes('--resolve-vars');
const mapIndex = args.indexOf('--map');
const mapPath = mapIndex >= 0 ? args[mapIndex + 1] : null;

const parseCss = (cssText) => {
    const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
    const style = dom.window.document.createElement('style');
    style.textContent = cssText;
    dom.window.document.head.appendChild(style);

    const model = {};
    let fontFaceIndex = 0;
    const declsOf = (styleDecl) => {
        const out = {};
        for (let i = 0; i < styleDecl.length; i++) {
            const prop = styleDecl[i];
            const priority = styleDecl.getPropertyPriority(prop);
            out[prop] = styleDecl.getPropertyValue(prop).trim() + (priority ? ' !important' : '');
        }
        return out;
    };
    const mergeInto = (key, decls) => {
        model[key] = { ...(model[key] || {}), ...decls };
    };
    const walk = (rules, context) => {
        for (const rule of rules) {
            if (rule.type === 1) { // style rule
                for (const raw of rule.selectorText.split(',')) {
                    mergeInto(`${context}${raw.trim()}`, declsOf(rule.style));
                }
            } else if (rule.type === 4) { // @media
                walk(rule.cssRules, `${context}@media ${rule.conditionText || rule.media.mediaText} :: `);
            } else if (rule.type === 7) { // @keyframes
                for (const kf of rule.cssRules) {
                    mergeInto(`${context}@keyframes ${rule.name} :: ${kf.keyText}`, declsOf(kf.style));
                }
            } else if (rule.type === 5) { // @font-face(出現順で識別)
                mergeInto(`${context}@font-face#${fontFaceIndex++}`, declsOf(rule.style));
            }
        }
    };
    walk(style.sheet.cssRules, '');
    return model;
};

const sortModel = (model) => {
    const sorted = {};
    for (const key of Object.keys(model).sort()) {
        const decls = model[key];
        sorted[key] = Object.fromEntries(Object.keys(decls).sort().map(p => [p, decls[p]]));
    }
    return sorted;
};

// :root のカスタムプロパティで var() を解決する(ネスト対応・フォールバック対応)
const resolveVarsInModel = (model) => {
    const custom = {};
    for (const [key, decls] of Object.entries(model)) {
        if (/^:root$|^html$/.test(key)) {
            for (const [prop, value] of Object.entries(decls)) {
                if (prop.startsWith('--')) custom[prop] = value;
            }
        }
    }
    const resolveValue = (value) => {
        let previous = null;
        let current = value;
        let guard = 0;
        while (current !== previous && guard++ < 10) {
            previous = current;
            current = current.replace(/var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,\s*([^()]*))?\)/g,
                (_, name, fallback) => custom[name] !== undefined ? custom[name] : (fallback !== undefined ? fallback.trim() : `var(${name})`));
        }
        return current;
    };
    const out = {};
    for (const [key, decls] of Object.entries(model)) {
        out[key] = Object.fromEntries(Object.entries(decls).map(([p, v]) => [p, resolveValue(v)]));
    }
    return out;
};

// 写像表(旧クラス名→新クラス名)をセレクタ中のクラストークンへ適用する
const applyRenameMap = (model, renameMap) => {
    const renameSelector = (selector) =>
        selector.replace(/\.(-?[A-Za-z_][A-Za-z0-9_-]*)/g,
            (whole, name) => renameMap[name] ? `.${renameMap[name]}` : whole);
    const out = {};
    for (const [key, decls] of Object.entries(model)) {
        out[renameSelector(key)] = decls;
    }
    return out;
};

// ---- main ----

if (!fs.existsSync(CSS_PATH)) {
    console.error(`not found: ${CSS_PATH} (先に CSS をビルドする)`);
    process.exit(1);
}
let current = sortModel(parseCss(fs.readFileSync(CSS_PATH, 'utf8')));

if (update) {
    fs.writeFileSync(GOLDEN_PATH, JSON.stringify(current, null, 2) + '\n');
    console.log(`css declaration golden updated: ${GOLDEN_PATH} (${Object.keys(current).length} selectors)`);
    process.exit(0);
}

if (!fs.existsSync(GOLDEN_PATH)) {
    console.error(`golden not found: ${GOLDEN_PATH} (--update で凍結する)`);
    process.exit(1);
}
let golden = JSON.parse(fs.readFileSync(GOLDEN_PATH, 'utf8'));

if (mapPath) {
    golden = sortModel(applyRenameMap(golden, JSON.parse(fs.readFileSync(mapPath, 'utf8'))));
}
if (resolveVars) {
    golden = sortModel(resolveVarsInModel(golden));
    current = sortModel(resolveVarsInModel(current));
}

// トークン定義だけのセレクタ(宣言が全て --custom property)は描画に直接寄与しないため
// 比較対象から外す(var() 解決の入力としては resolveVarsInModel が先に読んでいる)
const stripTokenOnly = (model) => Object.fromEntries(
    Object.entries(model).filter(([key, decls]) =>
        !Object.keys(decls).every(prop => prop.startsWith('--'))));
golden = stripTokenOnly(golden);
current = stripTokenOnly(current);

const problems = [];
const keys = new Set([...Object.keys(golden), ...Object.keys(current)]);
for (const key of [...keys].sort()) {
    const g = golden[key];
    const c = current[key];
    if (!c) { problems.push(`selector missing: ${key}`); continue; }
    if (!g) { problems.push(`selector added: ${key}`); continue; }
    const props = new Set([...Object.keys(g), ...Object.keys(c)]);
    for (const prop of [...props].sort()) {
        if (g[prop] === undefined) problems.push(`${key} :: ${prop} added: ${c[prop]}`);
        else if (c[prop] === undefined) problems.push(`${key} :: ${prop} missing (was: ${g[prop]})`);
        else if (g[prop] !== c[prop]) problems.push(`${key} :: ${prop} changed: ${g[prop]} -> ${c[prop]}`);
    }
}

if (problems.length) {
    for (const p of problems) console.error(p);
    console.error(`css declaration golden: ${problems.length} differences`);
    process.exit(1);
}
console.log(`css declaration golden: match (${Object.keys(current).length} selectors)`);
