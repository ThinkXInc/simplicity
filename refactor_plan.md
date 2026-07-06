# simplicity リファクタリング計画書 v1.4

作成日: 2026-07-03(v1.4: 2026-07-06 改訂)/ 対象リポジトリ: simplicity(コミット `master` HEAD時点)
実行環境の前提: Node.js 18以上(v22.22.2で検証済み)、git、npm が使用可能であること。

v1.4 の変更点: 実行者が項目0-3で検出・実証したハーネス設計の欠陥を修正。旧指定の `runScripts:'outside-only'` + `w.eval(code)` では、間接 eval のレキシカル宣言(class/let/const)が当該 eval 呼び出し限りの宣言的環境に閉じ、後続の `evalInPage` から見えない(ES 仕様。グローバルへ漏れるのは sloppy の function/var のみ)。0-2 の load_bundle.js を、本番の消費形態(`<script src=simplicity.js>`)に忠実な `runScripts:'dangerously'` + script 要素注入へ差し替え、「evalInPage は自己完結(IIFE)で書く」規則と `{ presetGlobals }` 引数(T-08 用)を組み込んだ。作業項目・完了条件・凍結済みゴールデン(dist への正規表現抽出でありハーネス非依存)に変更なし。

v1.3 の変更点: findings.md の位置づけを明記(捨て場ではなく、両計画完遂後の「バグ修正計画」(ワークスペース ROADMAP Phase 3)への入力。修正はそこで一括実行される)。作業項目・完了条件に変更なし。

v1.2 の変更点: ThinkX Auth プロトコル v1(PROTOCOL.md)確定を受け、simplicity 内の auth 接点3件を §1.7 に記録し、**auth 統合の準備工事を §4 で明示的に禁止**。作業項目・完了条件に変更なし(simplicity は auth 非依存であり、本計画の範囲は不変)。

v1.1 の変更点: 実コードに対する ESLint 実測(所要約0.6秒・64件検出)に基づき、R-04 を推測ベースから**実測ベースライン方式**に全面差し替え。潜在バグ F-7〜F-11 を発見済み事実として追加。TypeScript は「床」ではなく「任意の天井」と位置づけを明確化し、バージョンピン規則を追加。

---

## 大原則(実行者は最初にこれを読むこと)

1. **本番挙動 = 正解。** このフレームワークは quantz-web で稼働実績がある。現在の挙動を変える変更は一切行わない。「明らかなバグ」に見えても修正せず、`findings.md` に記録して先へ進む(→ §6 発見事項の報告ルール)。
2. **人間による動作確認は行わない・要求しない。** すべての完了条件は、コマンド実行と機械的な比較(sha256一致 / テストgreen / exit code)で判定できるように書いてある。判定できない状態に陥ったら中断して報告する。
3. **1項目 = 1コミット。** 各項目は独立に検証可能な粒度に割ってある。完了条件を満たせない場合、その項目の変更を破棄(戻し方は各項目に記載)し、中断して報告する。
4. **`dist/simplicity.js` が唯一の成果物。** 消費側(quantz等)はこのファイルだけを読む。多くの項目の完了条件は「dist の sha256 がベースラインと一致すること」。distが変わる項目は、変わってよい差分を明記してある。
5. **import / export / require を src 配下に一切導入しない。** 本フレームワークは意図的に concat + グローバル名前空間で設計されている(設計判断であり欠陥ではない)。ESM化はこの計画の範囲外であり、恒久的に禁止事項である。
6. **検証層の思想: 床と天井を区別する。** 床 = ESLint(`no-undef`)+ `globals.d.ts` + jsdom特性テスト。これらは素の JS のまま機能し、ツールのバージョン変動に強い(load-bearing)。天井 = JSDoc + `checkJs` による型検査。これは任意・剥離可能な追加層であり、**本計画の範囲外**(TypeScript 7.0 で JS 型検査面が縮小されるため、着手するなら別計画で意図的に行う)。実行者は床だけを建てる。
7. **devDependencies は exact バージョンでピンする。** すべての `npm install --save-dev` は `--save-exact` を付ける(caret `^` 禁止)。ツールの自動昇格は「エディタで緑・CIで赤」やゲート仕様の無断変化を生む。昇格は将来の意図的イベントとする。

---

## 1. 現状理解

### 1.1 このコードは何か

素の JavaScript(フレームワーク非依存)で書かれた、マルチページ・フォーム特化の UI コンポーネント集。React 等と異なり、**モジュールシステムを持たない**。全 `.js` ファイルは gulp で単純連結(concat)され、1本の `dist/simplicity.js` になる。したがって:

- 全トップレベル定義(`class` / `function` / `const`)は **単一のグローバル名前空間** を共有する。ファイル間の参照は import ではなく「連結順で先に定義されていること」で成立する。
- 連結順は `gulpfile.js` の `paths.jsFiles` 配列(L7–59)が唯一の真実である。**新規ファイルはこの配列に手動追記しない限り dist に入らない。**

### 1.2 レイヤ構造(依存は上から下への一方向)

| レイヤ | ディレクトリ | 役割 | 主要ファイル |
|---|---|---|---|
| データ | `src/data/` | 静的データ | `countries.js`(ISO3166国リスト、1行の巨大const) |
| 基盤 | `src/etc/` | ログ・アイコン | `debug_log.js`(`DEBUG=true`固定の`debuglog()`)、`svg_icons.js` |
| ヘルパ | `src/helpers/` | 純ロジック・ブラウザAPI包装 | `http.js`(fetch包装)、`browser.js`(URL/history操作)、`validator.js`、`locale.js`(i18n)、`utils.js`、`async_task_client.js`(※本番ホスト直書きあり L3) |
| モデル | `src/models/` | `userbase.js` |
| 基底クラス | `src/view_component_bases/` | `ViewComponentConfig`/`ViewComponentBase`(全コンポーネントの親)、`FormComponentBase`(Cookie永続化)、`Page`、`LoadingBase`、`AlertMessageComponentBase` |
| コンポーネント | `src/view_components/` | `TextField`、`TableView`、`ModalView`、`DropdownButton`、`Button`類、`PositionMap` 等 |
| ページ | `src/pages/` | `Page` を継承した定型ページ |
| コントローラ | `src/view_controllers/` | `InputPageViewController`(585行)。Page群を束ね、遷移・Cookie保存・URL同期を担う |

継承の根: ほぼ全コンポーネントが `ViewComponentBase` を、その Config が `ViewComponentConfig` を継承する(`src/view_component_bases/view_component_base.js` L2, L20)。

### 1.3 外部ランタイム依存(バンドルに含まれず、実行環境が供給するグローバル)

