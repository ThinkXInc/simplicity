'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// ロード方式の根拠(v1.4 で修正済み):
// - 本番の消費形態は <script src=simplicity.js>。classic script のトップレベル
//   class/let/const は「レルムのグローバル・レキシカル環境」に永続束縛される
//   (window のプロパティにはならない)。script 要素注入はこれに忠実。
// - 旧方式 w.eval(code) の間接 eval では、レキシカル宣言は当該 eval 呼び出し限りの
//   宣言的環境に閉じ、別の w.eval から見えない(ES 仕様)。バンドルはほぼ class
//   宣言のため typeof 検証が全滅する。使用禁止。
// - 検証は evalInPage('typeof Button') のような「式」で行う。w.Button では見えない
//   (グローバル・レキシカル束縛は window プロパティではない)。
// - 規則: evalInPage 内で作った const/let/class も呼び出し限りで消える。
//   複数文のテストは必ず自己完結の IIFE で書くこと。例:
//   evalInPage('(() => { const b = new Button("t", new ButtonConfig()); return b.constructor.name; })()')
//   複数回の evalInPage にまたぐ状態が必要な場合だけ、明示的に window.__testState 等の
//   window プロパティへ保存する(レキシカル束縛は呼び出しをまたいで残らない)。
// Security note:
//   runScripts:'dangerously' は repo-owned の dist/simplicity.js のみを実行する。
//   ユーザー入力、外部URL、PR差分由来の未信頼 HTML/JS をここへ渡してはならない。
//   secrets を持つ CI job では、未信頼 PR に対してこのテストを実行しない。
//   resources:'usable' は使わない(ネットワークロードを必要にしない)。
function loadBundle({ presetGlobals } = {}) {
    const dom = new JSDOM('<!doctype html><html><body></body></html>', {
        url: 'https://localhost/',
        runScripts: 'dangerously',
    });
    const w = dom.window;
    // 外部ランタイム依存の最小スタブ(§1.3)— 必ずスクリプト注入より前に設定する
    w.Cookies = { get: () => undefined, set: () => {}, remove: () => {} };
    w.google = { maps: { OverlayView: class {}, LatLng: class {} } };
    if (presetGlobals) Object.assign(w, presetGlobals);   // T-08(R-10)等で使用
    const code = fs.readFileSync(
        path.join(__dirname, '..', '..', 'dist', 'simplicity.js'), 'utf8');
    const script = w.document.createElement('script');
    script.textContent = code;
    w.document.body.appendChild(script);   // 挿入時に同期実行される
    const evalInPage = (expr) => w.eval(expr);
    return { dom, window: w, evalInPage };
}
module.exports = { loadBundle };
