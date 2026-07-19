'use strict';
// scripts/extract_site_fixture.js — ST-2: quantz-web から site fixture を抽出する。
// quantz-web リポジトリへは一切書き込まない(git show による読み取りのみ)。
// 出力: preview/site/{templates,src/less,static,locales} と MANIFEST.md。
// 実行: node scripts/extract_site_fixture.js
// 前提: ../quantz-web が並置され、対象 SHA が fetch 済みであること。

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'preview', 'site');
const QUANTZ = process.env.QUANTZ_WEB_DIR || path.resolve(ROOT, '..', 'quantz-web');
const REF = '99a9488714b94e227ecec54340df031419c5d1e2'; // quantz-web origin/master(ST-0 凍結)
const PREFIX = 'web-server/views';

const gitShow = (repoPath) =>
    execFileSync('git', ['-C', QUANTZ, 'show', `${REF}:${repoPath}`], { maxBuffer: 64 * 1024 * 1024 });
const gitList = (repoPath) =>
    execFileSync('git', ['-C', QUANTZ, 'ls-tree', '-r', '--name-only', REF, repoPath], { encoding: 'utf8' })
        .split('\n').filter(Boolean);

const written = { verbatim: [], modified: [], submodule: [], generated: [] };
const writeOut = (destRel, buffer, listKey, note) => {
    const dest = path.join(SITE, destRel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buffer);
    written[listKey].push(note ? `${destRel} — ${note}` : destRel);
};

// ---- 1. テンプレート(4枚は外部通信排除の改変あり・内容は下の replacements が全量) ----