| グローバル | 実体 | 使用ファイル |
|---|---|---|
| `Cookies` | js-cookie(package.json依存だがバンドル外。消費側HTMLが読み込む) | `form_component_base.js`, `input_page_view_controller.js`, `textfield.js`, `position_map.js` |
| `google`(`google.maps`) | Google Maps JS API | `position_map.js`, `map_pointer.js`, `map_balloon.js` |

### 1.4 ビルドの現状と問題(検出済み・数値つき)

`gulpfile.js` の実測: `jsFiles` は50エントリ、`gulp.src(..., { allowEmpty: true })`(L72)により**存在しないパスは黙って無視される**。この結果、以下のドリフトが発生している:

**(a) gulpfile が指すが存在しないパス = 2件(現状 no-op)**
- L29 `./src/view_component_bases/load_button.js` — 実体は `src/view_components/load_button.js`(こちらは L33 で正しく参照済み。つまり L29 は重複かつデッド)
- L38 `./src/view_components/wrapper.js` — 実体は `src/view_component_bases/wrapper.js`(孤児化)

**(b) src に存在するが dist に入らないファイル(孤児)= 13件**

| ファイル | 行数 | バンドル対象コードからの参照 |
|---|---|---|
| `src/view_components/translate_results_table_view.js` | 446 | なし |
| `src/view_components/edit_content_view.js` | 428 | なし |
| `src/view_components/map_pointer.js` | 370 | **あり**: `position_map.js` L124, L420 が `new MapPointer(` |
| `src/view_components/content_table_view.js` | 327 | なし |
| `src/view_components/map_balloon.js` | 292 | なし(自身が `MapPointerAction` に依存) |
| `src/view_components/page_navigation_view.js` | 215 | なし |
| `src/pages/address_input_page.js` | 111 | なし |
| `src/view_components/search_box.js` | 109 | なし |
| `src/view_components/step_indicator.js` | 103 | なし |
| `src/view_component_bases/wrapper.js` | 67 | なし(controller L229 は文字列比較 `== "Wrapper"` のみでクラス参照ではない) |
| `src/pages/select_options_page.js` | 50 | なし |
| `src/view_components/description.js` | 40 | なし(controller L16 は JSDoc コメント内の言及のみ) |
| `src/pages/file_upload_page.js` | 0(空) | なし |

### 1.5 既知の潜在バグ(**報告のみ・本計画では修正禁止**)

以下は現行 dist に存在する既知の状態である。quantz は現に動いているため、これらのコードパスは未使用か、環境側で回避されている。**「修正」は挙動変更であり禁止。** 実行者は項目0で `findings.md` にこの表を転記して開始すること。

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

### 1.6 テスト・検証の現状

テスト: **0件**。lint: なし。型検査: なし。CI: なし。
→ したがって本計画の最初の仕事(項目0)は、リファクタリングではなく**機械オラクルの建設**である。

### 1.7 ThinkX Auth プロトコル(PROTOCOL.md v1)との接点 — 統合時レビュー項目・**本計画では一切触らない**

全サービス共通アカウントシステム(auth)の契約が別途確定しているが、**simplicity は設計上 auth 非依存であり、本計画に auth 対応の作業項目は存在しない**。実行者が PROTOCOL.md を参照できる環境にいても、以下を「準備」しないこと(§4 参照)。将来の統合作業のために接点だけ記録する:

| # | 接点 | 統合時の論点(今は触らない) |
|---|---|---|
| A-1 | `models/userbase.js` の `update()` が `/v1/users/update` を直書きで POST する | auth 統合後、プロフィール系はauthが真になるため、この URL・責務の見直しが要る |
| A-2 | `async_task_client.js` はブラウザから `request-token` を取得する(フロントチャネルのトークンフロー) | auth の access_token とは別系統のタスク用トークンだが、統合時にプロトコル §7(b) の観点で認証方式(ローカルセッション連携)をレビューする |
| A-3 | `verify_code_form.js` / `terms_scroll_view.js` はサインアップ UI 部品 | ログイン/サインアップ画面が auth サービスへ集約されると、**auth が simplicity の新しい消費者になる**(dist を vendoring)。本計画の完遂は auth 構築の前提になる |

---

## 2. 項目0: 安全網の構築(最初に必ず実行)

### 0-1 ブランチ作成・ベースライン固定

```bash
cd <リポジトリルート>
git checkout -b refactor/plan-v1
npm install
npx gulp scripts          # 'default' は styles も走り css 前提が要るため scripts のみ使う
sha256sum dist/simplicity.js
```

- `CHECKSUMS.md` をリポジトリルートに新規作成し、次の1行を記録する:
  `BASELINE  <sha256値>  dist/simplicity.js  (項目0-1時点)`
- 以後、dist が変わる項目を完了するたび、この台帳に `項目ID  <新sha256>` を追記してコミットに含める。**「dist sha一致」とは、この台帳の直近行との一致を意味する。**
- `findings.md` を新規作成し、§1.5 の表 F-1〜F-12 を転記する。
- コミット: `chore: baseline checksum and findings ledger`

**完了条件:** `npx gulp scripts` が exit 0 / `CHECKSUMS.md` と `findings.md` が存在しコミット済み。
**失敗時:** ビルド自体が失敗する場合は環境問題。`node -v` が18未満なら更新。それでも失敗なら中断・報告。

### 0-2 テストハーネスの導入(src は1文字も変更しない)

```bash
npm install --save-dev --save-exact jsdom
```

`package.json` の `scripts` に追記:
```json
"test": "node --test test/"
```

`test/helpers/load_bundle.js` を以下の内容で新規作成する(**そのまま使うこと**):

```javascript
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// ロード方式の根拠(v1.4 で修正済み):
// - 本番の消費形態は <script src=simplicity.js>。classic script のトップレベル
//   class/let/const は「レルムのグローバル・レキシカル環境」に永続束縛される
//   (window のプロパティにはならない)。script 要素注入はこれに忠実。
// - 旧方式 w.eval(code) の間接 eval では、レキシカル宣言は当該 eval 呼び出し限りの
//   宣言的環境に閉じ、別の w.eval から見えない(ES 仕様)。バンドルはほぼ class
//   宣言のため typeof 検証が全滅する。使用禁止。
// - 検証は evalInPage('typeof Button') のような「式」で行う。w.Button では見えない
//   (グローバル・レキシカル束縛は window プロパティではない)。
// - 規則: evalInPage 内で作った const/let/class も呼び出し限りで消える。
//   複数文のテストは必ず自己完結の IIFE で書くこと。例:
//   evalInPage('(() => { const b = new Button("t", new ButtonConfig()); return b.constructor.name; })()')
function loadBundle({ presetGlobals } = {}) {
    const dom = new JSDOM('<!doctype html><html><body></body></html>', {
        url: 'https://localhost/',
        runScripts: 'dangerously',
    });
    const w = dom.window;
    // 外部ランタイム依存の最小スタブ(§1.3)— 必ずスクリプト注入より前に設定する
    w.Cookies = { get: () => undefined, set: () => {}, remove: () => {} };
    w.google = { maps: { OverlayView: class {}, LatLng: class {} } };
    if (presetGlobals) Object.assign(w, presetGlobals);   // T-08(R-10)等で使用
    const code = fs.readFileSync(
        path.join(__dirname, '..', '..', 'dist', 'simplicity.js'), 'utf8');
    const script = w.document.createElement('script');
    script.textContent = code;
    w.document.body.appendChild(script);   // 挿入時に同期実行される
    const evalInPage = (expr) => w.eval(expr);
    return { dom, window: w, evalInPage };
}
module.exports = { loadBundle };
```

