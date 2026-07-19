# coding_principles_2022 整合性判定(status)

原文: 同ディレクトリの coding_principles_2022(2022年・Evernote より回収。原文は改変禁止)。
実測: 2026-07-19、simplicity `2026refactor` = 53f0639 / quantz-web `master` = 99a9488 に対して実施。
本ファイルの役割: **規範として効くのは本ファイルが「現行規範」と判定した行のみ。**
「構想(未実現)」の構造を前提にコードを書いてはならない。「裁定待ち」の一括適用は別計画で行う。

## 判定表

### 設計原則(Principles)

| # | 原文の規則 | 実測 | 判定 |
|---|---|---|---|
| P1 | HTML は view component 化で小さく・階層浅く | quantz-web のテンプレートは薄く、UI は JS コンポーネント側にある | **現行規範** |
| P2 | component のテンプレートは HTML ファイルでなくクラスが保持 | 実装どおり(createElement 主体+一部 innerHTML テンプレート文字列。HTML 側にコンポーネント断片なし) | **現行規範** |
| P3 | component は自身の操作のみ・相互作用は ViewController | view_components / view_controllers の分離が両リポジトリに存在 | **現行規範** |
| P4 | 1 ViewController = 1 画面 | quantz-web は画面ごとに `*_view_controller.js`(create / deploy / settings / materials / interview_home 等) | **現行規範** |
| P5 | サーバ JSON は DataModel に変換し window.Data に保持 | 前半は実装(models/ に user / organization / session_model 等)。**後半の window.Data は quantz-web 全体で1ファイルのみ**(pages/material_create_page.js) | **裁定待ち**(window.Data 規約を復活させるか、廃止して「DataModel 変換のみ」を規範にするか) |
| P6 | 全 DataModel は JSON への逆変換メソッドを持つ | **toJson / toJSON は両リポジトリの models に 0 件** | **構想(未実現)**。必要になった時点で裁定 |
| P7 | 同期/非同期遷移の管理は page_control.js | **page_control.js はどこにも存在しない**(改名の形跡もなし) | **構想(未実現)**。前提にしない。復活/正式廃止は裁定待ち |
| P8 | 1 画面状態 = 1 URI | ルーティング構造は整合(機械検証はなし) | **現行規範**(設計意図として維持) |

### コーディングガイド(Coding Guide)

| # | 原文の規則 | 実測 | 判定 |
|---|---|---|---|
| G1 | keep it simple | — | **現行規範**(精神則) |
| G2 | 常に 'use strict' | simplicity src で **9/51 ファイルのみ** | **裁定待ち**。技術注記: 本フレームワークは concat バンドルのため、先頭ファイル冒頭の 'use strict' がバンドル全体に波及しうる。**部分適用は危険**で、やるなら全ファイル一括+全ゲート green の機械変更(別計画) |
| G3 | 可能なら const | const 351 / let 180 / **var 36 残存**。新規コードの var 禁止は CLAUDE.md で既に規範化済み(整合) | **現行規範**(新規コード)。既存 var の掃討は別計画 |
| G4 | 一意なら id、基本は class | — | **現行規範**(緩い指針) |
| G5 | DOM 選択は常に querySelector | **割れている**: querySelector 31 / getElementById 26 | **裁定待ち**。統一するなら機械置換1項目(別計画) |
| G6 | DOM 属性値の引用符は不要(`id=cat`) | **現行コードの多数派は引用符あり**(`class="` 56 + `id="` 12。省略形は少数の混在) | **裁定待ち・廃止を推奨**。実態の統一先は「引用符あり」で、lint・エディタ・diff ツールとの親和性も高い |

## 原文への最小修正(明らかな間違い・適用済みか要確認)

1. 英訳に同一文の重複: "The entire application has both synchronous and asynchronous page transitions." が直前の文と重複 → 1行削除。
2. 英訳の尻切れ: "and is stored in the window." → 日本語原文(window.Data 変数に保持される)と突合し "and is stored in the `window.Data` variable." に補完。

## 裁定待ち項目の扱い

P5 / P6 / P7 / G2 / G5 / G6 の解消(復活・廃止・一括機械適用)は、本 status への裁定転記の上で
**将来の別計画**(Phase 3 バグ修正計画の流儀: 1項目=1コミット+機械オラクル)として実行する。
進行中の style_plan(スタイル基盤刷新)には混ぜない(同計画 §4「ついで修正禁止」)。