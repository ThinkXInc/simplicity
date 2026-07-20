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

    // 非既定テーマ(ST-11 dark / ST-12 variation): 消費側と同じ機構
    // (Simplicity.setTheme = link 差し替え)で切り替え、独立ゴールデンとして凍結する。
    // ギャラリーは実 UI(select)経由で切り替える。
    for (const theme of ['dark', 'variation_a', 'variation_b']) {
        test(`screenshot: ${shot.name}_${theme}`, async ({ page }) => {
            await page.clock.install({ time: new Date('2026-07-19T00:00:00Z') });
            await page.goto(shot.url, { waitUntil: 'load' });
            await page.clock.runFor(3000);
            if (shot.name === 'gallery') {
                await page.selectOption('#gallery-theme-select', theme);
            } else {
                await page.evaluate((name) => Simplicity.setTheme(name), theme);
            }
            // 新テーマ css の load 完了(旧 link の除去)を Node 側からポーリングで待つ
            // (page.clock 凍結中はページ内タイマーが進まないため waitForFunction は使えない)
            await expect(async () => {
                const themeLinks = await page.evaluate(() =>
                    [...document.querySelectorAll('link[rel="stylesheet"]')]
                        .map(l => l.getAttribute('href'))
                        .filter(href => /simplicity_[A-Za-z0-9_-]+\.css/.test(href)));
                expect(themeLinks.length).toBe(1);
                expect(themeLinks[0]).toContain(`simplicity_${theme}.css`);
            }).toPass({ timeout: 10000 });
            await expect(page).toHaveScreenshot(`${shot.name}_${theme}.png`, { fullPage: true });
        });
    }
}
