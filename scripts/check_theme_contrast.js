'use strict';
// scripts/check_theme_contrast.js — テーマの WCAG コントラスト機械検査(ST-11)。
// テーマファイル(styles/themes/simplicity_<name>.css)のトークン値から、
// 意味名が対をなす前景/背景の組のコントラスト比を計算し、閾値を下回れば fail する。
// 使い方: node scripts/check_theme_contrast.js dark        (ゲート: 閾値未満で exit 1)
//         node scripts/check_theme_contrast.js default --report  (報告のみ・fail しない)

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const name = process.argv[2];
const reportOnly = process.argv.includes('--report');
if (!name) {
    console.error('usage: node scripts/check_theme_contrast.js <theme-name> [--report]');
    process.exit(2);
}

const cssText = fs.readFileSync(path.join(ROOT, 'styles', 'themes', `simplicity_${name}.css`), 'utf8');
const tokens = {};
for (const m of cssText.matchAll(/(--spl-[A-Za-z0-9_-]+)\s*:\s*([^;]+);/g)) {
    tokens[m[1]] = m[2].trim();
}

const parseColor = (value) => {
    let v = value.trim();
    const hex = v.match(/^#([0-9a-fA-F]{3,8})$/);
    if (hex) {
        let h = hex[1];
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
    }
    const rgb = v.match(/^rgba?\(([^)]+)\)$/);
    if (rgb) {
        const parts = rgb[1].split(',').map(s => parseFloat(s));
        return parts.slice(0, 3);
    }
    return null;
};

const relativeLuminance = ([r, g, b]) => {
    const lin = [r, g, b].map(c => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
};

const ratio = (fg, bg) => {
    const l1 = relativeLuminance(fg);
    const l2 = relativeLuminance(bg);
    const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
};

// 検査する前景/背景の組(意味名の対)。threshold: 4.5 = AA 本文、3.0 = 大きな文字・UI 部品
const PAIRS = [
    ['--spl-text-black', '--spl-bgcolor-light', 4.5],
    ['--spl-text-black-light', '--spl-bgcolor-light', 4.5],
    ['--spl-text-darkgray', '--spl-bgcolor-light', 4.5],
    ['--spl-text-gray', '--spl-bgcolor-light', 3.0],
    ['--spl-text-placeholder', '--spl-bgcolor-light', 3.0],
    ['--spl-textcolor-on-semilight', '--spl-bgcolor-semilight', 4.5],
    ['--spl-linecolor-on-semilight', '--spl-bgcolor-semilight', 1.5],
    ['--spl-header-menu-on', '--spl-header-bg', 4.5],
    ['--spl-header-menu-off', '--spl-header-bg', 3.0],
    ['--spl-footer-anchor-default', '--spl-footer-background', 4.5],
    ['--spl-white', '--spl-keycolor', 3.0],
    ['--spl-alert-red', '--spl-bgcolor-light', 3.0],
    ['--spl-text-black', '--spl-bgcolor-highlight', 4.5],
    ['--spl-text-black', '--spl-hover-gray', 4.5]
];

let failed = 0;
for (const [fgToken, bgToken, threshold] of PAIRS) {
    const fg = parseColor(tokens[fgToken] || '');
    const bg = parseColor(tokens[bgToken] || '');
    if (!fg || !bg) {
        console.error(`unparseable pair: ${fgToken} / ${bgToken}`);
        failed++;
        continue;
    }
    const r = ratio(fg, bg);
    const ok = r >= threshold;
    if (!ok) failed++;
    console.log(`${ok ? 'ok ' : 'NG '} ${r.toFixed(2).padStart(5)} >= ${threshold}  ${fgToken} on ${bgToken}`);
}

if (failed && !reportOnly) {
    console.error(`theme contrast (${name}): ${failed} pairs below threshold`);
    process.exit(1);
}
console.log(`theme contrast (${name}): ${PAIRS.length - failed}/${PAIRS.length} pairs pass${reportOnly ? ' (report only)' : ''}`);
