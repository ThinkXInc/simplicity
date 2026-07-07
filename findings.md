# findings.md — simplicity リファクタリング発見事項台帳

本計画では**バグ修正を行わない**(大原則1)。既知の潜在バグ・作業中の発見事項をここに記録するのみ。
記録形式(§5): 「ファイルパス:行番号 / 事実 / 発見した項目ID」。事実には解釈を書かない。

---

## 既知の潜在バグ(refactor_plan.md §1.5 の表 F-1〜F-12 を転記。修正禁止)

| # | 事実 | 根拠 |
|---|---|---|
| F-1 | `PositionMap` のポインタ生成経路は現行 dist で `TypeError: MapPointer is not a constructor` になる(`MapPointer` が dist に不在)。作者自身のメモが `position_map.js` L122 に残っている | `position_map.js` L122–124, L420 |
| F-2 | `PositionMapConfig` は `fieldNameLat`/`fieldNameLng`/`defaultMapCoordinate` 等をコンストラクタ引数で受けるが `this` に代入せず捨てている | `position_map.js` L11–28 |
| F-3 | `map_balloon.js` は `MapPointerAction`(map_pointer.js内定義)に依存。両者とも dist 不在のため現状は無害 | grep 実測 |
| F-4 | `input_page_view_controller.js` L229 はクラス名の**文字列比較** `component.constructor.name == "Wrapper"` を使用。minify すると壊れる形(現ビルドは minify していないため無害) | 同ファイル L229 |
| F-5 | リスナー/タイマーの解放不均衡: `addEventListener` 72箇所 vs `removeEventListener` 3箇所、`setTimeout/setInterval` 33箇所 vs `clear*` 3箇所 | grep 実測 |
| F-6 | 緩い等価比較 `==`/`!=` が118箇所、`var` が42箇所 | grep 実測 |
| F-7 | **タイポ `Browswer`**(正しくは `Browser`)。hashchange イベントハンドラ内のため、hash 変更のたびにハンドラ内で `ReferenceError`(アプリ全体は落ちず console にエラーが出るのみ) | `input_page_view_controller.js` L271(ESLint `no-undef` 実測) |
| F-8 | `title.js` L20 の `class Title` が行頭から1スペースインデントされている(トップレベル宣言としては有効だが、行頭前提の静的走査を欺く様式逸脱)。同様の非行頭トップレベル宣言が `alert_message_component_base.js`、`file_upload_view.js`、`edit_content_view.js` 等にも存在 | grep 実測 |
| F-9 | エラー処理経路の自壊: `console.error` のテンプレートリテラル内で未定義変数 `parentId` を参照しており、エラー分岐が実行されるとエラーメッセージ生成自体が `ReferenceError` になる | `loading_base.js` L21、`gradient_loading_bar.js` L63、`gradient_view_loader.js` L101 |
| F-10 | `switch (state)` が未定義変数 `state` を参照(実際の変数は `showingstate` / `_uploadstate`)。同ファイルに未定義 `currentCell` 参照も3箇所 | `file_upload_view.js` L295, L313 / L528–531 |
| F-11 | `PositionMap.setValueToCookies` 内で未定義変数 `prefix` / `component` を参照(呼ばれると `ReferenceError`)。L379 に未定義 `Coordinate` 参照も存在(F-1/F-2 と同族: PositionMap の一部経路は現行 dist で動作しない) | `position_map.js` L165–166, L379 |
| F-12 | 上記 F-7/F-9/F-10/F-11 はすべて ESLint `no-undef`(実行時間約0.6秒)による静的検出であり、R-04 のゲートが常設されればこのクラスの新規混入は以後自動で防がれる | R-04 参照 |

---

## 作業中の発見事項(§5 形式で追記)

