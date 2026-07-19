'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'preview', 'gallery.html'), 'utf8')
    .replace(/<script[\s\S]*?<\/script>/g, '');
const fixtures = fs.readFileSync(path.join(root, 'preview', 'fixtures.js'), 'utf8');
const bundle = fs.readFileSync(path.join(root, 'dist', 'simplicity.js'), 'utf8');
const required = [
  'LoadingMessage', 'Notification', 'Mesh', 'LoadButton', 'ColorPicker',
  'TermsScrollView', 'VerifyCodeForm', 'RadioButton', 'PageView', 'Page',
  'LastNameFirstNamePage', 'SingleTextInputPage', 'Title', 'Button',
  'NextButton', 'BackButton', 'TextField', 'TableView', 'ModalView',
  'KeywordsField', 'DropdownButton', 'FileUploadView', 'FileUploadTableViewCell',
  'GradientLoadingBar', 'GradientViewLoader', 'PositionMap', 'MapPointer',
  'AlertMessage', 'Draggable', 'InputPageViewController'
];

const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'http://127.0.0.1:8000/preview/gallery.html'
});
dom.window.console = { log() {}, warn() {}, error() {}, warning() {} };
dom.window.eval([
    'window.google = { maps: { OverlayView: class {} } };',
    bundle,
    fixtures
].join('\n'));

const rendered = new Set(
    [...dom.window.document.querySelectorAll('[data-gallery-component]')]
        .flatMap(element => element.dataset.galleryComponent.split(/ +/))
);
const missing = required.filter(name => !rendered.has(name));
if (missing.length) {
    console.error(`Gallery coverage missing: ${missing.join(', ')}`);
    process.exit(1);
}

if (!dom.window.document.querySelector('#gallery-page-view')) {
    console.error('Gallery PageView was not mounted');
    process.exit(1);
}

console.log(`Gallery initialization and coverage: ${required.length}/${required.length}`);
