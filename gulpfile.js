const gulp = require('gulp');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const cssnano = require('gulp-cssnano');
const fs = require('fs');

const paths = {
    jsFiles: [
        './src/data/countries.js',
        './src/etc/debug_log.js',
        './src/etc/svg_icons.js',
        './src/helpers/http.js',
        './src/helpers/async_task_client.js',
        './src/helpers/polling.js',
        './src/helpers/browser.js',
        './src/helpers/locale.js',
        './src/helpers/country.js',
        './src/helpers/user_preferences.js',
        './src/helpers/validator.js',
        './src/helpers/utils.js',
        './src/helpers/effects.js',
        './src/helpers/file_uploader.js',
        './src/helpers/volume_meter.js',
        './src/helpers/screen_lock.js',
        './src/helpers/draggable.js',
        './src/helpers/theme.js',
        './src/models/user_base.js',
        './src/view_component_bases/view_component_base.js',
        './src/view_component_bases/form_component_base.js',
        './src/view_component_bases/loading_base.js',
        './src/view_components/loading_message.js',
        './src/view_components/notification.js',
        './src/view_components/mesh.js',
        './src/view_components/load_button.js',
        './src/view_components/color_picker.js',
        './src/view_components/terms_scroll_view.js',
        './src/view_components/verify_code_form.js',
        './src/view_components/radio_button.js',
        './src/view_components/page_view.js',
        './src/view_components/title.js',
        './src/view_components/button.js',
        './src/view_components/next_button.js',
        './src/view_components/back_button.js',
        './src/view_components/text_field.js',
        './src/view_components/table_view.js',
        './src/view_components/modal_view.js',
        './src/view_components/keywords_field.js',
        './src/view_components/dropdown_button.js',
        './src/view_components/file_upload_view.js',
        './src/view_components/gradient_loading_bar.js',
        './src/view_components/gradient_view_loader.js',
        './src/view_components/position_map.js',
        './src/view_component_bases/alert_message_component_base.js',
        './src/view_components/alert_message.js',
        './src/view_component_bases/page.js',
        './src/pages/last_name_first_name_page.js',
        './src/pages/single_text_input_page.js',
        './src/view_controllers/input_page_view_controller.js'
    ],
    // テーマ = styles/themes/simplicity_<name>.css(トークン定義)。
    // 各テーマを先頭に構造CSSを連結し、dist へ**同名**の simplicity_<name>.css を出力する(D-44)。
    // 構造CSSの連結順は旧 less/simplicity_default.less の @import 順を保存する(カスケード保存)
    themesDir: './styles/themes',
    cssStructural: [
        './styles/utilities.css',
        './styles/reset.css',
        './styles/view_components.css',
        './styles/view_controllers.css',
        './styles/notification.css'
    ],
    outputDir: './dist',
    jsOutputFile: 'simplicity.js'
};

gulp.task('watch', function() {
  gulp.watch(paths.jsFiles, gulp.series('scripts'));
  gulp.watch(paths.cssStructural.concat([paths.themesDir + '/*.css']), gulp.series('styles'));
});

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

gulp.task('styles', async function() {
    // テーマ1枚 = バンドル1本。テーマ追加はファイルを置くだけでビルド定義に触れない。
    // concat を cssnano より先に行う(cssnano の @keyframes 縮小名・z-index 最適化は
    // ファイル単位で走るため、後段だと複数入力で名前が衝突する — 単一連結で旧挙動を保存)。
    // vinyl-fs 経由の書き込みが node 23 で css を落とす事故を実測したため、
    // gulp ストリームを使わず cssnano(gulp-cssnano の実体)を直接呼ぶ。
    const cssnanoCore = require('cssnano');
    const themeFiles = fs.readdirSync(paths.themesDir)
        .filter(f => /^simplicity_[A-Za-z0-9_-]+\.css$/.test(f))
        .sort();
    if (themeFiles.length === 0) {
        throw new Error(`No theme files found in ${paths.themesDir}`);
    }
    const structural = paths.cssStructural.map(p => fs.readFileSync(p, 'utf8'));
    for (const themeFile of themeFiles) {
        const themeSource = fs.readFileSync(`${paths.themesDir}/${themeFile}`, 'utf8');
        const bundle = [themeSource].concat(structural).join('\n');
        const result = await cssnanoCore.process(bundle, { from: undefined });
        fs.writeFileSync(`${paths.outputDir}/${themeFile}`, result.css);
    }
});

gulp.task('default', gulp.parallel('scripts', 'styles'));
