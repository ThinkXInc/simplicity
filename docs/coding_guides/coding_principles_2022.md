原則
・1枚のHTMLファイルの分量はUI要素の抽象化(view component化)により小さく抑える．階層を極力浅くすることで可読性，メンテナンス性を高める
・UI要素(view component)は基本的にJavaScriptクラスで表現する．componentに必要なHTMLテンプレートはHTMLファイルでなくクラスが保持する．
・view componentには自身に関わる操作だけが書かれ，複数のview componentとの相互作用は外部のViewControllerに相当するクラスに記述される．
・1つのViewControllerクラスは1つの画面に対応する．
・サーバーから返されるjsonデータは同じ構造体をもつDataModelクラスに一度変換され，window.Data変数に保持される．
・すべてのDataModelクラスはjsonに逆変換するメソッドをもつ．
・アプリケーション全体は，同期的なページ遷移と非同期的な遷移の場所をどちらも持つ．ヘッダを共有する画面同士は原則的に非同期で中身を書き換える．この管理はpage_control.jsで行う．
・原則的に1つの画面状態に対し1つのURIが割当てられる．

### Principles
- Keep the volume of a single HTML file small by abstracting UI elements (view component).   
Keep the hierarchy as shallow as possible to improve readability and maintainability.
- A UI element (view component) is basically represented by a JavaScript class,   
and the HTML template required for the component is maintained in the class rather than in the HTML file.
- Only operations related to the view component itself are written in the view component.   
Interactions with multiple view components are written in a class corresponding to an external ViewController.
- A single ViewController class corresponds to a single screen.
- The json data returned from the server is converted once to a DataModel class that has the same structure,   
and is stored in the window.Data variable.
- All DataModel classes have a method for reverse conversion to json.
- The entire application has both synchronous page transitions and asynchronous transition locations.   
The entire application has both synchronous and asynchronous page transitions.   
In principle, screens that share headers rewrite their contents asynchronously. This management is done in page_control.js.
- In principle, one URI is assigned to one screen state.


Coding Guide
・keep it simple.
・always use `'use strict'`. (it's safer.)
・use `const` if possible. (it's faster.)
・if unique, use `id` but class as much as possible. (it's faster.)
・`querySelector` is normally used to select DOM in any time. (for consistency)
・string quotation `""`  or `''` is not necessary for DOM values. eg. `id=cat`

Google JavaScript Style Guide
https://google.github.io/styleguide/jsguide.html
https://cou929.nu/data/google_javascript_style_guide/#id56 (日本語訳)

DOM
https://dom.spec.whatwg.org/
https://triple-underscore.github.io/DOM4-ja.html (日本語訳)

*you would make sure the standard DOM tree and the event system essentially equal to the modern paradigm as React/Flutter, when it was written declaratively, but more flexible !.

```js
obj.addEventListener("cat", function(e) { process(e.detail) })

var event = new CustomEvent("cat", {"detail":{"hazcheeseburger":true}})
obj.dispatchEvent(event)

if(obj.dispatchEvent(event)) {
   …
}
```

Live DOM Viewer
https://software.hixie.ch/utilities/js/live-dom-viewer/




---
jquery -> ECMAScript
https://qiita.com/ichimonji_haji/items/e89013843a23b5446f14