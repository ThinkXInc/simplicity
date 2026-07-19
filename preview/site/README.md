# preview/site — quantz-web 代表ページの site fixture(ST-2・dev 専用)

quantz-web の実テンプレート・実 LESS・実 JS を必要な範囲だけ固定コピーし、
最小 Flask で描画する確認用サイト。**デプロイ対象外**(uwsgi / nginx 設定なし)。
出所とコピー一覧は `MANIFEST.md`。MongoDB / Redis / Celery / Vector DB / LLM /
Stripe / Google OAuth は起動・通信せず、`fixtures/` の固定データと `stubs/` で
画面状態だけを再現する。simplicity の dist はコピーせず `../../dist` を直接 serve
する(ビルドし直せばリロードだけで反映される)。

## 起動

```
cd /Users/K00TSUKA/Sources/simplicity/preview/site
venv/bin/python preview_main.py
```

http://127.0.0.1:8500/ を開く(ページ一覧のリンクがある)。

## 初回のみ(venv 構築)

```
cd /Users/K00TSUKA/Sources/simplicity/preview/site
/opt/homebrew/bin/python3.11 -m venv venv
venv/bin/pip install -r requirements-preview.txt
```

## 再抽出(quantz-web の凍結 SHA から fixture を作り直す)

```
cd /Users/K00TSUKA/Sources/simplicity
node scripts/extract_site_fixture.js
npx lessc preview/site/src/less/main.less preview/site/static/css/main.css
```
