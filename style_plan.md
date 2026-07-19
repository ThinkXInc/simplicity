# simplicity スタイル基盤刷新計画書 v1.3

作成日: 2026-07-19(v1.3 同日改訂)/ 対象: **simplicity(原本リポジトリ・`2026refactor` = 53f0639 起点)のみ**。
quantz-web リポジトリには書き込まない(v1.2 の構図変更・§0)。正本はこのファイル1箇所(`simplicity/style_plan.md`)。
実行環境の前提: Node v18+、Python 3.10+(プレビューランチャ venv は python3.11/arm64)、git、
Playwright(ST-3 で exact ピン導入)。本物のインフラ不要。
関連文書: refactor_plan.md(Phase 1 完遂・参照のみ)/ CLAUDE.md + CLAUDE_REFACTORING.md /
docs/coding_guides/(原文+status)。

v1.3 の変更点(オーナー裁定 2026-07-19 の反映):
(1) **§7-1 接頭辞を `sim-` から `spl-` へ変更。** `spl` は SimPLicity の固有略称として
`sim` より他概念との衝突が少ない。クラス・CSS custom properties・テーマ属性・保存キーへ一貫適用する。
(2) ST-0 の quantz-web 台帳は「確定依存」ではなく**保守的な依存候補**であることを規範化。
一般名の同名非依存を含めて保持する理由と後続項目での扱いは `test/inventory/README.md` が正。

v1.2 の変更点(オーナー裁定 2026-07-19 の反映):
(1) **quantz-web の扱いを「並走改修」から「fixture 検証+追随キット」へ変更。** 実測により
quantz-web の simplicity submodule ピンは refactor-v1-complete より 57 コミット古く、消費は
SHA 固定=HEAD 追随ではないと確定。よって本計画は quantz-web リポジトリにブランチを切らず、
**代表ページの必要ファイルのみを simplicity 内へ vendoring した site fixture** で画面同一性を
検証し、実リポジトリへの適用は**追随キットによる予約項目(ST-R)**とする(Q-4 / Phase 4b / C-9 と
同型の機械的追随)。これによりセッションは simplicity 1リポジトリで完結する。
(2) 裁定の確定: **§7-1 接頭辞 = `sim-`**(v1.3 で `spl-` へ変更)。**§7-2 = 上記(1)の方式**
((a) ローカル未 push 成果は無しと実測済み)。
(3) CLAUDE.md は長期版と CLAUDE_REFACTORING.md(作戦期間規律)に分離(本計画の管轄外・配置のみ)。
(4) v1.1 の ST 番号は維持。ST-2 / ST-7 の内容を書き換え、ST-R(予約)を追加。

v1.1 の変更点: プレビュー基盤の一級市民化(ギャラリー+ランチャ)、ST-12 カラーバリエーション
検証の追加、接頭辞候補列挙、ST-0〜ST-13 再採番。

**本計画は他計画と同一セッションで扱わない(1セッション=1計画書。D-13)。**
実測値(§1)は 2026-07-19 に simplicity 53f0639 / quantz-web master 99a9488 に対して実測。

---

## §0 位置づけ

- simplicity の消費者は quantz-web のみ(monorepo 3サイトは未配線 — infra F16)。その消費は
  **submodule SHA 固定**であり、新版の採用は元々「意図的な取り込みイベント」である。
  本計画はその構図に合わせ、**原本(simplicity)で完結**し、quantz-web への実適用は
  追随キット(ST-7 成果物)を使う後日の小作業(ST-R)として予約する。
- B案(COMMON_LIB_POLICY)は monorepo 内サービスの規律であり本計画と矛盾しない。

---

## 大原則

1. **二等級制。**
   - **[知覚不変]** — クラス改名(ST-5〜7)・LESS→ネイティブ CSS 移行(ST-8)・トークン抽出(ST-9)。
     知覚面を 1px も変えない。正解 = 現行レンダリング。
   - **[拡張]** — テーマ層(ST-10〜12)。非既定テーマは新機能として新オラクルで固定。
     既定テーマの見た目は現行と完全同一([知覚不変]に含める)。
   等級は各項目に明記。明記のない知覚変化は違反。
