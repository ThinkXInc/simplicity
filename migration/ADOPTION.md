# migration/ADOPTION.md — quantz-web への spl- 改名適用手順(ST-R・予約)

simplicity のスタイル基盤刷新(style_plan v1.3)で全 CSS クラスに `spl-` 接頭辞が付いた。
quantz-web が新しい simplicity を採用する時、本キットでアプリ側の参照を一括追随させる。
**本手順は style_plan の ST-R(オーナーが採用を決めた時点)で実行する。それまで quantz-web
には一切適用しない。**

## 前提

- 実行マシンに本リポジトリ(simplicity)の checkout があること(置換エンジンと
  `@babel/parser` を simplicity/node_modules から使うため、simplicity 側で
  `npm install` 済みであること)。
- quantz-web の作業ブランチを切ってから適用する(適用は通常の diff としてレビューできる)。
- 写像表は `simplicity/rename_map.json`(164 クラス・凍結済み)。追随キットの置換エンジンは
  `simplicity/migration/apply_rename.js`(クラス文脈限定・dry-run 付き。全文テキスト置換は
  行わない — D-38)。

## 手順(quantz-web リポジトリで)

1. **simplicity 新版の取り込み。** 既定は submodule SHA 前進:
   `web-server/views/src/js/simplicity` を `style-v1-complete` タグへ進める。
   vendoring(dist コピー)へ切り替える場合は dist/simplicity.js と
   dist/simplicity_default.css を配置し、テンプレートの参照パスは不変のため他に変更は無い。
2. **dry-run で置換対象を確認する**(パスは quantz-web ルートからの例):

   ```
   node ../simplicity/migration/apply_rename.js --map ../simplicity/rename_map.json --mode less --files web-server/views/src/less/**/*.less --dry-run
   node ../simplicity/migration/apply_rename.js --map ../simplicity/rename_map.json --mode js --files web-server/views/src/js/view_components/*.js web-server/views/src/js/view_controllers/*.js web-server/views/src/js/pages/*.js web-server/views/src/js/helpers/*.js web-server/views/src/js/data/*.js --dry-run
   node ../simplicity/migration/apply_rename.js --map ../simplicity/rename_map.json --mode html --files web-server/views/templates/**/*.html --dry-run
   ```

   (js の --files に `src/js/simplicity`(submodule)を含めないこと。)
3. **適用**: 同じコマンドから `--dry-run` を外して実行する。
4. **manual review 出力の裁定**: エンジンが報告する「純クラスリスト形リテラル」は
   自動置換されない。simplicity 側(ST-6)・fixture 側(ST-7)の裁定実績では、
   データフィールド名('title'・'keywords'・'text')、イベント名('selected'・'load'・
   'focus')、createElement/type 引数('input'・'text'・'label')、id 文字列
   ('VerifyCodeForm' 等)は**改名しない**。クラス実体の定数・enum 値のみ改名する。
5. **残存ゼロの機械確認**:

   ```
   node ../simplicity/scripts/check_no_legacy_classes.js --files web-server/views/src/less/**/*.less
   node ../simplicity/scripts/check_no_legacy_classes.js --js --files web-server/views/src/js/view_components/*.js web-server/views/src/js/view_controllers/*.js web-server/views/src/js/pages/*.js
   ```

6. **ビルドと画面確認**: views の JS/CSS を再ビルドし、代表ページ(signin / signup /
   materials / interviews)を目視確認する。simplicity 側の同等ページは
   `simplicity/preview/site/` のスクショゴールデン(改名後も改名前と画素一致)で
   検証済みであり、差が出た場合は quantz-web 固有の参照漏れを疑う。

## 既知の注意点(findings.md 由来)

- `templates/main/materials.html` は `material_keywords_field.js` の script タグが2重で、
  2回目の読み込みが SyntaxError になる(改名前からの現行バグ)。追随のついでに重複タグの
  削除を推奨(挙動変更はこの1点のみ・要オーナー承認)。
- `view_controllers/inquiry_view_controller.js` は旧位置引数 API(Validator / Page /
  GradientLoadingBar / InputPageViewController)で書かれており、現行 simplicity とは
  クラス改名以前に非互換(構築時エラー)。本キットの対象外として別途裁定する。
- quantz-web 独自の同名クラス(LoadButton に手動付与する `nextButton` 等)も本キットで
  一括改名される。fixture での実測ではこれで表示が保たれる(quantz 側 less も同時に
  改名されるため)。
