'use strict';
// preview/fixtures.js — コンポーネントギャラリーの構築(ST-1)。
// 各カードは原則として実コンポーネントを実API(quantz-web の実利用形 / HEAD シグネチャ)で
// 構築する。構築不能な対象はプレースホルダとし、理由を findings.md に記録する。

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
  else if (typeof content === 'string') section.insertAdjacentHTML('beforeend', content);
  parent.appendChild(section);
  return section;
};

// 構築不能・実利用なしの対象。プレースホルダである事実と理由をカード上にも明示する。
const placeholderCard = (parent, name, reason) => {
  const section = card(parent, name, '');
  section.classList.add('galleryPlaceholder');
  const note = document.createElement('p');
  note.className = 'galleryPlaceholderNote';
  note.textContent = `プレースホルダ: ${reason}`;
  section.appendChild(note);
  return section;
};

// ---- 基本表示・操作 --------------------------------------------------------

const basic = document.getElementById('basic-components');

card(basic, 'Title', new Title('gallery-title', new TitleConfig({ text: 'Section title' })).$view);
card(basic, 'Button', new Button('gallery-button', new ButtonConfig({ text: 'Primary action' })).$view);
// NextButton/BackButton: 文字列 config は quantz-web が消費する Page 系の実呼び形。
card(basic, 'NextButton', new NextButton('gallery-next', 'Next').$view);
card(basic, 'BackButton', new BackButton('gallery-back', 'Back').$view);

const loadButton = new LoadButton({
  id: 'gallery-load-button',
  labelText: 'Load more',
  loaderSrc: '/img/button-loader.svg'
});
card(basic, 'LoadButton', loadButton.$view);

card(basic, 'ColorPicker', new ColorPicker({ id: 'gallery-color-picker', defaultColor: '#3979aa' }).$view);

// TermsScrollView は templateUrl を fetch する実装。ギャラリー同梱の固定 fixture を読む。
const termsScrollView = new TermsScrollView({ id: 'gallery-terms', templateUrl: './terms_fixture.html' });
card(basic, 'TermsScrollView', termsScrollView.$view);

// ---- 入力・選択 ------------------------------------------------------------

const forms = document.getElementById('form-components');

const textField = new TextField({
  id: 'gallery-text',
  fieldName: 'name',
  title: 'Name',
  placeholder: 'Simplicity',
  defaultValue: 'Example',
  shouldTrackLocalChangeInCookie: false,
  isDefaultValueRestoredFromCookie: false,
  cookieExclude: true
});
card(forms, 'TextField', textField.$view);

const keywordsField = new KeywordsField({
  id: 'gallery-keywords',
  fieldName: 'keywords',
  maxTextLength: 100,
  title: 'Keywords',
  placeholder: 'keyword',
  pressText: 'press',
  enterText: 'Enter ↵'
});
card(forms, 'KeywordsField', keywordsField.$view);

const radioButton = new RadioButton({
  id: 'gallery-radio',
  fieldName: 'button_type',
  hasTitle: true,
  title: 'Button type',
  defaultValue: 'Default',
  items: [
    new RadioButtonItem({ value: 'Default', name: 'Selected' }),
    new RadioButtonItem({ value: 'Custom', name: 'Unselected' })
  ]
});
card(forms, 'RadioButton', radioButton.$view);

const verifyCodeForm = new VerifyCodeForm({
  id: 'gallery-verify-code',
  errorMessageUnfilled: 'Please enter all digits.',
  inputCompleteEventName: 'verificationInputComplete'
});
card(forms, 'VerifyCodeForm', verifyCodeForm.$view);

// ---- Page / PageView / input controllers ----------------------------------

const pageHost = document.getElementById('page-components');