const TEMPLATE_MODS = {
    'templates/general/base.html': [
        { desc: 'Twitter 広告トラッカーのブロックを除去(外部通信禁止)',
          re: /\n\s*<!-- Twitter conversion tracking base code -->[\s\S]*?<!-- End Twitter conversion tracking base code -->/, sub: '' },
        { desc: 'Google Tag Manager ブロックを除去(外部通信禁止)',
          re: /\n\s*<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/, sub: '' },
        { desc: 'gtag.js ブロックを除去(外部通信禁止)',
          re: /\n\s*<!-- Google tag \(gtag\.js\) -->[\s\S]*?<\/script>\n\s*<script>[\s\S]*?gtag\('config', 'G-8Z6YJ4BNY9'\);\n\s*<\/script>/, sub: '' },
        { desc: 'GTM noscript iframe を除去(外部通信禁止)',
          re: /\n\s*<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/, sub: '' }
    ],
    'templates/main/signin.html': [
        { desc: 'Google GSI をローカルスタブへ置換',
          re: /https:\/\/accounts\.google\.com\/gsi\/client/, sub: '/stubs/gsi_client.js' }
    ],
    'templates/main/signup.html': [
        { desc: 'Google GSI をローカルスタブへ置換',
          re: /https:\/\/accounts\.google\.com\/gsi\/client/, sub: '/stubs/gsi_client.js' },
        { desc: 'Stripe.js をローカルスタブへ置換',
          re: /https:\/\/js\.stripe\.com\/v3\//, sub: '/stubs/stripe.js' }
    ],
    'templates/main/materials.html': [
        { desc: 'Stripe.js をローカルスタブへ置換',
          re: /https:\/\/js\.stripe\.com\/v3\//, sub: '/stubs/stripe.js' },
        { desc: 'quantz-button(外部配信ウィジェット)をローカルスタブへ置換',
          re: /https:\/\/quantz\.thinkxinc\.com\/js\/dist\/quantz-button\.min\.js/, sub: '/stubs/quantz_button.js' }
    ]
};

const TEMPLATES = [
    'templates/general/base.html',
    'templates/general/common.html',
    'templates/common/vertical_header.html',
    'templates/main/signin.html',
    'templates/main/signup.html',
    'templates/main/materials.html',
    'templates/main/interviews.html'
];

for (const t of TEMPLATES) {
    let text = gitShow(`${PREFIX}/${t}`).toString('utf8');
    const mods = TEMPLATE_MODS[t];
    if (mods) {
        const applied = [];
        for (const m of mods) {
            if (!m.re.test(text)) throw new Error(`${t}: 改変パターン不一致: ${m.desc}`);
            text = text.replace(m.re, m.sub);
            applied.push(m.desc);
        }
        writeOut(t, Buffer.from(text), 'modified', applied.join(' / '));
    } else {
        writeOut(t, Buffer.from(text), 'verbatim');
    }
}

// ---- 2. LESS 全量(main.less の import 閉包 = src/less ツリー) ----

for (const p of gitList(`${PREFIX}/src/less`)) {
    writeOut(p.replace(`${PREFIX}/`, ''), gitShow(p), 'verbatim');
}

// ---- 3. JS(対象4ページの template が読み込む全ファイル) ----

const JS_FILES = [
    'helpers/googleoauth.js',
    'data/enums.js',
    'view_controllers/signin.js',
    'view_controllers/signup.js',
    'view_controllers/materials.js',
    'view_controllers/material_create_view_controller.js',
    'view_controllers/interview_home_view_controller.js',
    'view_components/card_input.js',
    'view_components/material_list.js',
    'view_components/material_delete_modal_view.js',
    'view_components/origin_form.js',
    'view_components/email_form.js',
    'view_components/settings_view.js',
    'view_components/customize_view.js',
    'view_components/material_text_field.js',
    'view_components/material_title_field.js',
    'view_components/material_keywords_field.js',
    'view_components/material_sample_question_field.js',
    'view_components/material_sample_answer_view.js',
    'view_components/interview_list.js',
    'view_components/interview_settings_view.js',
    'view_components/interview_link_view.js',
    'view_components/interview_create_view.js',
    'view_components/interview_results_view.js',
    'view_components/interview_result_preview.js',
    'pages/material_create_page.js'
];
for (const f of JS_FILES) {
    writeOut(`static/js/${f}`, gitShow(`${PREFIX}/src/js/${f}`), 'verbatim');
}
// ビルド済みツリーに唯一 git 追跡されているライブラリ
writeOut('static/js/libs/highlight.min.js', gitShow(`${PREFIX}/js/libs/highlight.min.js`), 'verbatim');

// ---- 4. locale(対象4ページの blueprint が読む JSON) ----

const LOCALES = [
    'metadata.json', 'header.json', 'emails.json',
    'accounts.json', 'accounts_responses.json',
    'basic_configs.json', 'basic_configs_responses.json',
    'settings.json', 'customize.json',
    'materials.json', 'materials_responses.json',
    'interviews.json', 'interviews_responses.json'
];
for (const f of LOCALES) {
    writeOut(`locales/${f}`, gitShow(`web-server/locales/${f}`), 'verbatim');
}

// libcommon 共通 locale(COMMON_LOCALES_FILE_PATHS)。quantz-web の submodule 実体から読む。
const libcommonGitlink = execFileSync(
    'git', ['-C', QUANTZ, 'ls-tree', REF, 'web-server/libcommon'], { encoding: 'utf8' }).split(/\s+/)[2];
for (const f of ['api_response.json', 'errors.json', 'validation_errors.json']) {
    const src = path.join(QUANTZ, 'web-server', 'libcommon', 'locales', f);
    writeOut(`locales/libcommon/${f}`, fs.readFileSync(src), 'submodule',
        `libcommon submodule (gitlink ${libcommonGitlink.slice(0, 7)}) のローカル実体から`);
}

// ---- 5. 画像(コピー済み less / templates / js と、simplicity 自身の src が参照するものだけ) ----
// JS からの参照(アイコン類)を含める。simplicity src の /img 参照(button-loader・
// file_types 等)も本番では quantz の /img から配信されるため対象に含める。

const imgRefs = new Set();
const scanDirs = [
    path.join(SITE, 'src', 'less'),
    path.join(SITE, 'templates'),
    path.join(SITE, 'static', 'js'),
    path.join(ROOT, 'src')
];
const scan = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) { scan(p); continue; }
        const text = fs.readFileSync(p, 'utf8');
        for (const m of text.matchAll(/["'(]\/(img\/[^"')?\s]+)/g)) imgRefs.add(m[1]);
    }
};
scanDirs.forEach(scan);
const imgInRepo = new Set(gitList(`${PREFIX}/img`).map(p => p.replace(`${PREFIX}/`, '')));
const imgMissing = [];
for (const ref of [...imgRefs].sort()) {
    if (imgInRepo.has(ref)) writeOut(`static/${ref}`, gitShow(`${PREFIX}/${ref}`), 'verbatim');
    else imgMissing.push(ref);
}

// ---- 6. MANIFEST.md ----

const manifest = [
    '# preview/site/MANIFEST.md — site fixture の出所台帳(ST-2)',
    '',
    `- 出所リポジトリ: quantz-web(読み取りのみ)`,
    `- 出所 ref: origin/master ${REF}`,
    `- libcommon locale の出所: submodule gitlink ${libcommonGitlink}`,
    `- 抽出日: ${new Date().toISOString().slice(0, 10)}`,
    `- 抽出コマンド: node scripts/extract_site_fixture.js(本ファイルも同コマンドが再生成する)`,
    '- simplicity 資産(/js/simplicity/dist/*)はコピーせず、ランチャが simplicity/dist を直接 serve する。',
    '',
    '## 改変して収録(外部通信の排除。改変内容は抽出スクリプトの TEMPLATE_MODS が全量)',
    '',
    ...written.modified.map(f => `- ${f}`),
    '',
    '## 原文のまま収録',
    '',
    ...written.verbatim.map(f => `- ${f}`),
    '',
    '## submodule 実体から収録',
    '',
    ...written.submodule.map(f => `- ${f}`),
    '',
    '## 参照はあるが出所リポジトリに存在しないファイル(fixture では 404 または stubs/ で代替)',
    '',
    ...imgMissing.map(f => `- ${f}`),
    '- fonts/GeosansLight.ttf(views/fonts は .gitkeep のみ)',
    '- js/libs/anime.min.js(git 非追跡。/js/libs/anime.min.js にスタブを配置)',
    '- css/darkmoss.min.css(git 非追跡。空スタブを配置)',
    ''
].join('\n');
fs.writeFileSync(path.join(SITE, 'MANIFEST.md'), manifest);

console.log(`extracted: verbatim=${written.verbatim.length} modified=${written.modified.length} submodule=${written.submodule.length}`);
console.log(`img refs: ${imgRefs.size} (missing in repo: ${imgMissing.length})`);
console.log('next: npx lessc preview/site/src/less/main.less preview/site/static/css/main.css');
