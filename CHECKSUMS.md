# dist/simplicity.js チェックサム台帳

各行は `<項目ID>  <sha256>  dist/simplicity.js` の形式。
「dist sha 一致」とは、その項目の完了時点でこの台帳の直近行と一致することを意味する。
dist はビルド生成物(`.gitignore` 済み)であり、検証は `npx gulp scripts` でビルド後に
`shasum -a 256 dist/simplicity.js` で行う。

BASELINE  7008d1ad9c9b3c8b3d40e11b5fc4d7debe8e949c9dfa9af24b93f9c229d9c7f6  dist/simplicity.js  (項目0-1時点)
R-06      d17dfaac3e15c51a4f350f0a0a84a16b5c86776ddf3a1144566d99328d05c4f6  dist/simplicity.js  (デッドクラス InputPageViewControllerConfig 削除)
