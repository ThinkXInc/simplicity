'use strict';
// playwright.config.js — ST-3(b): スクリーンショット回帰の設定。
// 実行: npm run check:screens / ゴールデン更新: npm run check:screens -- --update-snapshots
// ゴールデンは test/screens/golden/ に置く(本マシン darwin/arm64 のレンダリングが基準)。

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: 'test/screens',
    outputDir: 'test/screens/.results',
    snapshotPathTemplate: '{testDir}/golden/{arg}{ext}',
    fullyParallel: false,
    workers: 1,
    retries: 0,
    reporter: [['list']],
    use: {
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
    },
    expect: {
        toHaveScreenshot: { maxDiffPixels: 0, animations: 'disabled' },
    },
    webServer: [
        {
            command: 'python3 -m http.server 8000',
            url: 'http://127.0.0.1:8000/preview/gallery.html',
            reuseExistingServer: true,
            cwd: __dirname,
        },
        {
            command: 'preview/site/venv/bin/python preview/site/preview_main.py',
            url: 'http://127.0.0.1:8500/',
            reuseExistingServer: true,
            cwd: __dirname,
        },
    ],
});