- refactor_plan.md:3 / ルート CLAUDE.md・docs/ROADMAP.md は計画書を `REFACTORING_PLAN.md` と呼ぶが実ファイル名は `refactor_plan.md`(内容は v1.2 で一致) / 項目0-1
- refactor_plan.md:146 / 計画書指定の `"test": "node --test test/"` は本環境 node v23.7.0 で exit 1(`test/` をモジュールとして解決し MODULE_NOT_FOUND。計画書検証環境 node 22.22.2 では動作)。node 23 互換のため `"test": "node --test 'test/**/*.test.js'"` を採用(人間承認済み。src/dist 不変・挙動不変) / 項目0-2
- test/helpers/load_bundle.js / 計画書 v1.3 の 0-2 ハーネス欠陥: 間接 eval では class/let/const のレキシカル束縛が eval 呼び出しをまたいで残らない(ES 仕様)。バンドルはほぼ class 宣言のため typeof 検証が全滅した。v1.4 で load_bundle.js を classic script 注入方式へ修正済み。 / 項目0-3(T-02 が検出)
- src/helpers/validator.js:92 / `Validator.validate` の switch に `postal_code_format`(ValidationErrorType.postalCodeFormat)の case が無く、postalCodeFormat バリデータは全入力で常に null を返す(検証が実質無効) / 項目0-3(T-06)
- src/helpers/validator.js:131 / `Validator.validate` の notCorresponding 分岐が未定義メソッド `this._validateNotCorrespond(value)` を呼ぶため、notCorresponding バリデータは全入力で `TypeError: this._validateNotCorrespond is not a function` になる / 項目0-3(T-06)
- src/helpers/validator.js:181 / `_validateMaxLength` は `value.length` を読むため、maxLength バリデータに null を渡すと `TypeError: Cannot read properties of null (reading 'length')`(null ガードなし) / 項目0-3(T-06)
- src/view_components/textfield.js:29 / `TextField` に対応する `TextFieldConfig` クラスがソースに存在せず、`new TextField(id, new TextFieldConfig())` は `ReferenceError: TextFieldConfig is not defined`。T-07 縮退規則により当該テストは typeof 確認のみに縮退 / 項目0-3(T-07)
- src/helpers/validator.js:116 / `passwordFormat` 分岐に `return this.errorMessage;` が2行連続で重複(2行目は到達不能なデッドコード) / 項目0-3(T-06 読解中に発見)
- package.json / 計画書 R-04 は eslint v10.6.0 想定だが npm 現行最新は eslint 9.39.4(globals 17.7.0)。exact ピンで固定。凍結ベースライン42件は計画書 §R-04 の想定内容(F-7/F-9/F-10/F-11 + 孤児の TargetLang×11/ListMenu×10 等)と完全一致したため版差の機能影響なし / 項目R-04
- R-04時点の警告ベースライン: 321件(no-unused-vars 173, eqeqeq 114, no-var 34)。no-undef は error 扱いで42件を凍結ベースライン化(修正禁止・新規混入のみ fail)。== 系(F-6)・var(F-6)は警告として可視化のみ / 項目R-04
- src/view_components/notification.js:? / `class Notification` が DOM グローバル `Notification`(lib.dom.d.ts)と TS2300 Duplicate identifier で衝突(checkJs:false でもトップレベル class 宣言はグローバル型として lib と衝突する。構文問題ではない)。計画書 R-05 の規則に従い tsconfig.json の `exclude` に本ファイルを追加して先へ進む。除外により当該1ファイルの構文ゲートは失われるが、他ファイルの構文ゲートと no-undef 床(R-04)は維持 / 項目R-05
- src/helpers/async_task_client.js:1-32 / R-10 前提の事実誤認: async_task_client.js L1-32 は /*** … ***/ コメント内の Usage example であり、quantz.sixths.ai:8001 の出現はコメント内のみ。実装は AsyncTaskClientConfig(taskHandlers, host, requestTokenURL) による消費側注入で、R-10 の目的(上書き可能化)は設計として達成済み。発見者: 実行者(R-10 着手時の対象確認)。v1.5 で項目取り消し。 / 項目R-10(取り消し)
- ブランチ運用(P3-0・Phase 3・D-21) / bugfix_plan.md P3-0 の「refactor/2026 HEAD から新ブランチ 2026refactor を作成」に対し、実環境には既に古い `2026refactor`(38aafc6、refactor/2026 の**祖先**・18コミット遅れ・0先行)がローカル+origin に存在し名称衝突。祖先関係が確認できたため、履歴喪失ゼロ・force 不使用で **ff-only 更新**(`git merge --ff-only refactor/2026`)により `2026refactor` を refactor/2026 HEAD(7730fa1)へ前進。到達形は計画指定(2026refactor @ refactor/2026 HEAD)と完全同一。origin も `38aafc6..7730fa1` の通常 ff push で更新。人間承認済み(選択肢1)。完遂ブランチ refactor/2026 とタグ refactor-v1-complete は不変(D-24/D-14 例外) / 項目P3-0
