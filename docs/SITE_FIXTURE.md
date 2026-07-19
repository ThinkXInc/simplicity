# docs/SITE_FIXTURE.md

quantz-webの実画面をSimplicityの新しいスタイルでブラウザ確認するためのsite fixtureを定める。

## site fixtureとは

quantz-webの実際のテンプレート、LESS、JavaScriptを必要な範囲だけSimplicityへ固定コピーし、
ブラウザで表示できるようにした確認用サイトである。似せて作ったHTMLやスクリーンショットではない。

画面構造とUI処理はquantz-web由来のものを使う。一方、MongoDB、Redis、Celery、Vector DB、LLM、
Stripeなどの外部処理は実行せず、固定データまたはローカルスタブで画面状態だけを再現する。

## ブラウザで確認する画面

| 画面 | 主な確認対象 | 固定する外部処理 |
|---|---|---|
| サインイン | TextField、LoadButton、入力エラー | Google OAuth、ログインAPI |
| サインアップ | 複数ページ入力、バリデーション、プラン・カード入力 | Google OAuth、Stripe、登録API |
| Billing設定 | カード未登録・登録済み・拒否状態、支払上限入力 | Stripe、決済API |
| Material登録 | タイトル、本文、キーワード、質問・回答、ファイル入力 | Vector DB、アップロード・登録API |
| Material一覧 | 登録済みドキュメント、選択、編集、削除Modal | 一覧・削除API |
| Interview管理 | 一覧、作成、設定、共有リンク、結果表示 | Interview API、動画・LLM処理 |

`templates/main/materials.html`とMaterial系のcontroller/componentは、Material登録と一覧の両方を
構成するため優先して抽出する。`templates/main/interviews.html`とInterview管理系componentも
同様に優先する。

## ギャラリーで補完するもの

実ページ全体の起動依存が重い`create.html`、`studio.html`、実Interview実行画面、
`interview_top.html`は、そのページ全体をfixture化しない。そこで使うSimplicity部品は
`preview/gallery.html`で個別に確認する。

ギャラリーには表示に関係する全コンポーネントを可能な限り載せる。Page系の画面遷移、
FileUploadViewの各状態、Draggableを適用したデモ要素も含める。構築できないものは省略せず、
理由を一覧に残す。

## 抽出する主なファイル

- 共通テンプレート: `general/base.html`、`general/common.html`、header、footer、vertical header。
- 認証・決済: `signin.js`、`signup.js`、`card_input.js`、`settings_view.js`。
- Material: `material_create_view_controller.js`、`materials.js`、`material_*.js`、`material_create_page.js`。
- Interview管理: `interview_home_view_controller.js`、`interview_*.js`。
- LESS: general、common、accounts、materials、Material系、Interviews管理系。
- 画像・フォント: 選択画面と上記LESSが直接参照するローカル資産だけ。

完全なコピー一覧はST-2で`preview/site/MANIFEST.md`に出所SHAとともに記録する。

## ST-2で満たす条件

1. Jinjaのextends/include、script/link、LESS import、`url(...)`のローカル参照先を全て解決する。
2. コピーしない外部処理はスタブ一覧へ明記する。
3. Flaskランチャはquantz-web本体やMongoDB、Redis、Celery、Vector DB、LLMをimportしない。
4. 全確認URLの表示中に外部通信を行わない。
5. quantz-webリポジトリを変更しない。
