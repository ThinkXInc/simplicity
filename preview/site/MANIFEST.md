# preview/site/MANIFEST.md — site fixture の出所台帳(ST-2)

- 出所リポジトリ: quantz-web(読み取りのみ)
- 出所 ref: origin/master 99a9488714b94e227ecec54340df031419c5d1e2
- libcommon locale の出所: submodule gitlink ba9efa89b40dabd4aa47ea628d43a9ad904fdbd4
- 抽出日: 2026-07-19
- 抽出コマンド: node scripts/extract_site_fixture.js(本ファイルも同コマンドが再生成する)
- simplicity 資産(/js/simplicity/dist/*)はコピーせず、ランチャが simplicity/dist を直接 serve する。

## 改変して収録(外部通信の排除。改変内容は抽出スクリプトの TEMPLATE_MODS が全量)

- templates/general/base.html — Twitter 広告トラッカーのブロックを除去(外部通信禁止) / Google Tag Manager ブロックを除去(外部通信禁止) / gtag.js ブロックを除去(外部通信禁止) / GTM noscript iframe を除去(外部通信禁止)
- templates/main/signin.html — Google GSI をローカルスタブへ置換
- templates/main/signup.html — Google GSI をローカルスタブへ置換 / Stripe.js をローカルスタブへ置換
- templates/main/materials.html — Stripe.js をローカルスタブへ置換 / quantz-button(外部配信ウィジェット)をローカルスタブへ置換

## 原文のまま収録

- templates/general/common.html
- templates/common/vertical_header.html
- templates/main/interviews.html
- src/less/common/common.less
- src/less/common/footer.less
- src/less/common/header.less
- src/less/common/lang_selector.less
- src/less/develop/build-type-c.less
- src/less/errors/error_pages.less
- src/less/general/colorscheme.less
- src/less/general/effects.less
- src/less/general/mixin.less
- src/less/general/reset.less
- src/less/main.less
- src/less/sample_sites/sample_sites.less
- src/less/terms_and_privacy/terms_and_privacy.less
- src/less/tools/ripple_button.less
- src/less/top/corporate_footer.less
- src/less/top/interview_top.less
- src/less/top/top.less
- src/less/views/accounts.less
- src/less/views/create.less
- src/less/views/create_start_view.less
- src/less/views/customize.less
- src/less/views/interview.less
- src/less/views/interview_create_view.less
- src/less/views/interview_link_view.less
- src/less/views/interview_results_view.less
- src/less/views/interview_settings_view.less
- src/less/views/interviews_home.less
- src/less/views/material_keywords_field.less
- src/less/views/material_sample_answer_view.less
- src/less/views/material_sample_question_field.less
- src/less/views/material_text_field.less
- src/less/views/material_title_field.less
- src/less/views/materials.less
- src/less/views/program_view.less
- src/less/views/settings.less
- src/less/views/studio.less
- src/less/views/studio_header.less
- src/less/views/vertical_header.less
- src/less/views/vertical_menu.less
- src/less/views/voiceset_select_view.less
- static/js/helpers/googleoauth.js
- static/js/data/enums.js
- static/js/view_controllers/signin.js
- static/js/view_controllers/signup.js
- static/js/view_controllers/materials.js
- static/js/view_controllers/material_create_view_controller.js
- static/js/view_controllers/interview_home_view_controller.js
- static/js/view_components/card_input.js
- static/js/view_components/material_list.js
- static/js/view_components/material_delete_modal_view.js
- static/js/view_components/origin_form.js
- static/js/view_components/email_form.js
- static/js/view_components/settings_view.js
- static/js/view_components/customize_view.js
- static/js/view_components/material_text_field.js
- static/js/view_components/material_title_field.js
- static/js/view_components/material_keywords_field.js
- static/js/view_components/material_sample_question_field.js
- static/js/view_components/material_sample_answer_view.js
- static/js/view_components/interview_list.js
- static/js/view_components/interview_settings_view.js
- static/js/view_components/interview_link_view.js
- static/js/view_components/interview_create_view.js
- static/js/view_components/interview_results_view.js
- static/js/view_components/interview_result_preview.js
- static/js/pages/material_create_page.js
- static/js/libs/highlight.min.js
- locales/metadata.json
- locales/header.json
- locales/emails.json
- locales/accounts.json
- locales/accounts_responses.json
- locales/basic_configs.json
- locales/basic_configs_responses.json
- locales/settings.json
- locales/customize.json
- locales/materials.json
- locales/materials_responses.json
- locales/interviews.json
- locales/interviews_responses.json
- static/img/back-arrow.svg
- static/img/logo/white@2x.png
- static/img/top/bg.png
- static/img/vertical_header/logout-icon.svg
- static/img/vertical_header/settings-icon.svg
- static/img/vertical_menu/conversation-flow-icon.svg
- static/img/vertical_menu/interview-icon.svg
- static/img/vertical_menu/knowledge-icon.svg

## submodule 実体から収録

- locales/libcommon/api_response.json — libcommon submodule (gitlink ba9efa8) のローカル実体から
- locales/libcommon/errors.json — libcommon submodule (gitlink ba9efa8) のローカル実体から
- locales/libcommon/validation_errors.json — libcommon submodule (gitlink ba9efa8) のローカル実体から

## 参照はあるが出所リポジトリに存在しないファイル(fixture では 404 または stubs/ で代替)

- img/logo.png
- fonts/GeosansLight.ttf(views/fonts は .gitkeep のみ)
- js/libs/anime.min.js(git 非追跡。/js/libs/anime.min.js にスタブを配置)
- css/darkmoss.min.css(git 非追跡。空スタブを配置)
