'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// 重要な罠: concat バンドル内のトップレベル class/const/let は
// 「グローバル・レキシカル束縛」であり window のプロパティにならない。
// したがって window.Button は undefined になる。検証は必ず
// evalInPage('typeof Button') のように同一スクリプトスコープ内の
// eval で行うこと。
function loadBundle() {
    const dom = new JSDOM('<!doctype html><html><body></body></html>', {
        url: 'https://localhost/',
        runScripts: 'outside-only',
    });
    const w = dom.window;
    // 外部ランタイム依存の最小スタブ(§1.3)
    w.Cookies = { get: () => undefined, set: () => {}, remove: () => {} };
    w.google = { maps: { OverlayView: class {}, LatLng: class {} } };
    const code = fs.readFileSync(
        path.join(__dirname, '..', '..', 'dist', 'simplicity.js'), 'utf8');
    w.eval(code);
    const evalInPage = (expr) => w.eval(expr);
    return { dom, window: w, evalInPage };
}
module.exports = { loadBundle };