**完了条件:** `npm test` が exit 0(テスト0件でも可)。
**コミット:** `test: add jsdom harness (no src changes)`

### 0-3 特性テスト(現在の挙動をゴールデンとして固定)

方針: 期待値を推測で書かない。**一度実行して得られた実際の値を期待値として記録し、以後固定する**(characterization testing)。ゴールデンは `test/golden/` 配下の JSON に保存する。

**T-01 `test/t01_bundle_load.test.js` — バンドルが例外なく読み込める**
```javascript
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { loadBundle } = require('./helpers/load_bundle');
test('dist/simplicity.js loads without throwing', () => {
    assert.doesNotThrow(() => loadBundle());
});
```

**T-02 `test/t02_class_inventory.test.js` — トップレベル定義の在庫が変わっていない**

ゴールデン生成(初回のみ実行):
```bash
mkdir -p test/golden
node -e "const s=require('fs').readFileSync('dist/simplicity.js','utf8');\
const n=[...s.matchAll(/^(?:class|function)\s+([A-Za-z_$][\w$]*)/gm)].map(m=>m[1]);\
console.log(JSON.stringify([...new Set(n)].sort(),null,2))" > test/golden/class_inventory.json
```
テスト本体: 同じ抽出を dist に対して行い、`test/golden/class_inventory.json` と `assert.deepStrictEqual` で比較する。加えて、在庫の各名前について `evalInPage('typeof ' + name)` が `'function'` であることを確認する。

**T-03 `test/t03_utils.test.js` — `Utils.isInheritedFrom`(純関数)**
`evalInPage` で以下の式を評価し、結果(true/false)を固定:
- `Utils.isInheritedFrom(new NextButtonConfig(), ViewComponentConfig)`
- `Utils.isInheritedFrom(new ViewComponentConfig(), ViewComponentConfig)`(継承でなく同一クラスの場合の現挙動を固定する)
- `(()=>{class A{} return Utils.isInheritedFrom(new A(), ViewComponentConfig)})()`

**T-04 `test/t04_browser.test.js` — `Browser` の URL 系静的メソッド**
対象: `Browser.parseQueryStrings`(L52)、`Browser.getValueFromSearchParams`(L158)、`Browser._getValueFromParams`(L268)。
入力マトリクス(各入力に対する現戻り値を初回実行で記録しゴールデン化):
- `parseQueryStrings('?a=1&b=hello')` / `parseQueryStrings('')` / `parseQueryStrings('?a=1&a=2')` / `parseQueryStrings('?flag')`
- `_getValueFromParams` は key 存在/非存在 × `type='string'|'number'` の4通り。
※ `window.location` に依存するメソッド(`getURL` 等)は jsdom の url が `https://localhost/` である前提の値を固定してよい。

**T-05 `test/t05_locale.test.js` — `Locale.get`(L69)**
`new Locale({greet: {en: 'Hello', ja: 'こんにちは'}})` 相当の辞書を `evalInPage` 内で構築し、`get('greet','en')` / `get('greet','ja')` / 存在しないキー / 存在しない言語、の4ケースの現戻り値(または例外)を固定する。辞書の正確な構造は `src/helpers/locale.js` L37 のコンストラクタを読み、実際に受理される形に合わせること。

**T-06 `test/t06_validator.test.js` — `Validator.validate`(L91)**
手順: (1) `src/helpers/validator.js` L1–73 を読み、`ValidationErrorType`(L1)・`RegexType`(L13)の全列挙値とコンストラクタ引数(L35–)を確認する。(2) 各 `ValidationErrorType` について最低1インスタンスを構築する。(3) 各インスタンスに入力 `''` / `null` / `'a'` / 200文字の文字列 / 形式に合致する値 / 合致しない値 を与え、`validate()` の全戻り値を初回実行で記録しゴールデン化する。

**T-07 `test/t07_component_smoke.test.js` — リーフコンポーネントの構築スモーク**
対象: `Button` / `Title` / `NextButton` / `BackButton` / `TextField`。
各対象について `evalInPage` で `new <Class>('t-<class名小文字>', new <Class>Config())` を試みる。
- 成功した場合: 生成物の `constructor.name` と、`$view` プロパティが存在するなら `$view.tagName` を固定する。
- **例外が出た場合の決定規則(実行者はここで止まらないこと):** そのコンポーネントは「構築にコントローラ配線が必要」と `findings.md` に1行記録し、テストは `typeof <Class> === 'function'` の確認のみに縮退させる。コンストラクタの引数を推測して"動かす"試行はしない。

**完了条件(0-3全体):** `npm test` exit 0 / `test/golden/` にゴールデンがコミットされている。
**コミット:** `test: characterization tests frozen against current dist`

> ゴールデン更新の唯一の正規手順: 以後の項目で dist の内容が意図的に変わる場合、その項目の指示に「ゴールデンのどの部分をどう更新するか」が明記されている。明記のない差分でテストが落ちた場合は、**挙動を壊した**ということなので、変更を戻して報告する。

---

## 3. 作業項目リスト(実行順)

> 各項目は前項目の完了を前提とする(「依存」欄)。スキップ・順序入替は禁止。

### R-01 gulpfile のデッドエントリ2件を削除

- **対象:** `gulpfile.js` L29, L38
- **問題:** L29 `'./src/view_component_bases/load_button.js'` は存在しないパス(実体は L33 で参照済みの `view_components/load_button.js`。重複かつデッド)。L38 `'./src/view_components/wrapper.js'` も存在しないパス。`allowEmpty: true` のため両者は無言の no-op になっている。
- **変更:** この2行を削除する。**それ以外の行の順序は1行たりとも変えない。**
- **完了条件:** `npx gulp scripts` exit 0、`sha256sum dist/simplicity.js` が `CHECKSUMS.md` の BASELINE と一致(no-op だった証明)。
- **リスク/戻し方:** sha不一致なら削除行を誤っている。`git checkout -- gulpfile.js` で戻し、行番号を再確認。
- **依存:** 0-1〜0-3
- **コミット:** `build: remove two dead entries from jsFiles manifest`

