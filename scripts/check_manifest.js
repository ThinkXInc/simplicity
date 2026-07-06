'use strict';
// src/**/*.js が gulpfile の jsFiles に全て載っているか検査する。
// 既知の孤児(オーナー判断待ち)は ALLOWLIST に明示する。
const fs = require('fs');
const path = require('path');

const ALLOWLIST = new Set([
    'src/pages/address_input_page.js',
    'src/pages/file_upload_page.js',
    'src/pages/select_options_page.js',
    'src/view_component_bases/wrapper.js',
    'src/view_components/content_table_view.js',
    'src/view_components/description.js',
    'src/view_components/edit_content_view.js',
    'src/view_components/map_balloon.js',
    'src/view_components/map_pointer.js',
    'src/view_components/page_navigation_view.js',
    'src/view_components/search_box.js',
    'src/view_components/step_indicator.js',
    'src/view_components/translate_results_table_view.js',
]);

function walk(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (e.name.endsWith('.js')) out.push(p.replace(/\\/g, '/'));
    }
    return out;
}

const gulpfile = fs.readFileSync('gulpfile.js', 'utf8');
const manifest = new Set(
    [...gulpfile.matchAll(/'\.\/(src\/[^']+\.js)'/g)].map(m => m[1]));
const actual = walk('src');

const orphans = actual.filter(f => !manifest.has(f) && !ALLOWLIST.has(f));
const stale = [...ALLOWLIST].filter(f => !fs.existsSync(f));

if (orphans.length || stale.length) {
    if (orphans.length) console.error('NEW ORPHANS (add to gulpfile or ALLOWLIST):\n' + orphans.join('\n'));
    if (stale.length) console.error('STALE ALLOWLIST ENTRIES (remove):\n' + stale.join('\n'));
    process.exit(1);
}
console.log('manifest check: OK');
