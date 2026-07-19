# simplicity 開発規約

このリポジトリは monorepo(thinkx-system)外の独立リポジトリであり、通常 `~/Sources/` に
thinkx-system・quantz-web と並置される。唯一の実消費者は quantz-web(submodule SHA 固定消費)。

**リファクタリング作戦の期間中は `CLAUDE_REFACTORING.md` を併読すること**(セッション規律・
ブランチ/push 規約・計画書ルーティングはそちらが正)。作戦完了後、同ファイルは
docs/archive/ へ格納され、本ファイルだけが残る。

## 設計原則(変更禁止)
- 本フレームワークは意図的に concat + グローバル名前空間で設計されている。
  src 配下に import / export / require を書いてはならない(eslint が構文エラーにする)。
- 各ファイルのトップレベル class/function/const はグローバル名前空間を共有する。
  ファイル間の依存は gulpfile.js の jsFiles 配列の「順序」で解決される。

## 設計原則の原典(2022 コーディング原則)
- 原文: docs/coding_guides/ の coding_principles_2022(オーナー執筆・改変禁止)。
- 現行コードとの整合判定: docs/coding_guides/coding_principles_status.md が正。
  **規範として効くのは status が「現行規範」と判定した行のみ。**
  「構想(未実現)」の構造(page_control.js / window.Data 常用 / toJson)を前提に
  コードを書かない。「裁定待ち」項目の一括適用(strict 化・querySelector 統一・
  引用符方針等)は別計画で行う。

## 新規ファイルを追加するとき(必須手順)
1. src 配下に snake_case で作成する(クラス名は PascalCase)。
2. gulpfile.js の paths.jsFiles に、依存するファイルより「後」の位置に追記する。
   追記しない限り dist に入らない。npm run check:manifest が検出する。
3. npm run lint && npm run typecheck && npm test && npx gulp scripts を全て通す。

## 外部供給グローバル(バンドル外・types/globals.d.ts が正)
- Cookies(js-cookie)、google(Google Maps JS API)。
- 新しい外部グローバルへの依存を追加する場合は globals.d.ts と eslint.config.js に
  宣言を追加すること。宣言なき依存は lint が落とす。

## 検証コマンド
- ビルド: npx gulp scripts(dist/simplicity.js が唯一の成果物)
- テスト: npm test(jsdom 特性テスト。ゴールデンは test/golden/)
- lint: npm run lint / 型: npm run typecheck / マニフェスト: npm run check:manifest

## 禁止事項
- dist/ の手編集。
- attic/ のファイルを無断で src に戻すこと。
- 挙動変更を伴う「ついで修正」。バグを見つけたら findings.md に記録する。
- 新規コードでの console.log(debuglog を使う)、var、緩い ==。
- devDependencies の無断アップグレード(exact ピン。特に typescript は 6.x に固定。
  7.x への昇格は JS 型検査面の変更を伴うため意図的に行う)。
- JSDoc 型付け・checkJs:true 化・.ts 化(任意の「天井」。導入は別計画で)。

## 指示・決定の記録
- セッション中に受けたオーナー指示・裁定は docs/GUIDELINES.md に所定の書式で書き込む．書式は中身を見ればわかる．
- オーナーとの議論からの決定事項は docs/DECISIONS.md に記録する。
- 発見された書き留めておくに値することはfindings.mdに書き込む．