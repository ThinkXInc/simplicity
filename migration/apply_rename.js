'use strict';
// migration/apply_rename.js — 写像表(rename_map.json)を機械適用する置換エンジン。
// simplicity 内の改名(ST-5/ST-6/ST-7)と、quantz-web への後日適用(ST-R・ADOPTION.md)の
// 両方で使う。クラスを扱う文脈だけを置換し、無制限な全文テキスト置換は行わない(D-38)。
//
// 使い方:
//   node migration/apply_rename.js --map rename_map.json --mode less --files <file...> [--dry-run]
//   node migration/apply_rename.js --map rename_map.json --mode js   --files <file...> [--dry-run]
//   node migration/apply_rename.js --map rename_map.json --mode html --files <file...> [--dry-run]
//
// モードごとの置換文脈:
//   less: セレクタ・mixin 名として現れる `.name` トークン(ファイル全域)
//   js:   (R1) 文字列リテラル内の `.name`(セレクタ形)
//         (R2) classList.add/remove/toggle/contains(...) の文字列引数の裸名
//         (R3) className への代入(= / +=)右辺リテラルの空白区切りトークン
//         残る「純クラスリスト形だが文脈不明」のリテラルは置換せず manual review として報告する
//   html: class 属性値の空白区切りトークン+<script> 内は js モード適用
//
// 置換の正しさは呼び出し側のオラクル(CSS宣言ゴールデン写像比較・スクショ回帰・
// gallery CSSマッチ・grep ゲート)が判定する。

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const getArg = (flag) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : null;
};
const dryRun = args.includes('--dry-run');
const mode = getArg('--mode');
const mapPath = getArg('--map');
const filesIndex = args.indexOf('--files');
const files = filesIndex >= 0 ? args.slice(filesIndex + 1).filter(a => !a.startsWith('--')) : [];

if (!mode || !mapPath || files.length === 0) {
    console.error('usage: node migration/apply_rename.js --map rename_map.json --mode less|js|html --files <file...> [--dry-run]');
    process.exit(2);
}
const renameMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const BOUNDARY = 'A-Za-z0-9_-';
const nameAlternation = Object.keys(renameMap)
    .sort((a, b) => b.length - a.length)
    .map(n => n.replace(/-/g, '\\-'))
    .join('|');

let totalReplacements = 0;
const manualReview = [];

// `.name` トークン(less セレクタ / 文字列内セレクタ形)
const renameDotForm = (text) =>
    text.replace(new RegExp(`\\.(${nameAlternation})(?![${BOUNDARY}])`, 'g'),
        (whole, name) => { totalReplacements++; return `.${renameMap[name]}`; });

// 空白区切りクラスリスト(class 属性値・className 代入値)
const renameClassList = (value) =>
    value.split(/(\s+)/).map(token =>
        renameMap[token] ? (totalReplacements++, renameMap[token]) : token).join('');

// 文字列リテラルを走査して中身だけ変換する(引用符は保持)
const mapStringLiterals = (code, transform) =>
    code.replace(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g,
        (whole, quote, body) => `${quote}${transform(body, whole)}${quote}`);

const renameJs = (code, file) => {
    // R2: classList.add('a', 'b') 等の引数スパン内の裸名リテラル
    code = code.replace(/(classList\s*\.\s*(?:add|remove|toggle|contains)\s*\()([^)]*)(\))/g,
        (whole, head, argsSpan, tail) =>
            head + mapStringLiterals(argsSpan, body =>
                renameMap[body] ? (totalReplacements++, renameMap[body]) : body) + tail);
    // R3: className = / += の右辺(同一文内のリテラル)
    code = code.replace(/(\.className\s*\+?=\s*)((?:[^;\n]*))/g,
        (whole, head, rhs) => head + mapStringLiterals(rhs, body => renameClassList(body)));
    // R1: 残る全文字列リテラル内のセレクタ形 `.name`
    code = mapStringLiterals(code, body => renameDotForm(body));
    // manual review: 純クラスリスト形(全トークンが旧名)なのに上記文脈で置換されず残ったリテラル
    const lines = code.split('\n');
    lines.forEach((line, i) => {
        for (const m of line.matchAll(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g)) {
            const body = m[2];
            if (!body || /[.{}$]/.test(body)) continue;
            const tokens = body.split(/\s+/).filter(Boolean);
            if (tokens.length && tokens.every(t => renameMap[t])) {
                manualReview.push(`${file}:${i + 1}: ${m[0]}`);
            }
        }
    });
    return code;
};

const renameHtml = (code, file) => {
    // class 属性(Jinja 変数は温存し、リテラルトークンのみ)
    code = code.replace(/(class\s*=\s*)(["'])([^"']*)\2/gi,
        (whole, head, quote, value) => `${head}${quote}${renameClassList(value)}${quote}`);
    // <script> ブロック内は js モード
    code = code.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/gi,
        (whole, open, body, close) => open + renameJs(body, file) + close);
    return code;
};

for (const file of files) {
    const before = fs.readFileSync(file, 'utf8');
    const beforeCount = totalReplacements;
    let after;
    if (mode === 'less') after = renameDotForm(before);
    else if (mode === 'js') after = renameJs(before, file);
    else if (mode === 'html') after = renameHtml(before, file);
    else { console.error(`unknown mode: ${mode}`); process.exit(2); }

    const count = totalReplacements - beforeCount;
    if (dryRun) {
        console.log(`[dry-run] ${file}: ${count} replacements`);
    } else {
        if (after !== before) fs.writeFileSync(file, after);
        console.log(`${file}: ${count} replacements`);
    }
}

if (manualReview.length) {
    console.log('--- manual review (置換しなかった純クラスリスト形リテラル) ---');
    for (const entry of manualReview) console.log(entry);
}
console.log(`total: ${totalReplacements} replacements in ${files.length} files${dryRun ? ' (dry-run)' : ''}`);
