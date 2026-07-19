'use strict';
// preview/site/stubs/stripe.js — Stripe.js のローカルスタブ(fixture 所有)。
// card_input.js が使う API 面(elements / confirmSetup)を no-op で受け、
// カード入力 UI の「枠」まで描画できるようにする。決済動作は fixture の対象外。
window.Stripe = function Stripe() {
    return {
        elements() {
            return {
                create() {
                    return {
                        mount(target) {
                            const element = typeof target === 'string' ? document.querySelector(target) : target;
                            if (element) {
                                element.textContent = 'Stripe card element (stub)';
                                element.style.border = '1px dashed #999';
                                element.style.padding = '8px';
                            }
                        },
                        on() {},
                        update() {},
                        unmount() {}
                    };
                },
                getElement() { return null; }
            };
        },
        async confirmSetup() { return { error: { message: 'stub: payments disabled in preview' } }; },
        async confirmCardSetup() { return { error: { message: 'stub: payments disabled in preview' } }; },
        async createToken() { return { token: { id: 'tok_preview_stub' } }; }
    };
};