// PageView(実API): 3ページを実際に切り替える。
const pageView = new PageView({ id: 'gallery-page-view', numPages: 3 });
pageView.mount(pageHost);
['Name input', 'Confirmation', 'Completed'].forEach((label, index) => {
  const page = document.createElement('div');
  page.className = 'fixturePage';
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

// InputPageViewController + Page(実API): Page を直接組み立てて実コントローラで前後遷移する。
// SingleTextInputPage / LastNameFirstNamePage は現 HEAD では構築不能のため使わない(findings)。
const ipvcPages = [
  new Page({
    id: 'galleryIpvcPage1',
    components: [
      new Title('galleryIpvcPage1__Title', new TitleConfig({ text: 'Your name' })),
      new TextField({
        id: 'galleryIpvcPage1__TextField__first_name',
        fieldName: 'first_name',
        title: 'First name',
        placeholder: 'Taro',
        shouldTrackLocalChangeInCookie: false,
        isDefaultValueRestoredFromCookie: false,
        cookieExclude: true
      }),
      new NextButton('galleryIpvcPage1__NextButton', 'Next')
    ]
  }),
  new Page({
    id: 'galleryIpvcPage2',
    components: [
      new Title('galleryIpvcPage2__Title', new TitleConfig({ text: 'Your email' })),
      new TextField({
        id: 'galleryIpvcPage2__TextField__email',
        fieldName: 'email',
        title: 'Email',
        placeholder: 'taro@example.com',
        shouldTrackLocalChangeInCookie: false,
        isDefaultValueRestoredFromCookie: false,
        cookieExclude: true
      }),
      new BackButton('galleryIpvcPage2__BackButton', 'Back'),
      new NextButton('galleryIpvcPage2__NextButton', 'Next')
    ]
  })
];
const inputPageViewController = new InputPageViewController({
  id: 'galleryInputPageController',
  pages: ipvcPages
});
document.getElementById('galleryInputPageController').dataset.galleryComponent = 'InputPageViewController';
ipvcPages.forEach(page => { page.$view.dataset.galleryComponent = 'Page'; });

const ipvcNote = document.getElementById('ipvc-placeholders');
placeholderCard(ipvcNote, 'SingleTextInputPage',
  '現HEADでは構築不能(内部で Title に文字列 config を渡し throw。findings 参照)');
placeholderCard(ipvcNote, 'LastNameFirstNamePage',
  '現HEADでは構築不能(SingleTextInputPage と同因。findings 参照)');

// ---- Table・Dropdown・Modal ------------------------------------------------

const collections = document.getElementById('collection-components');

const tableView = new TableView({ id: 'gallery-table-view' });
card(collections, 'TableView', tableView.$view);
tableView.contents = [
  new TableViewCellContent({ title: 'Document A', text: 'Ready', label: 'doc' }),
  new TableViewCellContent({ title: 'Document B', text: 'Processing', label: 'doc' })
];

const dropdownButton = new DropdownButton({
  id: 'gallery-dropdown',
  fieldName: 'model',
  title: 'Default model',
  description: 'Select model',
  type: DropdownMenuType.list,
  position: DropdownMenuDisplayPositionType.bottomover,
  htmlTag: 'div',
  items: [
    new ListItem({ title: 'Default model', value: 'default' }),
    new ListItem({ title: 'Alternative model', value: 'alt' })
  ]
});
card(collections, 'DropdownButton', dropdownButton.$view);

// ModalView は表示すると全面オーバーレイになるため、既定は閉状態+開くボタンを置く。
const modalCard = card(collections, 'ModalView', '');
const modalView = new ModalView({
  id: 'gallery-modal',
  title: 'Modal title',
  text: '確認メッセージ',
  cancelButtonText: 'Cancel',
  doneButtonText: 'Confirm'
});
modalView.mount(modalCard);
const modalOpenButton = document.createElement('button');
modalOpenButton.type = 'button';
modalOpenButton.textContent = 'Show modal';
modalOpenButton.addEventListener('click', () => modalView.show());
modalCard.appendChild(modalOpenButton);

// ---- File upload states ----------------------------------------------------

const uploads = document.getElementById('upload-components');

placeholderCard(uploads, 'FileUploadView',
  '現HEADでは構築不能(constructor が ViewComponentBase に旧シグネチャ super(id, "div") を渡し throw。findings 参照)');

// FileUploadTableViewCell: <ul class=fileUploadTableViewCell id={tableViewId}> が前提(classdesc)。
// 状態は実 API(content / state setter)で 待機・アップロード中・完了 を表現する。
// 「失敗」状態はセルの公開 API に存在しない(findings 記録)。
card(uploads, 'FileUploadTableViewCell', '<ul id="gallery-upload-cells" class="fileUploadTableViewCell"></ul>');
[['ready.pdf', '0%'], ['uploading.pdf', '58%'], ['complete.pdf', '100%']].forEach(([name, state], index) => {
  const cell = new FileUploadTableViewCell('gallery-upload-cells', index);
  cell.content = name;
  cell.state = state;
});

// ---- Loading・notification・alert ------------------------------------------

const feedback = document.getElementById('feedback-components');

const loadingMessage = new LoadingMessage({
  id: 'gallery-loading-message',
  pattern: LoadingMessagePattern.B,
  textAlign: LoadingMessageTextAlign.center,
  minimumWaitTimeMs: 0
});
card(feedback, 'LoadingMessage', loadingMessage.$view);
loadingMessage.load(true);

const notificationCard = card(feedback, 'Notification', '');
const notification = new Notification({ id: 'gallery-notification', position: NotificationPosition.topCenter });
notification.mount(notificationCard);
notification.show({
  message: '保存しました',
  type: NotificationType.info,
  animationType: NotificationAnimationType.fadeIn,
  duration: NotificationDuration.forever
});

const alertCard = card(feedback, 'AlertMessage', '');
const alertMessage = new AlertMessage('gallery-alert');
alertMessage.addTo(alertCard);
alertMessage.show('入力内容を確認してください');

const meshCard = card(feedback, 'Mesh', '<div class="galleryMeshStage"></div>');
const mesh = new Mesh({ id: 'gallery-mesh', n: 6, m: 6, lineColor: '#888', lineWidth: 0.1 });
mesh.mount({ $parent: meshCard.querySelector('.galleryMeshStage') });

const gradientLoadingBar = new GradientLoadingBar({ id: 'gallery-gradient-bar' });
card(feedback, 'GradientLoadingBar', gradientLoadingBar.$view);
gradientLoadingBar.startLoading();

const gradientViewLoader = new GradientViewLoader({
  id: 'gallery-gradient-view-loader',
  numIndicator: 3,
  indicatorWidth: 220,
  individualHeight: 3,
  spaceBetween: 5,
  alignment: IndicatorAlignment.center,
  initialBaseColor: [80, 80, 80],
  animationDelay: 5,
  initialX1: -50,
  defaultShift: 10,
  shiftAmount: -20,
  rx: 2,
  ry: 2
});
const gvlCard = card(feedback, 'GradientViewLoader', '');
gradientViewLoader.mount(gvlCard);
gradientViewLoader.startLoading();

// ---- Position・drag --------------------------------------------------------

const positions = document.getElementById('position-components');
placeholderCard(positions, 'PositionMap',
  'quantz-web アプリコードに実利用なし+既知破損(F-1/F-2/F-11)のため実構築しない');
placeholderCard(positions, 'MapPointer',
  'dist に不在(F-1/F-3)のため構築不能');
const dragCard = card(positions, 'Draggable', '<div class="dragArea"><div class="dragHandle">Drag me</div></div>');
new Draggable({ element: dragCard.querySelector('.dragHandle'), initX: 25, initY: 55 });

window.galleryComponentNames = galleryComponentNames;