2. **機械オラクルが全変更に先行する(D-4)。** (a) CSS 宣言ゴールデン(セレクタ→宣言集合の
   正規化比較。改名は写像適用後、トークン化は var() 解決後の値で一致)、(b) プレビュー基盤
   (ギャラリー+site fixture)のスクリーンショット回帰(固定 viewport・固定 fixture)、
   (c) Phase 1 既存ゲート(t01〜t07・lint・manifest)green 維持。
3. **人間の目視はプレビュー基盤の上で1回(ST-13・チェックリスト固定)。**
4. **改名の唯一の真実は写像表(`rename_map.json`)。** 全置換は写像表からの機械適用+
   grep ゲート(旧名残存 0)で機械判定。
5. **改名規則: 全 simplicity 所有クラスへ接頭辞 `spl-` を一律付与・セレクタ構造は不変。**
   例: `.TextField` → `.spl-TextField`、`.inputOuter` → `.spl-inputOuter`、`.selected` →
   `.spl-selected`。トークンは `--spl-*`、テーマ属性は `data-spl-theme`。
   ネスト構造・詳細度を変えないことで[知覚不変]の証明を機械判定に保つ。BEM 化はしない(§4)。
6. **ランタイムテーマは CSS custom properties 前提。** LESS 変数はコンパイル時に消えるため
   切替可能なテーマを作れない — LESS→ネイティブ CSS 移行を本計画に含める技術的理由。
7. **quantz-web リポジトリには書き込まない。** 読み取りは ST-0/ST-2 の抽出時のみ
   (対象 = origin/master 99a9488。ローカル clone は ff 追随済みであること)。
   消費者の安全は「site fixture での検証+追随キット+実適用時の再検証(ST-R)」で担保する。
8. 1項目 = 1コミット+push。ブランチは `2026refactor` 継続(D-14)。
9. 計画外の変更はしない。発見は findings.md へ(§6)。Security exception(D-22)は即停止・報告。
   依存は exact ピン。パスは明示列挙(D-21)。

---

## §1 現状(実測)

### simplicity(2026refactor = 53f0639)

- **less/ 7ファイル・計1826行**: colorscheme(50)・mixin(468)・reset(170)・view_components(929)・
  view_controllers(102)・notification(99)・simplicity_default(8 = 6ファイルの @import 束ね)。
- **ビルド**: less-watch-compiler(less/ → css/)→ gulp styles(cssnano+concat → dist/
  simplicity_default.css)。JS は gulp concat → dist/simplicity.js。dist は非追跡。
- **クラス名の実態**: 根は PascalCase で固有(.TextField .Incrementer .ModalView 等)。
  **内部・状態・ユーティリティが裸の一般名**(.title .footer .label .selected .show .focus
  .active .left .right .body .close .arrow .bg .listitem .listmenu .inputOuter 等+トップレベル
  ユーティリティ 40 個)。**JS が同じ文字列を classList/className/querySelector で直接操作** —
  CSS+JS+fixture の一体機械置換が必須である根拠。
- **テーマの現状**: colorscheme.less の LESS 変数 約40個。ランタイム切替機構なし。
- **検証の床**: test/t01〜t07 + golden/ + lint + manifest(Phase 1/3 資産・53f0639 で green)。

### quantz-web(origin/master = 99a9488)

- simplicity は submodule 消費で、**ピン SHA は refactor-v1-complete より 57 コミット古い**
  = 消費は固定であり HEAD 追随ではない(v1.2 の構図変更の根拠)。
- ローカルに未 push の Q トラック成果は**無い**(実測済み・§7-2(a) 解消)。
- テンプレート 62枚が dist の css/js を直リンク。**アプリ less(20+ファイル)と JS が
  simplicity の内部クラス名に直接依存**(.TextField .inputOuter .listmenu 等)。
- フル起動のローカル再現は非現実的(celery / datasets / accelerate、初期化が Mongo/Redis/llm に
  接触)→ 画面検証は site fixture+最小ランチャで行う。

---

## §2 到達形

