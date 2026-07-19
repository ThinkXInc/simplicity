# preview/site/preview_main.py — quantz-web 代表ページを固定データで描画する最小 Flask ランチャ(ST-2・dev 専用)
# quantz-web 本体・MongoDB・Redis・Celery・Vector DB・LLM は import しない・起動しない。
# デプロイ対象外。起動: venv/bin/python preview_main.py → http://127.0.0.1:8500/
#
# locale の合成は quantz-web 各 blueprint の Locale([...]) 定義(accounts.py / materials.py /
# interviews.py)をファイルリストごと写している。simplicity の dist はコピーせず
# ../../dist を直接 serve する(改名・移行の結果が即座に画面へ反映される)。

import json
from pathlib import Path

from flask import Flask, jsonify, render_template, send_from_directory

HERE = Path(__file__).resolve().parent
SIMPLICITY_ROOT = HERE.parent.parent
LOCALES = HERE / 'locales'

app = Flask(__name__, template_folder=str(HERE / 'templates'), static_folder=None)

LANG = 'en'
LANG_NAME = 'English'

# 表示専用の固定値(quantz-web Config 由来値の fixture 代替)
PRICING = {
    'free_call': '30',
    'unit_price': '0.1',
    'general_credit_per_response': '1',
    'interview_credit_per_response': '10',
}

COMMON_LOCALES = [
    LOCALES / 'libcommon' / 'api_response.json',
    LOCALES / 'libcommon' / 'errors.json',
    LOCALES / 'libcommon' / 'validation_errors.json',
]

# quantz-web の各 blueprint と同じ構成・同じ順序
PAGE_LOCALES = {
    'signin': ['metadata.json', 'header.json', 'emails.json',
               'accounts_responses.json', 'accounts.json', 'basic_configs.json'],
    'signup': ['metadata.json', 'header.json', 'emails.json',
               'accounts_responses.json', 'accounts.json', 'basic_configs.json'],
    'home': ['metadata.json', 'settings.json', 'customize.json', 'materials.json',
             'header.json', 'basic_configs.json', 'basic_configs_responses.json',
             'materials_responses.json'],
    'interviews': ['metadata.json', 'header.json', 'basic_configs.json',
                   'interviews_responses.json', 'interviews.json'],
}


def load_locale(page):
    merged = {}
    for name in PAGE_LOCALES[page]:
        merged.update(json.loads((LOCALES / name).read_text()))
    for path in COMMON_LOCALES:
        merged.update(json.loads(path.read_text()))
    return merged


def locale_get(merged, key, lang=LANG):
    entry = merged.get(key)
    if isinstance(entry, dict):
        return entry.get(lang, entry.get('en', f'<{key}>'))
    return f'<{key}>'


def metadata_of(merged, key, lang=LANG):
    fallback = {'title': f'preview:{key}', 'description': '', 'keywords': '', 'link': '', 'image': ''}
    entry = merged.get(key, {})
    return {**fallback, **entry.get(lang, entry.get('en', {}))}


def header_titles(merged):
    keys = ['header_create_button_title', 'header_meetings_menu_title', 'header_create_menu_title',
            'header_knowledge_menu_title', 'header_settings_menu_title', 'header_customize_menu_title',
            'header_interviews_menu_title', 'header_logout_menu_title']
    return {key: locale_get(merged, key) for key in keys}


def fixture(name):
    return json.loads((HERE / 'fixtures' / name).read_text())


@app.get('/')
def index():
    links = [
        ('/v1/en/signin', 'サインイン'),
        ('/v1/en/signup', 'サインアップ'),
        ('/v1/en/home', 'Material 登録・一覧+Billing/Settings(materials.html)'),
        ('/v1/en/interviews', 'Interview 管理'),
    ]
    items = ''.join(f'<li><a href="{href}">{href}</a> — {label}</li>' for href, label in links)
    return f'<h1>simplicity site fixture (ST-2)</h1><ul>{items}</ul>'


@app.get('/v1/<lang>/signin')
def signin(lang):
    merged = load_locale('signin')
    return render_template(
        'main/signin.html', lang=LANG, lang_name=LANG_NAME,
        locale_json=json.dumps(merged),
        redirect_url=f'/v1/{LANG}/home',
        metadata=metadata_of(merged, 'metadata_signin'))


@app.get('/v1/<lang>/signup')
def signup(lang):
    merged = load_locale('signup')
    return render_template(
        'main/signup.html', lang=LANG, lang_name=LANG_NAME,
        locale_json=json.dumps(merged),
        metadata=metadata_of(merged, 'metadata_signup'),
        **PRICING)


@app.get('/v1/<lang>/home')
def home(lang):
    merged = load_locale('home')
    return render_template(
        'main/materials.html', lang=LANG, lang_name=LANG_NAME,
        locale_json=json.dumps(merged),
        metadata=metadata_of(merged, 'metadata_home'),
        **PRICING, **header_titles(merged))


@app.get('/v1/<lang>/interviews')
def interviews(lang):
    merged = load_locale('interviews')
    return render_template(
        'main/interviews.html', lang=LANG, lang_name=LANG_NAME,
        locale_json=json.dumps(merged),
        metadata=metadata_of(merged, 'metadata_home'),
        **PRICING, **header_titles(merged))


# ---- 固定データ API(実レスポンス外形: data をトップレベル展開+code/message) ----

@app.get('/v1/<lang>/materials/list')
def materials_list(lang):
    return jsonify({**fixture('materials_list.json'), 'code': 200, 'message': 'preview fixture'})


@app.get('/v1/<lang>/interviews/list')
def interviews_list(lang):
    return jsonify({**fixture('interviews_list.json'), 'code': 200, 'message': 'preview fixture'})


@app.get('/v1/<lang>/user')
def user(lang):
    return jsonify({**fixture('user.json'), 'code': 200, 'message': 'preview fixture'})


@app.get('/v1/<lang>/basic_config')
def basic_config(lang):
    return jsonify({**fixture('basic_config.json'), 'code': 200, 'message': 'preview fixture'})


@app.get('/v1/<lang>/payments/method/status')
def payments_method_status(lang):
    return jsonify({**fixture('payments_method_status.json'), 'code': 200, 'message': 'preview fixture'})


@app.route('/v1/<path:rest>', methods=['GET', 'POST'])
def api_stub(rest):
    print(f'[stub] unmatched API: /v1/{rest}')
    return jsonify({'code': 200, 'message': f'preview stub: /v1/{rest}'})


# ---- 静的資産 ----

@app.get('/js/simplicity/dist/<path:filename>')
def simplicity_dist(filename):
    return send_from_directory(SIMPLICITY_ROOT / 'dist', filename)


@app.get('/node_modules/js-cookie/dist/<path:filename>')
def js_cookie(filename):
    return send_from_directory(SIMPLICITY_ROOT / 'node_modules' / 'js-cookie' / 'dist', filename)


@app.get('/js/<path:filename>')
def static_js(filename):
    return send_from_directory(HERE / 'static' / 'js', filename)


@app.get('/css/<path:filename>')
def static_css(filename):
    return send_from_directory(HERE / 'static' / 'css', filename)


@app.get('/img/<path:filename>')
def static_img(filename):
    return send_from_directory(HERE / 'static' / 'img', filename)


@app.get('/stubs/<path:filename>')
def stubs(filename):
    return send_from_directory(HERE / 'stubs', filename)


@app.get('/favicon.ico')
def favicon():
    return ('', 204)


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8500, debug=False)
