'use strict';
// src 全ファイルのトップレベル定義名を抽出し、ESLint の globals 許可リストを生成する。
// - コメント(// と /* */)を除去してから走査する(JSDoc 内の "class" 等の誤検出防止)
// - class / function はインデント許容(F-8: 非行頭のトップレベル宣言が実在するため)
// - const / let / var は行頭のみ(インデントされたものは関数内ローカルでありグローバルではない)
const fs = require('fs');
const path = require('path');
function walk(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (e.name.endsWith('.js')) out.push(p);
    }
    return out;
}
function stripComments(s) {
    return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}
const names = new Set();
for (const f of walk('src')) {
    const src = stripComments(fs.readFileSync(f, 'utf8'));
    for (const m of src.matchAll(/^[ \t]*(?:class|function)\s+([A-Za-z_$][\w$]*)/gm)) names.add(m[1]);
    for (const m of src.matchAll(/^(?:const|let|var)\s+([A-Za-z_$][\w$]*)/gm)) names.add(m[1]);
}
fs.writeFileSync('scripts/simplicity_globals.json',
    JSON.stringify([...names].sort(), null, 2));
console.log(`gen_globals: ${names.size} identifiers`);
