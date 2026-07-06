# simplicity 開発規約

## 設計原則(変更禁止)
- 本フレームワークは意図的に concat + グローバル名前空間で設計されている。
  src 配下に import / export / require を書いてはならない(eslint が構文エラーにする)。
- 各ファイルのトップレベル class/function/const はグローバル名前空間を共有する。
  ファイル間の依存は gulpfile.js の jsFiles 配列の「順序」で解決される。

## 新規ファイルを追加するとき(必須手順)
1. src 配下に snake_case で作成する(クラス名は PascalCase)。
2. gulpfile.js の paths.jsFiles に、依存するファイルより「後」の位置に追記する。
   追記しない限り dist に入らない。npm run check:manifest が検出する。
3. npm run lint && npm run typecheck && npm test && npx gulp scripts を全て通す。

## 外部供給グローバル(バンドル外・types/globals.d.ts が正)
- Cookies(js-cookie)、google(Google Maps JS API)。
- 新しい外部グローバルへの依存を追加する場合は globals.d.ts と
  eslint.config.js に宣言を追加すること。宣言なき依存は lint が落とす。

## 検証コマンド
- ビルド: npx gulp scripts(dist/simplicity.js が唯一の成果物)
- テスト: npm test(jsdom 特性テスト。ゴールデンは test/golden/)
- lint: npm run lint / 型: npm run typecheck / マニフェスト: npm run check:manifest

## 禁止事項
- dist/ の手編集。
- attic/ のファイルを無断で src に戻すこと。
- 挙動変更を伴う「ついで修正」。バグを見つけたら findings.md に記録する。
- 新規コードでの console.log(debuglog を使う)、var、緩い ==。
- devDependencies の無断アップグレード(exact ピン。特に typescript は
  6.x に固定。7.x への昇格は JS 型検査面の変更を伴うため意図的に行う)。
- JSDoc 型付け・checkJs:true 化・.ts 化(任意の「天井」。導入は別計画で)。