### R-02 `allowEmpty` を廃止し、ビルド時のファイル存在チェックを追加

- **対象:** `gulpfile.js` L71–77(`scripts` タスク)
- **問題:** `allowEmpty: true` が「マニフェストに書いたのにファイルがない」という故障クラスを黙って握り潰す。§1.4 のドリフトの根本原因。
- **変更:** `scripts` タスク冒頭に存在チェックを追加し、`allowEmpty` を削除する。変更後スケッチ:

```javascript
const fs = require('fs');

gulp.task('scripts', function() {
    const missing = paths.jsFiles.filter(f => !fs.existsSync(f));
    if (missing.length > 0) {
        throw new Error('Manifest entries missing on disk:\n' + missing.join('\n'));
    }
    return gulp.src(paths.jsFiles)
        .pipe(sourcemaps.init())
        .pipe(concat(paths.jsOutputFile))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.outputDir));
});
```

- **完了条件:** (1) `npx gulp scripts` exit 0 かつ dist sha が BASELINE と一致。(2) 検証デモ: `jsFiles` に `'./src/__no_such_file__.js'` を一時追加してビルドが**失敗する**ことを確認し、追加を戻す(この一時変更はコミットしない)。
- **リスク/戻し方:** `git checkout -- gulpfile.js`
- **依存:** R-01
- **コミット:** `build: fail loudly on missing manifest entries`

### R-03 マニフェスト・ドリフト検査スクリプトを新設

- **対象:** 新規 `scripts/check_manifest.js`、`package.json`
- **問題:** 「src にあるのにマニフェストに無い」逆方向のドリフト(孤児化)を検出する仕組みがない。
- **変更:** 以下を新規作成(**そのまま使うこと**):

```javascript
'use strict';
// src/**/*.js が gulpfile の jsFiles に全て載っているか検査する。
// 既知の孤児(オーナー判断待ち)は ALLOWLIST に明示する。
const fs = require('fs');
const path = require('path');

const ALLOWLIST = new Set([
    'src/pages/address_input_page.js',
    'src/pages/file_upload_page.js',
    'src/pages/select_options_page.js',
    'src/view_component_bases/wrapper.js',
    'src/view_components/content_table_view.js',
    'src/view_components/description.js',
    'src/view_components/edit_content_view.js',
    'src/view_components/map_balloon.js',
    'src/view_components/map_pointer.js',
    'src/view_components/page_navigation_view.js',
    'src/view_components/search_box.js',
    'src/view_components/step_indicator.js',
    'src/view_components/translate_results_table_view.js',
]);

function walk(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (e.name.endsWith('.js')) out.push(p.replace(/\\/g, '/'));
    }
    return out;
}

const gulpfile = fs.readFileSync('gulpfile.js', 'utf8');
const manifest = new Set(
    [...gulpfile.matchAll(/'\.\/(src\/[^']+\.js)'/g)].map(m => m[1]));
const actual = walk('src');

const orphans = actual.filter(f => !manifest.has(f) && !ALLOWLIST.has(f));
const stale = [...ALLOWLIST].filter(f => !fs.existsSync(f));

if (orphans.length || stale.length) {
    if (orphans.length) console.error('NEW ORPHANS (add to gulpfile or ALLOWLIST):\n' + orphans.join('\n'));
    if (stale.length) console.error('STALE ALLOWLIST ENTRIES (remove):\n' + stale.join('\n'));
    process.exit(1);
}
console.log('manifest check: OK');
```

`package.json` の `scripts` に `"check:manifest": "node scripts/check_manifest.js"` を追記。

- **完了条件:** (1) `npm run check:manifest` exit 0。(2) 検証デモ: `src/__dummy__.js` を一時作成すると exit 1 になることを確認し、削除する。
- **リスク/戻し方:** ファイル削除のみ。src 無変更。
- **依存:** R-01(マニフェストの正規化後のパス集合が前提)
- **コミット:** `build: add manifest drift checker`

### R-04 ESLint 導入(暗黙グローバル地雷の静的ゲート ― 検証層の「床」)

> 本項目は本計画で最重要である。計画作成時に実コードで実測済み: 実行時間約0.6秒で、バンドル対象コード内のタイポ(F-7)・スコープ漏れ(F-9〜F-11)を含む未定義参照を機械検出した。検出済みの既知エラーは**修正せず**「ベースライン」として凍結し、**新規混入のみを fail させる**方式を採る(特性テストの lint 版)。

- **対象:** 新規 `scripts/gen_globals.js`、新規 `eslint.config.js`、新規 `scripts/lint_gate.js`、`package.json`
- **問題:** concat モデルでは他ファイル定義のクラスが各ファイル単体では未定義に見えるため、素の `no-undef` は使えない(グローバル許可リストの自動生成が必要)。また既知の未定義参照14件超が src に実在するため(F-7〜F-11)、単純な「エラー0件」ゲートは修正禁止の原則と矛盾する。
- **変更:**
  (1) `npm install --save-dev --save-exact eslint globals`(計画検証時: eslint v10.6.0)
  (2) `scripts/gen_globals.js` を新規作成。**注意: 定義抽出は行頭アンカー(`^class`)では不十分である**(F-8: `title.js` L20 の `class Title` は1スペースインデントされており、行頭前提だと `Title` が偽陽性になることを実測済み)。コメントを除去した上でインデント許容で抽出する以下のコードを**そのまま使うこと**:

```javascript
'use strict';
// src 全ファイルのトップレベル定義名を抽出し、ESLint の globals 許可リストを生成する。
// - コメント(// と /* */)を除去してから走査する(JSDoc 内の "class" 等の誤検出防止)
// - class / function はインデント許容(F-8: 非行頭のトップレベル宣言が実在するため)
// - const / let / var は行頭のみ(インデントされたものは関数内ローカルでありグローバルではない)
const fs = require('fs');
const path = require('path');
function walk(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (e.name.endsWith('.js')) out.push(p);
    }
    return out;
}
function stripComments(s) {
    return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}
const names = new Set();
for (const f of walk('src')) {
    const src = stripComments(fs.readFileSync(f, 'utf8'));
    for (const m of src.matchAll(/^[ \t]*(?:class|function)\s+([A-Za-z_$][\w$]*)/gm)) names.add(m[1]);
    for (const m of src.matchAll(/^(?:const|let|var)\s+([A-Za-z_$][\w$]*)/gm)) names.add(m[1]);
}
fs.writeFileSync('scripts/simplicity_globals.json',
    JSON.stringify([...names].sort(), null, 2));
console.log(`gen_globals: ${names.size} identifiers`);
```

  (3) `eslint.config.js` を新規作成:

