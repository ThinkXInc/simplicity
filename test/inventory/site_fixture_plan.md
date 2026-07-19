# Site fixture selection and extraction draft (ST-0)

Source: `quantz-web origin/master` at
`99a9488714b94e227ecec54340df031419c5d1e2` (read only).

Frozen owner decisions from `style_plan.md` §7:

- Class prefix: `sim-`.
- Consumer verification: vendored site fixture plus migration kit; do not create or modify a
  quantz-web branch. Real adoption remains ST-R.

## Selection

| Page | Disposition | Simplicity coverage | Fixed-fixture approach |
|---|---|---|---|
| `templates/main/signin.html` | site fixture | TextField, LoadButton, alert states | Empty/default form; stub Google OAuth and submit |
| `templates/main/signup.html` | site fixture | TextField, DropdownButton, LoadButton, validation | Fixed locale/country data; stub Stripe and Google OAuth |
| `templates/main/materials.html` | site fixture | TableView, ModalView, material field subclasses | Fixed material list with empty/populated rows; no API calls |
| `templates/main/interviews.html` | site fixture | list/settings/link/create/results views | Fixed interview summaries and disabled network actions |
| `templates/main/test_load_message.html` | site fixture | LoadingMessage states | Render idle/loading/error/success fixtures directly |
| `templates/main/create.html` | gallery | Program/customize controls, but also the full web-client audio/button stack | Cover its simplicity components in gallery; page startup is not minimal |
| `templates/main/studio.html` | gallery | Superset of materials and create | Covered by materials fixture plus component gallery |
| `templates/main/interview.html` | gallery | TextField and chat controls, but requires Three.js/media/session behavior | Cover form/chat components in gallery |
| `templates/interview_top.html` | gallery | TextField demo and state classes, but large video/image/locale closure | Cover demo controls in gallery; retain dependency lines in class ledger |

The site fixture set contains five pages. Pages sent to the gallery are retained in the dependency
ledger and are not silently treated as covered by the site fixture.

## Shared extraction closure

Templates:

- `web-server/views/templates/general/base.html`
- `web-server/views/templates/general/common.html`
- `web-server/views/templates/common/vertical_header.html`
- `web-server/views/templates/common/header.html`
- `web-server/views/templates/common/footer.html`
- The five selected page templates listed above

JavaScript shared inputs:

- `web-server/views/src/js/data/enums.js`
- `web-server/views/src/js/models/session_model.js`
- `web-server/views/src/js/models/user.js`
- `web-server/views/src/js/helpers/googleoauth.js` (fixture replaces external calls with a stub)
- `web-server/views/src/js/view_components/studio_header.js`
- `web-server/views/src/js/view_components/material_*.js`
- `web-server/views/src/js/view_components/interview_*.js`
- `web-server/views/src/js/view_components/{card_input,email_form,origin_form}.js`
- `web-server/views/src/js/view_controllers/{signin,signup,materials,material_create_view_controller,interview_home_view_controller}.js`
- `web-server/views/src/js/pages/material_create_page.js`

LESS shared inputs:

- `web-server/views/src/less/general/{colorscheme,mixin,reset,effects}.less`
- `web-server/views/src/less/common/{common,header,footer}.less`
- `web-server/views/src/less/views/{accounts,materials,interviews_home}.less`
- `web-server/views/src/less/views/material_*.less`
- `web-server/views/src/less/views/interview_{create,link,results,settings}_view.less`
- `web-server/views/src/less/main.less` as the source import manifest; the fixture build must replace
  imports outside this closure rather than copying the entire application tree.

Static assets to resolve during ST-2 extraction:

- Assets referenced by the selected templates and the LESS files above under
  `web-server/views/{img,fonts}`.
- Replace remote Google/Stripe/Quantz Button resources with deterministic local stubs or inert
  placeholders. Do not download remote assets into the fixture.

## ST-2 closure checks

1. Record every copied file and its source SHA in `preview/site/MANIFEST.md`.
2. Scan Jinja `extends`/`include`, script/link URLs, LESS imports and local `url(...)` references;
   every local target must either exist in the fixture or appear in a documented stub list.
3. Flask must import none of MongoDB, Redis, Celery, vector DB, LLM or quantz-web application startup.
4. Rendering all five URLs must make no outbound request and must not modify quantz-web.
