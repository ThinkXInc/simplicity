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

- ST-1 component gallery / `NextButton`・`BackButton` の現行生成DOMはそれぞれ
  `div.NextButton`・`div.BackButton` だが、`less/view_controllers.less` は
  `section.inputPageView ... button.nextButton`・`button.backButton` を対象としている。
  tag、class名の大小文字、必要な親DOMが一致しないため、現行CSSは両コンポーネントへ
  適用されない。さらに `NextButton._setElements()` はconfigのtextをDOMへ設定しないため
  空要素になる。ST-1初版の30/30検査はDOM上の対象名だけを確認しており、CSS selectorの
  一致を検証していなかった / ST-1目視確認
- src/view_controllers/input_page_view_controller.js:174-175・src/view_component_bases/page.js:27-29 /
  コントローラと Page の生成DOMは `div.inputPageViewPages`・`div.inputPageViewPage`(現HEADと
  quantz-web ピン版 8829234 で同一)。一方 less/view_controllers.less:12-13 は
  `ul.inputPageViewPages li.inputPageViewPage` を要求するため、同ブロック(L12-92:
  inputPageViewPageTitle・textField/dropdownButton マージン・button.nextButton/backButton・
  #signupViewPage1 を含む)は実スタックのどのDOMにもマッチしない。quantz-web 側は
  views/src/less/views/materials.less:258-266 で `div.inputPageViewPages`・`div.inputPageViewPage`
  を自前定義しており、消費側スタイルは div 構造に一致している(D-41 の傍証)。
  ST-1初版ギャラリーの手組み ul/li ラッパはこの死んだCSSを適用させる構造だったため、
  実生成と同じ div/div 構造へ修正した / ST-1監査
- quantz-web views/src/js/view_controllers/signin.js:200-205 等 / quantz-web の signin/signup は
  `new LoadButton({...})` に `classList.add('nextButton')` で同名クラスを手動付与し、
  views/src/less/views/accounts.less の `button.nextButton` で独自スタイルを当てる
  (simplicity の NextButton コンポーネントは不使用)。`nextButton` は D-38 の
  「同名だが simplicity 生成DOMでない利用」の実例 / ST-1監査
- quantz-web ピン版 8829234 の next_button.js/back_button.js / 文字列 config
  (`new NextButton(id, localeText)`)は ViewComponentBase._setElements の htmlTag 検査で
  throw する(htmlTag undefined)。この呼び形は simplicity の
  pages/last_name_first_name_page.js:96・pages/single_text_input_page.js:62 が使用し、
  quantz-web では templates/general/inquiry.html が inquiry_view_controller.js
  (SingleTextInputPage/LastNameFirstNamePage を構築)を読み込むため、inquiry ページは
  ピン版で構築時エラーになる経路 / ST-1監査
- src/view_components/button.js:20 / `class Button` の constructor 既定引数が
  `new BackButtonConfig()`(ButtonConfig でなく)。BackButtonConfig の既定 htmlTag 変更
  (div→button)は `new Button(id)` 素呼びに波及しうるが、素呼びは simplicity src・
  quantz-web アプリJSとも 0 件(grep 実測) / ST-1監査
- quantz-web view_controllers/inquiry_view_controller.js:50-122 / 現HEADと非互換の旧位置引数APIで
  呼んでいる: `new Validator(type, locale, lang, ...)`(HEADはオブジェクト形)・
  `new LastNameFirstNamePage(viewControllerId, pageId, locale, ...)`(HEADは pageId 起点の別引数列)・
  `new GradientLoadingBar(id, 'LoadingBar')`(HEADは `{id,...}`)・
  `super(viewControllerId, pages, locale, lang, dataModelClass, url, loading)`(HEADは `{id, pages,...}`)。
  同ファイルは quantz-web の他所(customize_view.js 等)が使う現行オブジェクト形と混在しており、
  追随キット(ST-R)の適用対象として要注意 / ST-1監査
- src/pages/single_text_input_page.js:46-63・src/pages/last_name_first_name_page.js:60-102 /
  両 Page は現HEADで構築不能。3独立要因: (1) `new Title(id, 文字列)` — Title は文字列 config を
  受けず ViewComponentBase._setElements の htmlTag 検査で throw(NextButton 修正前と同型)、
  (2) `new TextField(id, fieldName, type, ...)` の位置引数12個 — HEAD の TextField は
  オブジェクト形 constructor で文字列が分割代入され id=undefined になる、
  (3) `super(pageId, components)` の位置引数 — HEAD の Page は `{id, components}` 形で
  components が既定 [] に落ちる。ギャラリーでは両対象をプレースホルダとし、
  InputPageViewController+Page 直接組み立てで実遷移を確認する / ST-1監査
- src/view_components/file_upload_view.js:250 / FileUploadView は constructor が
  `super(id, 'div')`(旧基底シグネチャ)を渡すため、ViewComponentBase の
  `this.config.validators.forEach` で TypeError となり現HEADで構築不能。
  quantz-web アプリJSに `new FileUploadView` は 0 件(interview.js は独自 FileUploader を使用)。
  ギャラリーではプレースホルダとした / ST-1監査
- src/view_components/file_upload_view.js:15-19 / `FileUploadViewUploadState` の
  onuploadcompleted と onuploadfailed が同値 2(enum 衝突)。また FileUploadTableViewCell の
  公開 API(content / state setter)に「失敗」状態の表現が存在しないため、ギャラリーの
  セル状態は 待機(0%)・アップロード中(58%)・完了(100%)の3状態とした / ST-1監査
- src/view_components/loading_message.js:92-123 / LoadingMessage はスタイルを JS 内の
  テンプレートリテラルとして自己注入し、`var(--lm-grad-start, #aaaaaa)` 等の
  CSS custom properties を既に使用している。less/ 由来の CSS だけがスタイルの全量ではない
  (ST-8 LESS移行・ST-9 トークン抽出の対象範囲に関わる) / ST-1監査
- scripts/check_gallery_coverage.js / ST-1 検査を「対象ごとの CSS セレクタ一致集合 =
  凍結ゴールデン(test/golden/gallery_css_match.json)と完全一致」へ拡張
  (2026-07-19 オーナー承認の読み替え。空集合も正解になりうる — 死んだCSSの存在が根拠)。
  ゴールデン更新は `--update` 明示時のみ / ST-1
- オーナー裁定の記録(2026-07-19) /
  instruction: 「SingleTextInputPage / LastNameFirstNamePage Quanz-webでは確か使っていないと
  思うが、これらはおそらくもう使うことがない。quanz-webで使ってなかったら、もう使わないと
  思っていい。」「FileUploadView これは一度もまだ使われたことがない。しかも私が書いたのでは
  ない。だから動作を一度も見たことがない。」→(D-42 起草への訂正)「FileUploadView は使う」
  「PositionMap と MapPointer については、別のCityWalkというアプリケーションで使っている
  可能性がある。」 /
  interpretation: SingleTextInputPage・LastNameFirstNamePage は修理せず凍結(削除もしない)。
  FileUploadView は使う予定のため構築可能へ修理。PositionMap・MapPointer は破棄・修理とも
  保留(CityWalk 実利用の確認まで)。 /
  context: ST-1 監査で3コンポーネントの構築不能を報告し、修理か次期送りかを質問した回答。
  D-42 に転記済み / ST-1
- オーナー目視結果(2026-07-19) / InputPageViewController の次へ・前へ・全ページ表示は動作。
  全体は概ね動作するが「デフォルトのスタイルがあるとすれば、うまく適用されていないように
  見える場所がかなりある」。後者は本監査で確定した死んだCSS(ul/li ブロック)と
  コンポーネント固有規則の不在(gallery_css_match.json が対象別に記録: RadioButton・
  GradientLoadingBar・FileUploadView 等は要素セレクタのみにマッチ)と整合する / ST-1目視
- src/view_components/file_upload_view.js:250 / D-42(FileUploadView は使う)に基づき
  `super(id, 'div')` → `super(id, new ViewComponentConfig())` へ最小修理し構築可能化。
  htmlTag は FileUploadView 自身の _setElements が上書きするため config 既定値で挙動不変。
  dist sha ae735c01916fe3697d03833432e93b70258426425ada3bec4fbd21d319e0a06f。
  生成DOMにマッチする live CSS は要素セレクタのみ(fileUploadView 固有の規則は無し) / ST-1
- src/view_components/text_field.js:369 / `isCancelButton: true` は `cancelButtonPlace` が
  constructor 引数に存在しないため `places[undefined].appendChild` で TypeError(構築不能)。
  ギャラリーの TextField バリエーションは Done ボタンのみ表示 / ST-1
- preview/gallery.html / Incrementer の上下ボタン等が参照する画像(/img/up.svg /img/down.svg
  /img/button-loader.svg 等)は quantz-web 側資産のためギャラリーでは 404(表示されない)。
  オーナー確認済み・問題なしと裁定(2026-07-19)。ST-2 の site fixture では実資産を抽出する / ST-1目視
- quantz-web templates/main/materials.html / `material_keywords_field.js` の script タグが2重
  (実テンプレート由来)。2回目の読み込みが class 再宣言の SyntaxError になる現行バグで、
  実ブラウザでも console に出る。site fixture は忠実に再現し、scripts/check_site_fixture.js は
  既知エラーとして明示許容している。ST-R の追随時に quantz-web 側で重複タグ削除を推奨 / ST-2
- preview/site/ / 参照はあるが quantz-web の git に存在しない資産: js/libs/anime.min.js
  (スタブ配置。抽出JSに anime() の消費なし)・css/darkmoss.min.css(空スタブ)・
  fonts/GeosansLight.ttf(404・フォールバックフォント)・img 1件(MANIFEST.md に列挙)。
  本番はビルド/手動配置で供給されている模様 / ST-2
- docs/SITE_FIXTURE.md の対象画面「Billing設定」/ 独立ページではなく materials.html
  (/v1/<lang>/home)内の SettingsModalView として描画される(fetch /v1/<lang>/user と
  /v1/<lang>/payments/method/status に fixture 応答を用意)。対象画面表はこのページ内での
  確認として読む / ST-2
- ST-3 オラクル凍結の記録(2026-07-19) / (a) CSS宣言ゴールデン
  test/golden/css_declarations.json(273セレクタ。scripts/css_golden.js — 写像適用 --map・
  var()解決 --resolve-vars 対応)。凍結時の dist/simplicity_default.css sha256 =
  bc0a399c333a984bd3dd4a4633dc87872949da6196f1ecae11f3aae3568e1783、dist/simplicity.js =
  ae735c01916fe3697d03833432e93b70258426425ada3bec4fbd21d319e0a06f。
  (b) スクショゴールデン test/screens/golden/(ギャラリー全景+site 4ページ・
  viewport 1280x800・fullPage・@playwright/test 1.61.1 exact / chromium-1228 は
  PLAYWRIGHT_BROWSERS_PATH=0 でプロジェクト内・darwin/arm64 レンダリング基準)。
  JSタイマー由来アニメは page.clock 固定で決定化し、maxDiffPixels 0 で2回連続一致を実測。
  (c) 既存ゲート green: t01-t07 10/10・lint OK(5 known/0 new)・typecheck 0・manifest OK・
  gallery 30/30+CSSマッチ 30/30・site fixture smoke 4/4。以後この3系がST全項目の合格判定器 / ST-3
- ST-5 適用の記録(2026-07-19) / migration/apply_rename.js(less モード)で less/ 7ファイルへ
  写像表を機械適用(212置換)。判定: css_golden --map rename_map.json 完全一致(273セレクタ・
  宣言不変)+ check_no_legacy_classes 旧名残存0。**ST-6 完了までは CSS=新名・JS=旧名の
  計画上の中間状態**であり、スクショ回帰と gallery CSSマッチはこの間一致しない(計画の
  項目順序どおり。ST-6 のゲートで復帰を判定する) / ST-5
- migration/apply_rename.js の初版 js モード欠陥(ST-6 で実測・修正済み) / 正規表現による
  引用符スキャンがコメント中のアポストロフィ("doesn't" 等)を引用符と誤認し、コード領域を
  文字列として dot-form 置換した(実害例: keywords_field.js `this.keywords` →
  `this.spl-keywords`)。src を全戻しし、@babel/parser のトークン列(文字列リテラル/
  テンプレート片のみ・コメントと `${}` 内コードは対象外)ベースへ書き直して再適用。
  check_no_legacy_classes にも同方式の --js モードを追加(`.error` 等のプロパティアクセス
  誤検知の排除)。追随キットは本修正版を使うこと / ST-6
- ST-6 適用の記録(2026-07-19) / (1) トークンベース js モードで src 51ファイルに 224置換
  (再実行 0 = 冪等)。(2) constructor.name 由来のクラス付与4箇所
  (view_component_base:82・loading_base:42・gradient_loading_bar:42・text_field:268)を
  `spl-${this.constructor.name}` へ一律前置 — **写像表に無い名前(NextButton/BackButton/
  Button/Title/Mesh 等)も D-36 の一律規則により spl- が付く**(合成形
  `${page.id}__${constructor.name}` は動的なので両側とも不変)。(3) 手動確認リストの裁定:
  クラス実体の定数・enum値を改名(keywords_field クラス名定数5・screen_lock LOCK_CLASS・
  ModalViewStyle.DARK・Notification の position/type/animation 値・TableView/Cell の
  *ClassName 既定値・text_field の onDisable/onFocus/onMouseDown 既定値と
  indicator/message/counter/doneButton/cancelButton 生成クラス・ipvc の
  container id 兼クラス文字列・svg_icons の class 属性13件)。イベント名('selected'・
  'load'・'focus')・createElement/type 引数('input'・'text'・'label')・locale/ID部品
  ('TextField'・'title')・style値('left'/'right')・ログ文字列は改名対象外と判定。
  (4) t07 golden は規則(map 適用/constructor 名は spl- 前置/t-*・legacy-* の id 由来は不変)で
  機械再写像。(5) ゲート: t01-t07 10/10・lint OK・typecheck 0・manifest OK・
  gallery 30/30+CSSマッチ golden 意図的再凍結・旧名 grep 0(src/preview/test —
  test/helpers/probe.js の `.message`/`.error` 2件はコード文字列の誤検知で対象外)・
  **ギャラリースクショが ST-3 凍結 golden と画素一致(maxDiffPixels 0)= 知覚不変の機械証明**。
  dist sha 9c606cd51587fbdcb8cef6e203ac4c7f250c0052849ce0381dcc8f9471101c67。
  site fixture 4ページのスクショは quantz 側資産が旧名のため過渡的に不一致(ST-7 で復帰) / ST-6
- ST-7 適用の記録(2026-07-19) / site fixture へ同写像を機械適用: less 40ファイル 1121置換・
  js 28ファイル 113置換・templates 7ファイル 5置換(class 属性)。手動確認リストは全件
  「改名しない」と裁定(quantz のデータフィールド名 'title'/'keywords'/'text'・イベント名
  'selected'・id 文字列 'VerifyCodeForm'・pressText 既定値)。ゲート: 旧名 grep 0
  (less/js。templates の残存4件は inline script の console.error というコードの誤検知で
  対象外、代わりに html モード dry-run 0 = 冪等で判定)+ site smoke 4/4 +
  **スクショ回帰 5/5 全て ST-3 凍結 golden と画素一致(gallery+site 4ページ・
  maxDiffPixels 0)= 改名の知覚不変が全面で機械証明**。追随キットは
  migration/apply_rename.js + ADOPTION.md として完成(quantz-web への適用は ST-R まで実施しない)/ ST-7
- /Users/K00TSUKA/Sources/quantz-web:master / ローカル master は eab6fd049b2c69c7578b8be288245be5c961902d、ローカル保存 ref origin/master は計画対象 99a9488714b94e227ecec54340df031419c5d1e2。計画書 §5.1 の「clone は ff 追随済み」と不一致。quantz-web 書き込み禁止のため checkout/pull は行わず、git grep/show origin/master で対象ツリーを読み取る / ST-0
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
- P3-S2 の null ガード参照(D-21・計画/コード食い違い) / bugfix_plan P3-S2(2)は「`_validateMaxLength` に null ガード — `_validateMinLength` の null の扱いを確認し同型に揃える」と指示するが、validator.js に **`_validateMinLength` は存在しない**(メソッドは `_validateNotNullOrEmpty`/`_validateNotNull`/`_validateMaxLength`/`_validateFormat` のみ)。到達形は max 長検証の意味から確定: null/undefined は「長さなし=max 超過なし」で **valid**(空文字 `''`(len0)が既に valid=null 返しなのと整合)。ガードは `if (value === null || value === undefined) return true;`(CLAUDE.md の新規コード strict 等価に準拠)。T-06 golden の maxLength[null] が TypeError→{ok:true,value:null} に更新。/ 項目P3-S2
- P3-S5 監査結果(停止・要人間判断・D-21 計画前提誤り) / window/document addEventListener 8 + setInterval 2 を列挙・分類: **(a) setInterval effects.js:47** → L37 で自己解放(`flashIntervalId` は L18 `let`、タイプ完了 index>=text.length で clearInterval)。解放経路**あり**・漏れなし。**(b) setInterval file_upload_view.js:484** → L487 で自己解放(scene 内 width>=100 で `clearInterval(identity)`)。解放経路**あり**。⇒ **計画 P3-S5 の「file_upload L484 はローカル変数握りで解放経路なし=確実な漏れ」「アニメーション完了条件で clearInterval する形へ」は現 HEAD と不一致 — 処方された clearInterval は既に L487 に存在**(計画ヘッダの「全行番号・コード引用は現行 HEAD に実測突合済み」に反する検証漏れ)。**(c) position_map.js:305** → §1.3 PositionMap 一族・対象外。**(d) modal_view.js:195/201** → `this.$window` は `document.createElement("div")`(要素)。要素リスナーは対象外(要素破棄で GC)。**(e) input_page_view_controller.js:238/242/250** → window load/hashchange/keydown。teardown 無しだが `new InputPageViewController` は simplicity src に無く消費側(app)が生成。単一ページコントローラなら page-lifetime で per-instance leak ではない。**(f) draggable.js:53/54** → **唯一の実害漏れ候補**: constructor で `document.addEventListener("mousemove"/"mouseup")` を恒久登録し、`removeEventListener`/`destroy`/teardown が皆無(`new Draggable` も simplicity src に無く消費側生成)。複数インスタンスで document リスナーが累積。修復は (a) 登録を onMouseDown へ移し onMouseUp で removeEventListener する再構成、または (b) `destroy()` を追加し消費側で呼ぶ配線 — いずれも設計判断+外部消費側協調が要る。**⇒ 停止**: 計画の名指し漏れ(L484)は既修正、2 setInterval とも解放経路あり(計画前提誤り)、実害漏れ draggable は「解放経路なし teardown への解放追加」の域を超える設計判断。人間判断待ち。**判定(オーナー承認): draggable を次期送り、P3-S5 は監査記録のみでクローズ(src 変更なし・dist 不変)。draggable の teardown 再構成(onMouseDown 登録/onMouseUp remove)or destroy() 配線は次期サイクル入力。** / 項目P3-S5
- P3-S6 の t02 inventory 波及 + 実行者の手順ミス(フォローアップ修復) / P3-S6(6 class を column 0 へ de-indent)は t02_class_inventory の golden(`class_inventory.json`)を変える: t02 の抽出は **column-0 限定正規表現**(`^(?:class|function)` — gen_globals の indent 許容 `^[ \t]*` とは別物)なので、de-indent 前は6 class(1スペース)が **golden から隠れて不在**(73件)だった。de-indent で正しく出現し **6追加・削除ゼロ**(→79件: AlertMessageComponentBase / AlertMessageProtocol / FileUploadTableViewCell / FileUploadView / FileUploadViewProtocol / Title、全て page scope で typeof===function)。**手順ミス**: P3-S6 の `npm test` を **build 前の旧 dist に対して**走らせて green と誤認し、`46f415e` を t02 失敗のまま push した(教訓: 成果物=新 dist をビルドしてから test する)。オーナー承認のもと `class_inventory.json` を6追加で更新し t02 を green 化(F-8 の正当な波及。P3-R1 route_sweep と同型)。dist sha は 8ad38ef9 のまま(golden のみ変更、dist 不変)。/ 項目P3-S6-followup
- ブランチ運用(P3-0・Phase 3・D-21) / bugfix_plan.md P3-0 の「refactor/2026 HEAD から新ブランチ 2026refactor を作成」に対し、実環境には既に古い `2026refactor`(38aafc6、refactor/2026 の**祖先**・18コミット遅れ・0先行)がローカル+origin に存在し名称衝突。祖先関係が確認できたため、履歴喪失ゼロ・force 不使用で **ff-only 更新**(`git merge --ff-only refactor/2026`)により `2026refactor` を refactor/2026 HEAD(7730fa1)へ前進。到達形は計画指定(2026refactor @ refactor/2026 HEAD)と完全同一。origin も `38aafc6..7730fa1` の通常 ff push で更新。人間承認済み(選択肢1)。完遂ブランチ refactor/2026 とタグ refactor-v1-complete は不変(D-24/D-14 例外) / 項目P3-0
