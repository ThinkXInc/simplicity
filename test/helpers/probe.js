'use strict';
const { loadBundle } = require('./load_bundle');

// 式を自己完結 IIFE で評価し {ok:true,value}|{ok:false,error} を JSON 経由で
// 安全に取得する。realm 跨ぎを避けるため必ず JSON 文字列で受け渡す。
// ゴールデン生成器(scratchpad/gen_golden.js)と同一ロジック — 両者が同じ現挙動を
// 独立に主張することで凍結が成立する。
function makeProbe(opts) {
    const { evalInPage } = loadBundle(opts);
    return (expr) => JSON.parse(evalInPage(
        '(() => { try { return JSON.stringify({ ok: true, value: (' + expr +
        ') }); } catch (e) { return JSON.stringify({ ok: false, error: e.name + ": " + e.message }); } })()'));
}
module.exports = { makeProbe };
