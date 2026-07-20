# 次期サイクル台帳(2026 リファクタリング作戦からの繰延)

Phase 1〜3 と**スタイル基盤刷新(style_plan v1.3・2026-07-20 完遂)**の findings と
仕分けで「次期送り」と確定した項目の集約。
正本は各リポジトリの findings.md(本表は索引)。着手時は本表を入力に
bugfix_plan と同型の計画を起草する。

| # | 項目 | 出所 | 種別 |
|---|---|---|---|
| 1 | celery.py の非実在モジュール import(live シンボル)— celery の実用途確定時に意味論を設計 | libcommon P3-L7 | 設計判断 |
| 2 | draggable のリスナー解放(F-5 の実害残)。両 setInterval は自己解放済みと監査確認 | simplicity P3-S5 | バグ修正 |
| 3 | PositionMap 一族の再生 or 廃止(F-1/F-2/F-11: MapPointer 不在・Config 取り落とし・未定義変数) | simplicity §1.3 | 機能判断 |
| 4 | Validator.notCorresponding の実装(現状: 消費ゼロ・未実装 TypeError) | simplicity §1.3 | 機能設計 |
| 5 | locale.py の stdlib shadow 根治(モジュールリネーム=全消費先 import 変更) | libcommon N-1 | 破壊的変更 |
| 6 | 残 4×500 ルートの仕分け(TemplateNotFound 2件=デッドルート疑い、データ経路2件) | quantz §1.3(P3-R1 で2件は N-5 波及と判明し 400 化済み) | 機能判断 |
| 7 | flask_helpers の未使用 import 9件(F401 ignore で温存中) | libcommon P3-L3 | 掃除 |
| 8 | スター import の一斉整理(F-6)/ thinkx 独自 flask_helper.py の統合(F-7) | libcommon 既決 | 掃除/統合 |
| 9 | Config の pydantic-settings 化(D-18)/ ~~LESS 凍結→ネイティブ CSS 移行~~(**ST-8 で完了・2026-07-20**) | 監査時決定 | 任意改善 |
| 10 | コーディングガイド正規化(D-19: 誤変換除去・quantz 反映・公理→契約→リポ→skills 層分解) | Phase 5 前提 | 文書 |
| 11 | F-7 残: _updatePageIndexInBrowswerURL メソッド名 typo(内部一貫・無害) | simplicity §1.3 | 美観 |

## スタイル基盤刷新(style_plan v1.3)からの繰延

| # | 項目 | 出所 | 種別 |
|---|---|---|---|
| 12 | **ST-R: quantz-web への spl- 改名の実適用**(引き金=オーナーが新 simplicity 採用を決めた時。手順書 migration/ADOPTION.md、キット migration/apply_rename.js) | style_plan ST-R | 予約作業 |
| 13 | dark テーマのボタンラベル視認性(NextButton/BackButton/LoadButton は生きた simplicity CSS を持たず UA/reset 由来の配色になる)。dark 第1版として受容済み | ST-11 | 意匠改善 |
| 14 | 値名トークン `--spl-c-*` の意味名昇格(less 関数計算・ローカル変数上書き由来で意味の系譜が失われた分) | ST-9 | 設計判断 |
| 15 | TextField `isCancelButton: true` が構築不能(`cancelButtonPlace` が constructor 引数に無く TypeError) | ST-1 | バグ修正 |
| 16 | `FileUploadViewUploadState` の onuploadcompleted / onuploadfailed が同値 2(enum 衝突)+ セルの公開 API に「失敗」状態が無い | ST-1 | バグ修正 |
| 17 | LoadingMessage が JS 内にスタイルを自己注入し独自 custom properties(`--lm-grad-*`)を使用。トークン体系(`--spl-*`)への統合が未 | ST-1 / ST-9 | 統合 |
| 18 | quantz-web `templates/main/materials.html` の material_keywords_field.js 二重 script タグ(再宣言 SyntaxError。現行バグ) | ST-2 | バグ修正(消費側) |
| 19 | quantz-web `inquiry_view_controller.js` が旧位置引数 API(Validator / Page 系 / GradientLoadingBar / InputPageViewController)で書かれ現 HEAD と非互換(構築時エラー) | ST-1 | 機能判断(消費側) |
| 20 | file_types アイコン6点・logo.png・map_pointer 2点が quantz-web の git に不在(本番は手動配置と推測。site fixture では 404) | ST-2 / ST-7 | 資産整理 |
| 21 | SingleTextInputPage / LastNameFirstNamePage は構築不能のまま凍結(D-42 で「使わない」と裁定・削除もしない)。将来の削除可否は要判断 | ST-1 / D-42 | 機能判断 |