```
simplicity/
├── styles/                       # less/ を置換(ネイティブ CSS)
│   ├── tokens.css                # :root { --spl-*: ... } 既定値=現行実測値
│   ├── themes/light.css / dark.css / _variation_*.css
│   ├── reset.css / utilities.css / view_components.css / view_controllers.css / notification.css
├── preview/
│   ├── gallery.html + fixtures.js   # ST-1: 全コンポーネント×fixture+テーマ切替 UI(静的)
│   └── site/                        # ST-2: site fixture(quantz-web からの vendoring・simplicity 所有)
│       ├── MANIFEST.md              # 出所 = quantz-web master 99a9488・抽出ファイル全一覧・抽出日
│       ├── preview_main.py          # 最小 Flask ランチャ(重い初期化なし・url_for スタブ)
│       ├── requirements-preview.txt # Flask のみ(exact ピン・venv は python3.11)
│       ├── templates/ less/ js/     # 代表ページの必要ファイルのみの固定コピー
│       └── fixtures/                # ページ変数 fixture(固定値)
├── rename_map.json               # 旧名→spl- 名の全量写像(恒久保存)
├── migration/                    # ST-7: 追随キット(quantz-web 実適用用・本計画では適用しない)
│   ├── apply_rename.js           # 任意のツリーに写像表を機械適用(templates/js/less 対応)
│   └── ADOPTION.md               # 実適用手順(ST-R): 取り込み → キット適用 → 検証
├── dist/                         # 出力パス・名前は現行互換
└── src/                          # 写像適用済み + Simplicity.setTheme() API
```

- **site fixture の役割**: 「実サイトの実テンプレート」でのスクショ回帰と目視の基盤。
  fixture で描画できない画面はギャラリーでカバーし、仕分けを台帳に明記(全62枚を狙わない)。
  fixture は simplicity 所有物なので写像適用してよい(quantz-web 本体は不変のまま)。
- **テーマ機構**: `<html data-spl-theme="...">` でトークン上書き。`Simplicity.setTheme(name)` が
  属性切替+localStorage 保存(キーは §7-3)。テーマ追加 = themes/ に1枚。
- **ビルド**: less-watch-compiler 廃止。concat+cssnano のみ。出力名不変。

---

## §3 作業項目

各項目 = 1コミット(+push)。コミットメッセージは `ST-番号: 要約`。順序は依存の記述である。

### ST-0 実測の凍結と前提確認 [オラクル前提]

- simplicity: 全クラス名の全量台帳(`test/inventory/classes_legacy.txt` — less セレクタ由来+
  src の class 文字列由来を出所付きで)。
- quantz-web(読み取りのみ・origin/master 99a9488): simplicity クラス名への依存箇所の全量台帳
  (less/js/templates 別・ファイル:行)+**代表ページの仕分け表**(fixture 化して描画可能な
  5〜8ページ/ギャラリー送り)+**fixture 抽出ファイル一覧の草案**(各ページの template と
  それが引く less/js/画像の依存閉包)。
- §7 の裁定転記(確定済み: 接頭辞 spl- / 方式 = fixture+追随キット)。
- quantz-web 依存台帳は一般名の同名利用を含む保守的候補であり、全行を確定依存または
  無条件置換対象として扱わない。理由・抽出境界・後続項目での扱いは
  `test/inventory/README.md` を必ず参照する。
- 完了条件: 台帳・仕分け表・抽出一覧草案がコミットされている。

### ST-1 コンポーネントギャラリー [オラクル前提・恒久資産]

- preview/gallery.html + fixtures.js: 全 view_components / view_controllers を fixture データで
  1画面に描画(dist 直読み)。テーマ切替 UI(ST-10 まではプレースホルダ)。
- 完了条件: 静的サーバ1コマンドで表示・t07 の対象一覧と突合して漏れ 0。

### ST-2 site fixture の抽出とランチャ [オラクル前提]

- ST-0 の抽出一覧に従い、quantz-web(99a9488)から代表ページの必要ファイルのみを
  preview/site/ へコピーし、MANIFEST.md に出所 SHA・全ファイル・抽出日を記録。
- preview_main.py(最小 Flask): 実テンプレートを fixtures/ の固定変数で描画。
  Mongo/Redis/celery/vectordb/llm は import ごと回避。url_for 不足はスタブ endpoint。
- 完了条件: 代表ページ全部が1コマンドで現行(改名前)の見た目で描画される。描画不能ページは
  仕分け表を更新しギャラリー送り確定。**quantz-web 本体への書き込みが無いこと**(git status clean)。

### ST-3 オラクル構築 [オラクル前提]

- (a) CSS 宣言ゴールデン: `scripts/css_golden.js`(セレクタ→正規化宣言集合。写像適用・var()
  解決に対応)+ゴールデン凍結。
