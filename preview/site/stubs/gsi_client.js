'use strict';
// preview/site/stubs/gsi_client.js — Google Identity Services のローカルスタブ(fixture 所有)。
// 実サイトの https://accounts.google.com/gsi/client の代替。外部通信をせず、
// ボタン描画・初期化を no-op で受ける。サインイン動作自体は fixture の対象外。
window.google = window.google || {};
window.google.accounts = window.google.accounts || {
    id: {
        initialize() {},
        renderButton(parent) {
            if (parent && parent.appendChild) {
                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = 'Sign in with Google (stub)';
                parent.appendChild(button);
            }
        },
        prompt() {}
    }
};