```javascript
'use strict';
const globalsLib = require('globals');
const simplicityGlobals = Object.fromEntries(
    require('./scripts/simplicity_globals.json').map(n => [n, 'readonly']));

module.exports = [
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',   // import/export を構文エラーにする(設計の自己強制)
            globals: {
                ...globalsLib.browser,
                ...simplicityGlobals,
                Cookies: 'readonly',   // js-cookie(外部供給 §1.3)
                google: 'readonly',    // Google Maps JS API(外部供給 §1.3)
            },
        },
        rules: {
            'no-undef': 'error',
            'eqeqeq': 'warn',
            'no-var': 'warn',
            'no-unused-vars': 'warn',
        },
    },
];
```

  (4) `scripts/lint_gate.js` を新規作成(ベースライン比較ゲート。**そのまま使うこと**):

```javascript
'use strict';
// eslint の no-undef エラーを凍結済みベースラインと比較する。
// 新規エラー → exit 1(混入を防ぐ)。既知エラー → 許容(修正禁止の原則と両立)。
// ベースラインに載っているのに消えたエラー → exit 1(無断修正 or 走査劣化の検出)。
const { execSync } = require('child_process');
const fs = require('fs');
const BASELINE = 'scripts/eslint_baseline.json';

let raw;
try {
    raw = execSync('npx eslint src -f json', { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
} catch (e) {
    raw = e.stdout; // eslint はエラー検出時に非0で終了するが JSON は stdout に出る
}
const results = JSON.parse(raw);
const current = [];
for (const f of results) {
    for (const m of f.messages) {
        if (m.ruleId === 'no-undef') {
            const rel = f.filePath.replace(/\\/g, '/').replace(/^.*?(src\/)/, '$1');
            current.push(`${rel}:${m.line}:${(m.message.match(/^'([^']+)'/) || [])[1]}`);
        }
    }
}
current.sort();

