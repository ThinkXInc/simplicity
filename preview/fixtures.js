'use strict';

const galleryComponentNames = [
  'LoadingMessage', 'Notification', 'Mesh', 'LoadButton', 'ColorPicker',
  'TermsScrollView', 'VerifyCodeForm', 'RadioButton', 'PageView', 'Page',
  'LastNameFirstNamePage', 'SingleTextInputPage', 'Title', 'Button',
  'NextButton', 'BackButton', 'TextField', 'TableView', 'ModalView',
  'KeywordsField', 'DropdownButton', 'FileUploadView', 'FileUploadTableViewCell',
  'GradientLoadingBar', 'GradientViewLoader', 'PositionMap', 'MapPointer',
  'AlertMessage', 'Draggable', 'InputPageViewController'
];

const card = (parent, name, content) => {
  const section = document.createElement('article');
  section.className = 'galleryCard';
  section.dataset.galleryComponent = name;
  const heading = document.createElement('h3');
  heading.textContent = name;
  section.appendChild(heading);
  if (content instanceof Node) section.appendChild(content);
  else section.insertAdjacentHTML('beforeend', content);
  parent.appendChild(section);
  return section;
};

const basic = document.getElementById('basic-components');
const mountLeaf = (name, instance) => {
  card(basic, name, instance.$view);
};

mountLeaf('Title', new Title('gallery-title', new TitleConfig({ text: 'Section title' })));
mountLeaf('Button', new Button('gallery-button', new ButtonConfig({ text: 'Primary action' })));
mountLeaf('NextButton', new NextButton('gallery-next', new NextButtonConfig({ text: 'Next' })));
mountLeaf('BackButton', new BackButton('gallery-back', new BackButtonConfig({ text: 'Back' })));
card(basic, 'LoadButton', '<button class="loadButton">Load more</button>');
card(basic, 'ColorPicker', '<input class="colorPicker" type="color" value="#3979aa">');
card(basic, 'TermsScrollView', '<div class="termsScrollView" style="max-height:100px;overflow:auto"><p>利用規約fixture。スクロール領域の末尾まで確認する。</p><p>固定テキスト2</p><p>固定テキスト3</p></div>');

const forms = document.getElementById('form-components');
const textField = new TextField({ id: 'gallery-text', fieldName: 'name', title: 'Name', placeholder: 'Simplicity', defaultValue: 'Example', shouldTrackLocalChangeInCookie: false });
card(forms, 'TextField', textField.$textField);
card(forms, 'KeywordsField', '<div class="keywordsField"><span class="keyword">design ×</span><span class="keyword">research ×</span><input placeholder="keyword"></div>');
card(forms, 'RadioButton', '<label class="radioButton"><input type="radio" checked> Selected</label><br><label class="radioButton"><input type="radio"> Unselected</label>');
card(forms, 'VerifyCodeForm', '<div class="verifyCodeForm"><input inputmode="numeric" value="123456"><button>Verify</button></div>');

const pageHost = document.getElementById('page-components');
const pageView = new PageView({ id: 'gallery-page-view', numPages: 3 });
pageView.mount(pageHost);
['Name input', 'Confirmation', 'Completed'].forEach((label, index) => {
  const page = document.createElement('div');
  page.className = 'fixturePage';
  page.dataset.galleryComponent = index === 0 ? 'Page LastNameFirstNamePage SingleTextInputPage InputPageViewController' : 'Page';
  page.innerHTML = `<h3>Page ${index + 1}</h3><p>${label}</p>`;
  pageView.appendChild(page, index);
});
pageView.$view.dataset.galleryComponent = 'PageView';
const pageActions = document.createElement('div');
pageActions.className = 'galleryActions';
pageActions.innerHTML = '<button type="button" id="gallery-prev">前へ</button><button type="button" id="gallery-next-page">次へ</button><button type="button" id="gallery-all-pages">全ページ表示</button>';
pageHost.appendChild(pageActions);
document.getElementById('gallery-prev').addEventListener('click', () => pageView.prev());
document.getElementById('gallery-next-page').addEventListener('click', () => pageView.next());
document.getElementById('gallery-all-pages').addEventListener('click', () => pageView.showAll());

const collections = document.getElementById('collection-components');
card(collections, 'TableView', '<table class="tableView"><thead><tr><th>Name</th><th>Status</th></tr></thead><tbody><tr><td>Document A</td><td>Ready</td></tr><tr><td>Document B</td><td>Processing</td></tr></tbody></table>');
card(collections, 'DropdownButton', '<details class="dropdownButton" open><summary>Actions</summary><ul><li>Open</li><li>Duplicate</li><li>Delete</li></ul></details>');
card(collections, 'ModalView', '<div class="fixtureModal"><strong>Modal title</strong><p>確認メッセージ</p><button>Confirm</button></div>');

const uploads = document.getElementById('upload-components');
const uploadFixture = (name, percent, state, error = false) => `<div class="fixtureUpload ${error ? 'fixtureError' : ''}"><span>📄</span><div><strong>${name}</strong><div class="fixtureProgress"><span style="width:${percent}%"></span></div></div><span>${state}</span></div>`;
card(uploads, 'FileUploadView', uploadFixture('ready.pdf', 0, 'Ready') + uploadFixture('uploading.pdf', 58, '58%') + uploadFixture('complete.pdf', 100, 'Complete') + uploadFixture('failed.pdf', 74, 'Failed', true));
card(uploads, 'FileUploadTableViewCell', uploadFixture('table-cell.pdf', 32, '32%'));

const feedback = document.getElementById('feedback-components');
card(feedback, 'LoadingMessage', '<div class="loadingMessage">Loading…</div>');
card(feedback, 'Notification', '<div class="notification">保存しました</div>');
card(feedback, 'AlertMessage', '<div class="alertMessage">入力内容を確認してください</div>');
card(feedback, 'Mesh', '<div class="mesh" style="height:70px">Overlay mesh</div>');
card(feedback, 'GradientLoadingBar', '<div class="gradientLoadingBar" style="height:8px"></div>');
card(feedback, 'GradientViewLoader', '<div class="gradientViewLoader" style="height:70px">Loading view</div>');

const positions = document.getElementById('position-components');
card(positions, 'PositionMap', '<div class="fixtureMap"><span class="fixturePin">📍</span><span class="fixtureStatus">PositionMap fixture</span></div>');
card(positions, 'MapPointer', '<div class="fixtureMap"><span class="fixturePin">◎</span><span class="fixtureStatus">MapPointer fixture</span></div>');
const dragCard = card(positions, 'Draggable', '<div class="dragArea"><div class="dragHandle">Drag me</div></div>');
new Draggable({ element: dragCard.querySelector('.dragHandle'), initX: 25, initY: 55 });

window.galleryComponentNames = galleryComponentNames;
