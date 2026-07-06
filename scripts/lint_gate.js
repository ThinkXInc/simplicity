'use strict';
// eslint の no-undef エラーを凍結済みベースラインと比較する。
// 新規エラー → exit 1(混入を防ぐ)。既知エラー → 許容(修正禁止の原則と両立)。
// ベースラインに載っているのに消えたエラー → exit 1(無断修正 or 走査劣化の検出)。
const { execSync } = require('child_process');
const fs = require('fs');
const BASELINE = 'scripts/eslint_baseline.json';

let raw;
try {
    raw = execSync('npx eslint src -f json', { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
} catch (e) {
    raw = e.stdout; // eslint はエラー検出時に非0で終了するが JSON は stdout に出る
}
const results = JSON.parse(raw);
const current = [];
for (const f of results) {
    for (const m of f.messages) {
        if (m.ruleId === 'no-undef') {
            const rel = f.filePath.replace(/\\/g, '/').replace(/^.*?(src\/)/, '$1');
            current.push(`${rel}:${m.line}:${(m.message.match(/^'([^']+)'/) || [])[1]}`);
        }
    }
}
current.sort();

if (process.argv.includes('--freeze')) {
    fs.writeFileSync(BASELINE, JSON.stringify(current, null, 2));
    console.log(`lint_gate: baseline frozen (${current.length} known errors)`);
    process.exit(0);
}
const baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
const bset = new Set(baseline), cset = new Set(current);
const added = current.filter(x => !bset.has(x));
const removed = baseline.filter(x => !cset.has(x));
if (added.length || removed.length) {
    if (added.length) console.error('NEW no-undef ERRORS (fix your change):\n' + added.join('\n'));
    if (removed.length) console.error('BASELINE ENTRIES DISAPPEARED (update baseline intentionally):\n' + removed.join('\n'));
    process.exit(1);
}
console.log(`lint_gate: OK (${baseline.length} known, 0 new)`);