if (process.argv.includes('--freeze')) {
    fs.writeFileSync(BASELINE, JSON.stringify(current, null, 2));
    console.log(`lint_gate: baseline frozen (${current.length} known errors)`);
    process.exit(0);
}
const baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
const bset = new Set(baseline), cset = new Set(current);
const added = current.filter(x => !bset.has(x));
const removed = baseline.filter(x => !cset.has(x));
if (added.length || removed.length) {
    if (added.length) console.error('NEW no-undef ERRORS (fix your change):\n' + added.join('\n'));
    if (removed.length) console.error('BASELINE ENTRIES DISAPPEARED (update baseline intentionally):\n' + removed.join('\n'));
    process.exit(1);
}
console.log(`lint_gate: OK (${baseline.length} known, 0 new)`);
```

  (5) `package.json` の `scripts` に追記:
  `"lint": "node scripts/gen_globals.js && node scripts/lint_gate.js"`
  (6) ベースラインの初回凍結: `node scripts/gen_globals.js && node scripts/lint_gate.js --freeze` を実行し、生成された `scripts/eslint_baseline.json` をコミットに含める。
- **凍結されるベースラインの想定内容(計画作成時の実測。行番号までこの通りであること自体は完了条件にしないが、大きく乖離したら中断・報告):** バンドル対象では `Browswer`(controller L271=F-7)、`parentId`×3(F-9)、`state`×2・`currentCell`×3(F-10)、`prefix`×2・`component`×2・`Coordinate`(F-11)。孤児ファイル内では `TargetLang`×11・`ListMenu`×10・`Content`・`translate`・`SearchBoxState`・`shouldAnimateCells`・`defaultCoordinate`×2・`OptionField` 等。`Cookies`/`google` は (3) の外部宣言により**エラーにならない**こと(なった場合は設定ミス)。`Title` は F-8 対応済みの gen_globals により**エラーにならない**こと。
- **完了条件:** (1) `npm run lint` exit 0。(2) 検証デモ: 任意の src ファイル末尾に `__no_such_identifier__;` を一時追記すると exit 1(NEW エラー検出)になることを確認し、追記を戻す(コミットしない)。(3) 警告(eqeqeq / no-var / no-unused-vars)の総数を `findings.md` に `R-04時点の警告ベースライン: <N>件` として記録。
- **リスク/戻し方:** 追加ファイルの削除のみ。src 無変更(dist sha は BASELINE のまま)。
- **依存:** R-01
- **コミット:** `chore: eslint no-undef gate with frozen baseline (floor of verification layer)`

### R-05 TypeScript を「検査器」としてのみ導入(構文ゲート + 外部グローバルの文書化)

> 位置づけ(大原則6): TypeScript はこの計画では**床ではなく任意の一枚**である。導入するのは (a) 構文ゲート(`checkJs:false`、実測約1.8秒、現状エラー0)と (b) `globals.d.ts` による外部グローバルの文書化のみ。**JSDoc 型付け・`checkJs:true` 化・`.ts` 化は本計画の範囲外**(§4 参照)。背景: TypeScript は 6.x(JS実装最終版)→ 7.0(Goネイティブ移植)の移行期にあり、7.0 では JS/JSDoc 型検査の一部パターンが非対応化される。構文ゲートと ambient 宣言だけならこの変動の影響をほぼ受けない。

- **対象:** 新規 `tsconfig.json`、新規 `types/globals.d.ts`、`package.json`
- **問題:** 外部供給グローバル(§1.3)がコード上どこにも宣言されておらず、1ファイルだけを読む者(人間・AI とも)には見えない。
- **変更:**
  (1) `npm install --save-dev --save-exact typescript@6.0.3`(大原則7: exact ピン。計画検証はこの版で実施。**本計画の途中で 7.x へ昇格しないこと**)
  (2) `tsconfig.json`:

```json
{
    "compilerOptions": {
        "allowJs": true,
        "checkJs": false,
        "noEmit": true,
        "target": "es2022",
        "lib": ["es2022", "dom"]
    },
    "include": ["src/**/*.js", "types/**/*.d.ts"]
}
```

  (3) `types/globals.d.ts`:

```typescript
// 外部スクリプトが実行時に供給するグローバル(バンドル外)。
// ここに載っていないグローバルへの依存を src に追加してはならない。
declare const Cookies: {
    get(name: string): string | undefined;
    set(name: string, value: string, options?: object): void;
    remove(name: string, options?: object): void;
};
declare const google: any; // Google Maps JS API(詳細型は将来 @types/google.maps 導入時に置換)
```

  (4) `package.json` に `"typecheck": "tsc --noEmit"` を追記。
- **判断規則:** `tsc` がエラーを出した場合 — `checkJs:false` のため出るのは構文レベルの問題のみ。コード修正は禁止。エラー内容を `findings.md` に記録し、当該ファイルを `include` から除外する `exclude` を追加して先へ進む(除外した事実も findings に記録)。
- **完了条件:** `npm run typecheck` exit 0。
- **リスク/戻し方:** 追加ファイルの削除のみ。src 無変更。
- **依存:** R-04
- **コミット:** `chore: tsc syntax gate and ambient declarations for external globals`

### R-06 デッドコード削除: `InputPageViewControllerConfig`

- **対象:** `src/view_controllers/input_page_view_controller.js` L50–74(`class InputPageViewControllerConfig {` から、L76 `class InputPageViewControllerProtocol` の直前の空行まで)
- **問題:** リポジトリ全体で参照が定義の1箇所のみ(grep 実測1件)。`InputPageViewController` 本体(L79〜)はこの Config を受け取らず、同じデフォルト群をコンストラクタで再定義している。完全なデッドコード。
- **変更:** クラス定義ブロック L50–74 と、その直上にこのクラス専用の JSDoc コメントブロックがあればそれも削除。**`InputPageViewControllerProtocol`(L76)と `InputPageViewDataModel`(L33)には触れない。**
- **完了条件(順に全て):**
  1. `grep -rn 'InputPageViewControllerConfig' src` が 0 件
  2. `npx gulp scripts` exit 0
  3. `git diff` で dist の差分が当該ブロックの消失のみであること(目視 diff で他の変更が混ざっていないこと)
  4. **ゴールデン更新:** `test/golden/class_inventory.json` から `"InputPageViewControllerConfig"` の1エントリのみを削除
  5. **lint ベースライン更新:** 本項目は controller の行番号をずらすため、同ファイル内の既知エラー(F-7 の `Browswer` 等)の行番号がベースラインと食い違い lint_gate が落ちる。`node scripts/gen_globals.js && node scripts/lint_gate.js --freeze` で再凍結し、`git diff scripts/eslint_baseline.json` の差分が **controller 内エントリの行番号シフトのみ**(識別子の増減なし)であることを確認してからコミットに含める
  6. `npm test` exit 0 / `npm run lint` exit 0 / `npm run typecheck` exit 0
  7. `CHECKSUMS.md` に `R-06  <新sha256>` を追記
- **リスク/戻し方:** `git checkout -- src/ test/golden/` 。テストが在庫以外で落ちた場合は削除範囲を誤っている。
- **依存:** 0-3, R-02, R-04, R-05
- **コミット:** `refactor: remove dead class InputPageViewControllerConfig`

### R-07 空ファイル削除: `src/pages/file_upload_page.js`

- **対象:** `src/pages/file_upload_page.js`(0行)、`scripts/check_manifest.js`
- **問題:** 空(0行)かつ孤児。存在自体がノイズ。
- **変更:** `git rm src/pages/file_upload_page.js`。`check_manifest.js` の `ALLOWLIST` から該当行を削除(残さないと STALE 検出で exit 1 になる)。
- **完了条件:** `npm run check:manifest` exit 0 / `npx gulp scripts` の dist sha が `CHECKSUMS.md` の R-06 行と一致 / `npm test` exit 0。
- **リスク/戻し方:** `git checkout -- .`
- **依存:** R-03, R-06
- **コミット:** `chore: delete empty orphan file_upload_page.js`

### R-08 未参照の孤児 10 ファイルを `attic/` へ退避

- **対象:** §1.4(b) の孤児のうち、バンドル対象コードから参照されない以下の10件(`map_pointer.js` と `description.js` は**対象外**、下記根拠):
  `pages/address_input_page.js`, `pages/select_options_page.js`, `view_component_bases/wrapper.js`, `view_components/content_table_view.js`, `view_components/edit_content_view.js`, `view_components/map_balloon.js`, `view_components/page_navigation_view.js`, `view_components/search_box.js`, `view_components/step_indicator.js`, `view_components/translate_results_table_view.js`
- **問題:** dist に入らないコード約2,000行が src に混在し、リポジトリを読む者(人間・AI)の in-context 事前分布を汚染している。ただし削除はオーナー判断を先取りしすぎるため、**履歴を保った退避**に留める。
- **除外根拠:** `map_pointer.js` は `position_map.js`(バンドル対象)L124/L420 が参照(F-1)。`description.js` は将来のバンドル復帰候補として位置が曖昧。この2件は**オーナー判断待ち**として src に残し、ALLOWLIST に留める。
- **変更:**
  1. `mkdir attic` し、上記10件を `git mv src/<path> attic/<同じ相対path>` で移動(ディレクトリ構造保持)
  2. `attic/README.md` を新規作成、内容は次の3行: 「このディレクトリのファイルは dist に含まれておらず、バンドル対象コードからも参照されていない(2026-07 検査時点)。復帰させる場合は gulpfile の jsFiles への追記と、依存順の確認が必要。削除の最終判断はオーナーに委ねる。」
  3. `check_manifest.js` の `ALLOWLIST` を次の2件だけに縮小: `src/view_components/description.js`, `src/view_components/map_pointer.js`
  4. **lint ベースライン更新:** 退避した10ファイル内の既知エラー(`TargetLang`/`ListMenu`/`SearchBoxState` 等)が消えるため lint_gate が「BASELINE ENTRIES DISAPPEARED」で落ちる。`node scripts/gen_globals.js && node scripts/lint_gate.js --freeze` で再凍結し、`git diff scripts/eslint_baseline.json` の差分が**退避10ファイル内エントリの削除のみ**であることを確認してからコミットに含める
- **完了条件:** `npm run check:manifest` exit 0 / dist sha が直近台帳行と一致(退避ファイルは元々 dist 外) / `npm test` exit 0 / `npm run lint` exit 0(gen_globals は src のみ走査のため退避分の識別子が消えるが、src 側から参照されていないことは本項目の前提そのものなので新規 `no-undef` は増えない。増えた場合は参照見落としであり、**当該ファイルを src に戻して**報告)。
- **リスク/戻し方:** `git mv` の逆操作(`git checkout` でも可)。
- **依存:** R-07
- **コミット:** `chore: move 10 unreferenced orphan files to attic/`

### R-09 ファイル名の命名統一(snake_case へ)

- **対象:** 以下4件のリネームと、`gulpfile.js` 内の対応パス書き換え(配列内の**位置は不変**):
  - `src/view_components/tableview.js` → `table_view.js`(gulpfile L45)
  - `src/view_components/textfield.js` → `text_field.js`(gulpfile L44)
  - `src/view_components/modalview.js` → `modal_view.js`(gulpfile L46)
  - `src/models/userbase.js` → `user_base.js`(gulpfile L25)
- **問題:** 他は `file_upload_view.js` 等 snake_case で統一されており、この4件のみ不統一。命名規則の一貫性は in-context 事前分布の品質に直結する。
- **変更:** `git mv` でリネームし、gulpfile の該当4行のパス文字列のみ書き換える。ファイル内容は1バイトも変更しない。
- **完了条件:** `npx gulp scripts` exit 0 / `dist/simplicity.js` の sha が直近台帳行と**一致**(連結内容は不変のため)。`dist/simplicity.js.map` は差分が出るが**許容**(ソースマップはファイル名を含むため)。`npm test` / `npm run lint` / `npm run check:manifest` すべて exit 0。
- **リスク/戻し方:** `git checkout -- .`。sha 不一致ならファイル内容に触れてしまっている。
- **依存:** R-08
- **コミット:** `chore: normalize four filenames to snake_case`

### R-10 直値の排除: `async_task_client.js` の本番ホスト直書き

- **対象:** `src/helpers/async_task_client.js` L3–4
- **問題:** 本番ホスト `quantz.sixths.ai:8001` がフレームワーク層に直書きされている。フレームワークは複数システムで共用されるため、消費側で上書き可能にすべき値。
- **変更(デフォルトは現値のまま = 挙動保存):**

変更前:
```javascript
const HOST = 'quantz.sixths.ai:8001'
const RequestTokenURL = `https://${HOST}/api/request-token`
```
変更後:
```javascript
// 消費側は simplicity.js 読み込み前に window.SIMPLICITY_ASYNC_HOST を定義して上書きできる。
const HOST = (typeof window !== 'undefined' && window.SIMPLICITY_ASYNC_HOST) || 'quantz.sixths.ai:8001'
const RequestTokenURL = `https://${HOST}/api/request-token`
```
- **完了条件:**
  1. 新規テスト `test/t08_async_host.test.js`: (a) 何も設定しない `loadBundle()` で `evalInPage('HOST')` が `'quantz.sixths.ai:8001'`、(b) `w.SIMPLICITY_ASYNC_HOST = 'example.test'` を `w.eval(code)` **より前**に設定するロード変種で `evalInPage('HOST')` が `'example.test'`(load_bundle.js にオプション引数 `{ presetGlobals }` を追加してよい。src には触れない)
  2. `git diff src/` の差分が上記2行(+コメント1行)のみ
  3. 全ゲート(build / test / lint / typecheck / check:manifest)exit 0、`CHECKSUMS.md` に `R-10  <新sha256>` 追記
- **リスク/戻し方:** `git checkout -- src/helpers/async_task_client.js`
- **依存:** R-09
- **コミット:** `refactor: make async task host overridable, default unchanged`

### R-11 `CLAUDE.md` の新設(規約の機械可読化)

- **対象:** 新規 `CLAUDE.md`(リポジトリルート)
- **問題:** concat ビルドの掟・グローバル規約・検証コマンドがどこにも文書化されておらず、AI・新規参加者が毎回再発見している。
- **変更:** 以下の内容で新規作成する(**この全文をそのまま使うこと**):

```markdown
# simplicity 開発規約

## 設計原則(変更禁止)
- 本フレームワークは意図的に concat + グローバル名前空間で設計されている。
  src 配下に import / export / require を書いてはならない(eslint が構文エラーにする)。
- 各ファイルのトップレベル class/function/const はグローバル名前空間を共有する。
  ファイル間の依存は gulpfile.js の jsFiles 配列の「順序」で解決される。

## 新規ファイルを追加するとき(必須手順)
1. src 配下に snake_case で作成する(クラス名は PascalCase)。
2. gulpfile.js の paths.jsFiles に、依存するファイルより「後」の位置に追記する。
   追記しない限り dist に入らない。npm run check:manifest が検出する。
3. npm run lint && npm run typecheck && npm test && npx gulp scripts を全て通す。

## 外部供給グローバル(バンドル外・types/globals.d.ts が正)
- Cookies(js-cookie)、google(Google Maps JS API)。
- 新しい外部グローバルへの依存を追加する場合は globals.d.ts と
  eslint.config.js に宣言を追加すること。宣言なき依存は lint が落とす。

## 検証コマンド
- ビルド: npx gulp scripts(dist/simplicity.js が唯一の成果物)
- テスト: npm test(jsdom 特性テスト。ゴールデンは test/golden/)
- lint: npm run lint / 型: npm run typecheck / マニフェスト: npm run check:manifest

## 禁止事項
- dist/ の手編集。
- attic/ のファイルを無断で src に戻すこと。
- 挙動変更を伴う「ついで修正」。バグを見つけたら findings.md に記録する。
- 新規コードでの console.log(debuglog を使う)、var、緩い ==。
- devDependencies の無断アップグレード(exact ピン。特に typescript は
  6.x に固定。7.x への昇格は JS 型検査面の変更を伴うため意図的に行う)。
- JSDoc 型付け・checkJs:true 化・.ts 化(任意の「天井」。導入は別計画で)。
```

- **完了条件:** ファイルが上記内容で存在する。
- **依存:** R-10(記載コマンドが全て実在すること)
- **コミット:** `docs: add CLAUDE.md conventions`

### R-12 最終検証とタグ

- **変更:** なし(検証のみ)
- **完了条件:** 次を上から順に全て実行し、全て exit 0:
  `npx gulp scripts` → sha が `CHECKSUMS.md` 最終行と一致 → `npm test` → `npm run lint` → `npm run typecheck` → `npm run check:manifest`
  その後 `git tag refactor-v1-complete`。
- **依存:** R-01〜R-11 全部
- **コミット:** タグのみ


---

## 4. やらないことリスト(実行者は善意でも逸脱しないこと)

以下は一見「ついでに直すべき改善」に見えるが、**すべて禁止**である。理由も併記する。

| 禁止事項 | 理由 |
|---|---|
| `map_pointer.js` / `map_balloon.js` / `description.js` を gulpfile に追加して「バンドル漏れを修正」すること | dist の内容が変わる=挙動変更。F-1 は既知の状態であり、quantz はこの経路を使わずに稼働している。追加はオーナーのみが判断する |
| F-1〜F-12(§1.5)のバグ修正。**特に F-7 のタイポ `Browswer` → `Browser` の修正** | 挙動変更(現状この経路は console エラーを出しつつ握り潰されており、「直す」と未検証の新挙動が有効化される)。findings.md への記録のみ。修正はテスト拡充後の次期計画で行う |
| src への `// eslint-disable` コメント追加によるエラー黙殺 | コメントは concat で dist に入るため dist が変わる。既知エラーの許容は lint_gate のベースライン機構(R-04)が担う |
| `==` → `===`、`var` → `let/const` の一括変換 | 緩い比較に依存した挙動(`null == undefined` 等)が実在しうる。lint 警告ベースラインとして可視化に留める |
| `console.log` の削除・`debuglog` への置換 | 出力形式が変わる。次期計画の範囲 |
| 巨大ファイルの分割(`tableview.js` 915行、`textfield.js` 757行、`input_page_view_controller.js` 585行) | 特性テストのカバレッジがまだ薄い現段階では安全網の強度不足。次期計画(本計画完了後、テスト拡充とセット)で行う |
| `view_component_bases/` の廃止(README.md に "will be deprecated" とあるが) | 同ディレクトリの5ファイルは dist の土台として現役(load-bearing)。廃止の完遂/撤回はオーナー判断 |
| npm 依存パッケージのバージョン更新・追加(本計画が明示する devDependencies を除く) | ビルド出力が変わるリスク |
| ESM / import / export / require の導入、`.ts` への拡張子変更、Babel/webpack への移行 | 設計原則違反(§大原則5) |
| JSDoc 型注釈の追加、`checkJs: true` 化 | 「天井」であり本計画の範囲外(大原則6)。コメント追加は dist も変える。TypeScript 7.0 で JS/JSDoc 型検査面が縮小されるため、着手するなら版を見極めた別計画で行う |
| typescript の 7.x への昇格、devDependencies の caret(`^`)指定 | 大原則7。ゲートの意味論が無断で変わる。本計画は typescript@6.0.3 固定で検証済み |
| `dist/` 配下の手編集 | dist はビルド生成物 |
| JSDoc・コメントの「改善」、変数リネーム、フォーマッタ(Prettier 等)の適用 | dist の diff が膨らみ、各項目の「差分が該当箇所のみ」という完了条件が検証不能になる |
| 機能追加・API 変更・CSS/LESS への変更 | 本計画の範囲外 |
| **auth SSO 統合の準備工事**(`Http` への 401→リダイレクト追加、`UserBase` の URL 変更、`async_task_client` の認証方式変更、UserInfo 形状への追従など、PROTOCOL.md を見て気を利かせる変更すべて) | simplicity は auth 非依存(§1.7)。統合は本計画完遂後の別計画で、契約テストのある状態で行う。先回りの準備工事は挙動変更かつ未検証の結合を生む |

## 5. 発見事項の報告ルール

- 作業中に新たな問題(バグ疑い、デッドコード疑い、命名不統一など)を見つけた場合: **修正せず**、`findings.md` に「ファイルパス:行番号 / 事実 / 発見した項目ID」の形式で1行追記する。追記は現在作業中の項目のコミットに含めてよい。
- 「事実」には解釈を書かない。例: 良い「L124 で MapPointer を new しているが MapPointer は dist に不在」/ 悪い「マップ機能が壊れている」。
- findings.md は捨て場ではない。本計画完遂後の**バグ修正計画**(ワークスペースの docs/ROADMAP.md Phase 3)の入力であり、記録された各項目はそこで「修正/仕様として凍結/次期送り」に仕分けされ、修正はテストの床がある状態で一括実行される。

## 6. 計画のトレース検証(作成者による事前検証の記録)

実行順に前提が壊れないことを確認済み:
- R-01/R-02 は dist 不変(デッドエントリは `allowEmpty` により元々 no-op)→ sha 一致で機械証明可能。
- R-03 の ALLOWLIST(13件)は R-01 完了後の孤児集合と一致。R-07 で1件、R-08 で10件を ALLOWLIST から除去する更新手順を各項目に内包済み(更新漏れは check:manifest の STALE 検出が exit 1 で捕捉)。
- R-04 の globals は `gen_globals.js` が **lint 実行のたびに src から再生成**するため、R-06(クラス削除)・R-08(ファイル退避)・R-09(リネーム)の後も自動追随し、陳腐化しない。gen_globals は非行頭トップレベル宣言(F-8)に対応済みで、`Title` 等の偽陽性が出ないことを実測確認済み。
- lint_gate のベースラインは `ファイル:行:識別子` で凍結するため、**行番号をずらす項目・エラーを含むファイルを動かす項目では再凍結が必要**。該当は R-06(controller の行シフト)と R-08(孤児10ファイルの退避)の2つで、両項目に「再凍結+diff が想定差分のみであることの確認」手順を内包済み。R-07(空ファイル・エントリなし)、R-09(リネーム4ファイルにベースラインエントリなし: `Cookies` は外部宣言済みでエラーにならない)、R-10(async_task_client にエントリなし)は再凍結不要であることを確認済み。
- R-06 は dist を変える最初の項目であり、それ以前にテスト(0-3)と全ゲート(R-02/R-04/R-05)が稼働済みという順序になっている。T-02 ゴールデンの更新手順(1エントリ削除のみ)を項目内に明記済み。
- R-08 で src から識別子が消えても、退避対象は「バンドル対象コードから未参照」が選定条件そのものなので新規 `no-undef` は増えない(増えたら選定ミスとして戻す規則を項目内に明記済み)。
- R-09 は gulpfile の配列位置を変えないため連結順不変 → `simplicity.js` の sha 一致で機械証明可能(`.map` のみ差分許容と明記済み)。
- R-10 は dist を変える(2行)が、diff の目視確認と新テスト T-08 で挙動(デフォルト値不変+上書き可)を機械証明する。
- 依存グラフに循環なし。全項目が「直前までの台帳 sha」または「テスト green」のどちらかで独立検証可能。

## 7. 実行者への指示文(このままコピペして渡すこと)

```
あなたは simplicity リポジトリのリファクタリング実行者です。
リポジトリと REFACTORING_PLAN.md を渡します。以下を厳守してください。

1. まず REFACTORING_PLAN.md の「大原則」「§1 現状理解」「§4 やらないことリスト」を読む。
2. 項目0(0-1 → 0-2 → 0-3)から始め、R-01 → R-12 まで記載の実行順どおりに1項目ずつ実施する。
   順序の入替・スキップ・並行作業は禁止。
3. 1項目 = 1コミット。コミットメッセージは各項目に指定されたものを使う。
4. 各項目の「完了条件」をすべて満たしたことをコマンド実行で確認してからコミットする。
   完了条件を満たせない場合は、その項目の「戻し方」で変更を破棄し、
   何をどう試してどう失敗したかを報告して停止する。推測で先へ進まない。
5. 計画に書かれていない変更は一切行わない。改善案・バグを見つけたら findings.md に
   記録するだけにする(計画書 §5 の形式)。
6. dist/simplicity.js を手で編集しない。ビルドは常に npx gulp scripts で行う。
7. すべての項目が完了したら、R-12 の最終検証結果(各コマンドの exit code と最終 sha256)と、
   findings.md の全内容を報告する。
```