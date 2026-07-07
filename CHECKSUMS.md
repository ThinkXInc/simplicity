# dist/simplicity.js チェックサム台帳

各行は `<項目ID>  <sha256>  dist/simplicity.js` の形式。
「dist sha 一致」とは、その項目の完了時点でこの台帳の直近行と一致することを意味する。
dist はビルド生成物(`.gitignore` 済み)であり、検証は `npx gulp scripts` でビルド後に
`shasum -a 256 dist/simplicity.js` で行う。

BASELINE  7008d1ad9c9b3c8b3d40e11b5fc4d7debe8e949c9dfa9af24b93f9c229d9c7f6  dist/simplicity.js  (項目0-1時点)
R-06      d17dfaac3e15c51a4f350f0a0a84a16b5c86776ddf3a1144566d99328d05c4f6  dist/simplicity.js  (デッドクラス InputPageViewControllerConfig 削除)
P3-S1     512a195b7dec1087b7977a43f39daacd6d6118b8186145542b332f09b1888bfa  dist/simplicity.js  (Browswer -> Browser typo 修正・F-7)
P3-S2     d81fe6d83d874319c6caefcd2b6ecd859089620c4de52a72906effa9625aeb28  dist/simplicity.js  (postal case 追加 / maxLength null ガード / passwordFormat 重複行削除・T-06)
P3-S3     9aef9307c415938989f9f6a5238b6f9616666195ed02bbb645d79165f3c32d33  dist/simplicity.js  (エラー経路のスコープ外変数 parentId 除去→$parent・F-9)
P3-S4     38747426622bcb3ebb4d8bff4a02c15f70955ca94e029aa521219d15d36a7297  dist/simplicity.js  (switch state→showingstate/uploadstate / currentCell を const 宣言・F-10)
P3-S6     8ad38ef902bb9264c99e431851d418bdeae5fcf89be688c827df8e3a7856d10e  dist/simplicity.js  (非行頭トップレベル class 宣言6件を column 0 へ正規化・F-8・空白のみ / gen_globals 出力不変)
