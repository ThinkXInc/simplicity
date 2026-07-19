'use strict';
// scripts/check_rename_map.js — ST-4: rename_map.json の生成と機械検査。
// 写像規則は「全 simplicity 所有クラスへ接頭辞 spl- を一律付与」(style_plan v1.3 大原則5 / D-36)。
//
// 使い方:
//   node scripts/check_rename_map.js --update   台帳から rename_map.json を生成
//   node scripts/check_rename_map.js            検査(以後この表が全置換の唯一の入力)
// 検査項目:
//   (1) 台帳(style_class_inventory/simplicity_legacy_css_classes.txt)の全クラスが写像ドメインにある
//   (2) 写像ドメインに台帳外のクラスが無い(域=台帳)
//   (3) 新名が一意
//   (4) 新名が旧名のどれとも衝突しない
//   (5) quantz-web 依存候補台帳の全行が、写像ドメインのいずれかの名前を含む

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LEDGER = path.join(ROOT, 'style_class_inventory', 'simplicity_legacy_css_classes.txt');
const CANDIDATES = path.join(ROOT, 'style_class_inventory', 'quantz_web_css_class_dependency_candidates.txt');
const MAP_PATH = path.join(ROOT, 'rename_map.json');
const PREFIX = 'spl-';

const ledgerClasses = fs.readFileSync(LEDGER, 'utf8')
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('\t')[0]);

if (process.argv.includes('--update')) {
    const map = Object.fromEntries(ledgerClasses.map(name => [name, `${PREFIX}${name}`]));
    fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 2) + '\n');
    console.log(`rename_map.json generated: ${ledgerClasses.length} entries (prefix ${PREFIX})`);
    process.exit(0);
}

if (!fs.existsSync(MAP_PATH)) {
    console.error('rename_map.json not found (--update で生成する)');
    process.exit(1);
}
const map = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
const domain = Object.keys(map);
const range = Object.values(map);
const problems = [];

// (1)(2) 域=台帳
const ledgerSet = new Set(ledgerClasses);
const domainSet = new Set(domain);
for (const name of ledgerClasses) if (!domainSet.has(name)) problems.push(`ledger class not in map: ${name}`);
for (const name of domain) if (!ledgerSet.has(name)) problems.push(`map key not in ledger: ${name}`);

// (3) 新名一意
const seen = new Set();
for (const name of range) {
    if (seen.has(name)) problems.push(`duplicate new name: ${name}`);
    seen.add(name);
}

// (4) 新旧非衝突
for (const name of range) if (ledgerSet.has(name)) problems.push(`new name collides with old name: ${name}`);

// (5) 依存候補台帳の全行が写像ドメインの名前を含む
const namePatterns = domain.map(name => ({ name, re: new RegExp(`(^|[^A-Za-z0-9_-])${name.replace(/[-]/g, '\\-')}([^A-Za-z0-9_-]|$)`) }));
const candidateLines = fs.readFileSync(CANDIDATES, 'utf8')
    .split('\n')
    .filter(line => line && !line.startsWith('#'));
let uncovered = 0;
for (const line of candidateLines) {
    if (!namePatterns.some(p => p.re.test(line))) {
        uncovered++;
        if (uncovered <= 5) problems.push(`candidate line not covered by map domain: ${line.slice(0, 120)}`);
    }
}
if (uncovered > 5) problems.push(`... and ${uncovered - 5} more uncovered candidate lines`);

if (problems.length) {
    for (const p of problems) console.error(p);
    process.exit(1);
}
console.log(`rename map check: OK (${domain.length} entries, prefix ${PREFIX}, ${candidateLines.length} candidate lines covered)`);
