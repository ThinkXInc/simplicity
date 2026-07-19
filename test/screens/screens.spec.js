'use strict';
// test/screens/screens.spec.js — ST-3(b): ギャラリー全景+site fixture 代表4ページの
// スクリーンショット回帰。JS タイマー駆動のアニメーション(GradientViewLoader 等)は
// Playwright の clock 制御で決定化する(実時間に依存しない)。

const { test, expect } = require('@playwright/test');

const SHOTS = [
    { name: 'gallery', url: 'http://127.0.0.1:8000/preview/gallery.html' },
    { name: 'site_signin', url: 'http://127.0.0.1:8500/v1/en/signin' },
    { name: 'site_signup', url: 'http://127.0.0.1:8500/v1/en/signup' },
    { name: 'site_home', url: 'http://127.0.0.1:8500/v1/en/home' },
    { name: 'site_interviews', url: 'http://127.0.0.1:8500/v1/en/interviews' },
];

for (const shot of SHOTS) {
    test(`screenshot: ${shot.name}`, async ({ page }) => {
        await page.clock.install({ time: new Date('2026-07-19T00:00:00Z') });
        await page.goto(shot.url, { waitUntil: 'load' });
        // タイマー・rAF を決定的に 3 秒ぶん進めて描画を静定させる
        await page.clock.runFor(3000);
        await expect(page).toHaveScreenshot(`${shot.name}.png`, { fullPage: true });
    });
}
