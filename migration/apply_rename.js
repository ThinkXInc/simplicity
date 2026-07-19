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

// JS は @babel/parser のトークン列で文字列リテラル/テンプレート片だけを対象にする。
// 正規表現による引用符スキャンはコメント中のアポストロフィ("doesn't" 等)を引用符と
// 誤認しコード領域を書き換える事故を起こすため使わない(ST-6 で実測した失敗モード)。
const parser = require('@babel/parser');

const CLASSLIST_CALL_BEFORE = /classList\s*\.\s*(?:add|remove|toggle|contains)\s*\(\s*$/;
const CLASSLIST_ARG_BEFORE = /classList\s*\.\s*(?:add|remove|toggle|contains)\s*\([^()]*,\s*$/;
const CLASSNAME_ASSIGN_BEFORE = /\.className\s*\+?=\s*$/;

const renameJs = (code, file) => {
    let tokens;
    try {
        tokens = parser.parse(code, { tokens: true, sourceType: 'script' }).tokens;
    } catch (error) {
        console.error(`${file}: parse failed: ${error.message}`);
        process.exitCode = 1;
        return code;
    }
    const edits = [];
    const lineOf = (pos) => code.slice(0, pos).split('\n').length;
    for (const token of tokens) {
        const label = token.type.label;
        if (label !== 'string' && label !== 'template') continue;
        const raw = code.slice(token.start, token.end);
        const isString = label === 'string';
        const body = isString ? raw.slice(1, -1) : raw;
        if (!body) continue;
        const before = code.slice(Math.max(0, token.start - 120), token.start);

        let newBody = body;
        if (isString && (CLASSLIST_CALL_BEFORE.test(before) || CLASSLIST_ARG_BEFORE.test(before))) {
            if (renameMap[body]) { newBody = renameMap[body]; totalReplacements++; }
        } else if (isString && CLASSNAME_ASSIGN_BEFORE.test(before)) {
            newBody = renameClassList(body);
        }
        newBody = renameDotForm(newBody);

        if (newBody !== body) {
            edits.push({
                start: isString ? token.start + 1 : token.start,
                end: isString ? token.end - 1 : token.end,
                text: newBody
            });
        } else if (isString && !/[.{}$]/.test(body)) {
            // manual review: 純クラスリスト形(全トークンが旧名)なのに文脈が確定せず残ったリテラル
            const parts = body.split(/\s+/).filter(Boolean);
            if (parts.length && parts.every(part => renameMap[part])) {
                manualReview.push(`${file}:${lineOf(token.start)}: ${raw}`);
            }
        }
    }
    let out = code;
    for (const edit of edits.sort((a, b) => b.start - a.start)) {
        out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
    }
    return out;
};

const renameHtml = (code, file) => {
    // class 属性(Jinja 変数は温存し、リテラルトークンのみ)
    code = code.replace(/(class\s*=\s*)(["'])([^"']*)\2/gi,
        (whole, head, quote, value) => `${head}${quote}${renameClassList(value)}${quote}`);
    // <script> ブロック内は js モード。Jinja 式はプレースホルダにマスクしてから parse する。
    code = code.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/gi, (whole, open, body, close) => {
        const jinja = [];
        const masked = body.replace(/\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}|\{#[\s\S]*?#\}/g, (expr) => {
            jinja.push(expr);
            return `__JINJA_${jinja.length - 1}__`;
        });
        const renamed = renameJs(masked, file);
        const restored = renamed.replace(/__JINJA_(\d+)__/g, (m, i) => jinja[Number(i)]);
        return open + restored + close;
    });
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
