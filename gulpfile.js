const gulp = require('gulp');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const cssnano = require('gulp-cssnano');

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
        './src/models/userbase.js',
        './src/view_component_bases/view_component_base.js',
        './src/view_component_bases/form_component_base.js',
        './src/view_component_bases/loading_component_base.js',
        './src/view_component_bases/wrapper.js',
        './src/view_components/title.js',
        './src/view_components/button.js',
        './src/view_components/next_button.js',
        './src/view_components/back_button.js',
        './src/view_components/textfield.js',
        './src/view_components/tableview.js',
        './src/view_components/modalview.js',
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
    css: './css/simplicity_default.css',
    outputDir: './dist',
    jsOutputFile: 'simplicity.js',
    cssOutputFile: 'simplicity_default.css'
};

gulp.task('watch', function() {
  gulp.watch(paths.jsFiles, gulp.series('scripts'));
  gulp.watch(paths.css, gulp.series('styles'));
});

gulp.task('scripts', function() {
    return gulp.src(paths.jsFiles, { allowEmpty: true })
        .pipe(sourcemaps.init())
        .pipe(concat(paths.jsOutputFile))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.outputDir));
});

gulp.task('styles', function() {
    return gulp.src(paths.css)
        .pipe(sourcemaps.init())
        .pipe(cssnano())
        .pipe(concat(paths.cssOutputFile))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.outputDir));
});

gulp.task('default', gulp.parallel('scripts', 'styles'));