- (b) スクショ回帰: Playwright(exact ピン導入)でギャラリー全景+site fixture 代表ページを
  固定 viewport で撮影・凍結。
- (c) 既存ゲート green 確認・記録。
- 完了条件: ゴールデンのコミット+green 記録。**以後この3点が全項目の合格判定器。**

### ST-4 写像表の作成 [知覚不変の設計]

- `rename_map.json`: 台帳の全クラス → `spl-`+旧名。
- 機械検査: 新名一意・新旧非衝突・台帳全量カバー・quantz-web 依存台帳の全名が写像ドメインに含有。
- 完了条件: 検査スクリプト green。**以後この表が全置換の唯一の入力。**

### ST-5 simplicity 改名(CSS) [知覚不変]

- 写像表を less 全ファイルへ機械適用(セレクタのみ)。
- 完了条件: ビルド → 宣言ゴールデン写像適用比較で完全一致+旧名 grep 0(less 内)。

### ST-6 simplicity 改名(JS・テスト・ギャラリー) [知覚不変]

- 写像表を src の class 文字列・test(t02 ゴールデン含む)・preview/gallery へ機械適用。
  文字列連結でクラス名を組む箇所は手動確認リストで個別適用。
- 完了条件: t01〜t07 green+旧名 grep 0(src/test/preview/gallery)+dist 再ビルド+
  ギャラリーのスクショ一致。

### ST-7 site fixture への適用と追随キット [知覚不変+成果物]

- 写像表を preview/site/(templates/less/js)へ機械適用し、新 dist で描画。
- **追随キットの作成**: migration/apply_rename.js(任意ツリーへの写像機械適用・dry-run 付き)+
  migration/ADOPTION.md(quantz-web 実適用手順: simplicity 新版の取り込み → apply_rename 実行 →
  旧名 grep 0 → ページ確認。取り込み方式は submodule SHA 前進を既定とし、vendoring 化の選択肢も併記)。
- 完了条件: site fixture のスクショ回帰一致+旧名 grep 0(preview/site 内)+
  apply_rename.js の自己テスト(fixture への適用が写像表と同結果になること)green。

### ST-8 LESS → ネイティブ CSS 移行 [知覚不変]

- 1ファイル=1サブコミットで less/ → styles/ へ変換。mixin は展開またはユーティリティ化
  (判断は宣言ゴールデン一致が機械判定)。less-watch-compiler を依存から除去。
- 完了条件: 宣言ゴールデン一致+スクショ一致(ギャラリー+site)+.less が消えている。

### ST-9 トークン抽出 [知覚不変]

- 旧 colorscheme 由来の全値+直書き色を `--spl-*` へ抽出し tokens.css に集約。既定値=現行実測値。
- 完了条件: 宣言ゴールデンが var() 解決後の値で完全一致+スクショ一致+色リテラル残存の仕分けが
  findings に記録される。

### ST-10 テーマ機構 [拡張]

- `data-spl-theme` によるトークン上書き+`Simplicity.setTheme(name)`(起動時復元含む)。
  ギャラリーの切替 UI を実配線。prefers-color-scheme 連動は §7-3。
- 完了条件: 既定テーマ=スクショゴールデン一致(不変の証明)+setTheme の jsdom 特性テスト green。

### ST-11 dark テーマ第1版 [拡張]

- themes/dark.css(全トークンの dark 値)。dark は**新ゴールデン**として独立凍結
  (ギャラリー+site 代表ページ)。WCAG AA コントラスト機械検査をゲートに含める。
- 完了条件: dark スクショ凍結+コントラスト検査 green+既定側全ゲート green 維持。

### ST-12 カラーバリエーション検証 [拡張・検証]

- 検証用 fixture テーマ2枚(themes/_variation_a.css / _variation_b.css)。
- 既定/dark/variation_a/variation_b の4状態をギャラリー+site 代表ページでスクショ凍結。
  **テーマ追加が「CSS 1枚を足すだけ」で完結したこと**(src・ビルド不触)を diff で機械確認。
- 完了条件: 4状態スクショ凍結+「1枚追加のみ」diff 検査 green+テーマ追加手順の README 化。

### ST-13 完了ゲート

- 全ゲート green(宣言ゴールデン / スクショ全テーマ / t01〜t07 / lint / manifest /
  旧名 grep 0(simplicity 全域))。
