'use strict';
// scripts/check_no_legacy_classes.js — 改名後の木に旧クラス名が残っていないことの grep ゲート。
// rename_map.json のドメイン(旧名)を対象に、`.旧名` セレクタ形トークンの残存を数える。
// 使い方: node scripts/check_no_legacy_classes.js --files <file...>
//         (--bare を付けると裸名トークンも検査する — class 属性/クラスリスト用)

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

let hits = 0;
for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
        for (const m of line.matchAll(dotForm)) {
            hits++;
            if (hits <= 20) console.error(`${file}:${i + 1}: .${m[1]}`);
        }
        if (bare) {
            for (const m of line.matchAll(bareForm)) {
                hits++;
                if (hits <= 20) console.error(`${file}:${i + 1}: ${m[1]} (bare)`);
            }
        }
    });
}
if (hits) {
    console.error(`legacy class names remaining: ${hits}`);
    process.exit(1);
}
console.log(`legacy class check: 0 remaining in ${files.length} files`);
