'use strict';
// scripts/check_no_legacy_classes.js — 改名後の木に旧クラス名が残っていないことの grep ゲート。
// rename_map.json のドメイン(旧名)を対象に、`.旧名` セレクタ形トークンの残存を数える。
// 使い方: node scripts/check_no_legacy_classes.js [--js] --files <file...>
//   既定: ファイル全文の `.旧名` を数える(less / css 用)
//   --js: @babel/parser で文字列リテラル/テンプレート片の中だけを数える
//         (JS の `.error` 等のプロパティアクセスをクラスと誤検知しないため)
//   --bare: 裸名トークンも検査する(class 属性/クラスリスト用)

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const renameMap = JSON.parse(fs.readFileSync(path.join(ROOT, 'rename_map.json'), 'utf8'));

const args = process.argv.slice(2);
const bare = args.includes('--bare');
const filesIndex = args.indexOf('--files');
const files = filesIndex >= 0 ? args.slice(filesIndex + 1).filter(a => !a.startsWith('--')) : [];
if (!files.length) {
    console.error('usage: node scripts/check_no_legacy_classes.js [--bare] --files <file...>');
    process.exit(2);
}

const BOUNDARY = 'A-Za-z0-9_-';
const alternation = Object.keys(renameMap).sort((a, b) => b.length - a.length)
    .map(n => n.replace(/-/g, '\\-')).join('|');
const dotForm = new RegExp(`\\.(${alternation})(?![${BOUNDARY}])`, 'g');
const bareForm = new RegExp(`(?<![A-Za-z0-9_.-])(${alternation})(?![${BOUNDARY}])`, 'g');

const jsMode = args.includes('--js');
const parser = jsMode ? require('@babel/parser') : null;

let hits = 0;
const scanText = (file, text, lineBase) => {
    text.split('\n').forEach((line, i) => {
        for (const m of line.matchAll(dotForm)) {
            hits++;
            if (hits <= 20) console.error(`${file}:${lineBase + i}: .${m[1]}`);
        }
        if (bare) {
            for (const m of line.matchAll(bareForm)) {
                hits++;
                if (hits <= 20) console.error(`${file}:${lineBase + i}: ${m[1]} (bare)`);
            }
        }
    });
};

for (const file of files) {
    const code = fs.readFileSync(file, 'utf8');
    if (!jsMode) {
        scanText(file, code, 1);
        continue;
    }
    let tokens;
    try {
        tokens = parser.parse(code, { tokens: true, sourceType: 'script' }).tokens;
    } catch (error) {
        console.error(`${file}: parse failed: ${error.message}`);
        process.exit(1);
    }
    for (const token of tokens) {
        const label = token.type.label;
        if (label !== 'string' && label !== 'template') continue;
        const line = code.slice(0, token.start).split('\n').length;
        scanText(file, code.slice(token.start, token.end), line);
    }
}
if (hits) {
    console.error(`legacy class names remaining: ${hits}`);
    process.exit(1);
}
console.log(`legacy class check: 0 remaining in ${files.length} files`);