- **人間の目視(1回・プレビュー基盤上)**: ギャラリー全コンポーネント+site 代表ページを
  既定テーマで確認(観点: 現行との同一性)→ dark/variation を切替確認(観点: 切替の一貫性・
  視認性)。チェックリスト添付・承認を記録。
- version を上げタグ `style-v1-complete` を打つ。
- 完了条件: タグ push+目視承認の記録+findings の未処理ゼロ。

### ST-R 【予約】quantz-web 実適用(本計画のセッションでは実施しない)

- 引き金: オーナーが quantz-web に新 simplicity を採用すると決めた時。
- 内容: migration/ADOPTION.md に従い、quantz-web 側で 取り込み(submodule SHA 前進 or
  vendoring 化)→ apply_rename.js 適用 → 旧名 grep 0 → 実環境でのページ確認。
  Q-4 / Phase 4b と同型の機械的追随であり、独立の小セッションで行う。

---

## §4 やらないことリスト

- **quantz-web リポジトリへの書き込み**(ブランチ作成・コミット・push を含む一切。ST-R まで不触)。
- BEM 化・セレクタ構造の再編・詳細度の変更(spl- 接頭辞付与のみ)。
- 見た目のリデザイン・寸法/余白の「ついで調整」([拡張]のテーマ値を除き 1px も変えない)。
- 全62テンプレートの fixture 化(代表ページ+ギャラリーでカバー。仕分けは台帳が正)。
- quantz-web の実バックエンド(Mongo/Redis/celery/vectordb/llm)のモック化・起動・改修。
- monorepo 3サイトへの simplicity 配線(F16 の解消は E トラック側の判断)。
- 新コンポーネント追加・既存コンポーネントの機能変更。
- 本番デプロイ(計画外・人間がスケジュール)。
- Phase 3 findings 未修正項目や coding_principles_status の「裁定待ち」項目の「ついで適用」。

---

## §5 セッション運用(実行者への指示)

1. 実行セッションのルートは **simplicity リポジトリ**。quantz-web の clone は ST-0 / ST-2 の
   読み取り抽出時のみ参照する(origin/master 99a9488 に ff 追随済みであることを確認して使う)。
2. CLAUDE.md(長期規約)と CLAUDE_REFACTORING.md(作戦規律)→ 本計画の大原則・§1・§4・§6 を
   読み、現在地(未着手 / ST-x まで完了)と規範ファイルの実パス・版数を宣言して作業に入る。
3. ブランチ: `2026refactor` 継続。
4. パスは明示列挙(D-21)。計画と実環境が食い違ったら D-21 の修復手順。推測で進まない。
5. 完了条件 green で自動コミット+push。設計判断・想定外ゴールデン差分・Security は停止。

---

## §6 発見事項の報告ルール

- 修正せず findings.md に「ファイル:行 / 事実 / ST-番号」で1行追記。解釈を書かない。
- **Security exception(D-22)**: credential/token 漏えい・XSS・CSRF・open redirect・認可バイパス・
  secrets 混入等の疑いは findings に流さず即停止・人間へ報告。exploit 手順・秘密値を書かない。
- 想定外のゴールデン差分 = 挙動を壊した = 停止・報告(黙って再生成する行為は禁止)。

---

## §7 裁定記録と未決事項

1. **接頭辞 = `spl-`(裁定済み 2026-07-19・v1.3 で `sim-` 案を置換)。**
   SimPLicity の固有略称として識別容易。クラス `.spl-*` / トークン `--spl-*` /
   テーマ属性 `data-spl-theme` に一貫適用。
2. **quantz-web の方式 = site fixture 検証+追随キット(裁定済み 2026-07-19)。**
   (a) ローカル未 push 成果は無し(実測)。(b) 専用ブランチは切らない。実適用は ST-R。
   実適用時の取り込み形(submodule SHA 前進 or vendoring 化)は ST-R 時点の裁定
   (ADOPTION.md は両方式を記載)。
3. **未決: テーマの既定動作。** prefers-color-scheme 自動追従の有無。localStorage キー名
   (既定案: `spl-theme`)。ST-10 のゲート。
4. **未決: notification.css の扱い。** 現行どおり default バンドル同梱のままでよいか(ST-8 まで)。
