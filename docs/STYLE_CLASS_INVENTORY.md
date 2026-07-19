# docs/STYLE_CLASS_INVENTORY.md

SimplicityのCSSクラス移行台帳について、対象範囲と後続作業での扱いを定める。

## 台帳

- `style_class_inventory/simplicity_legacy_css_classes.txt` — Simplicityが現在所有する旧CSSクラス名の全量一覧。
- `style_class_inventory/quantz_web_css_class_dependency_candidates.txt` — quantz-web内で旧クラス名が現れる依存候補一覧。

Simplicity側の台帳は、LESSのセレクタとJavaScriptが静的に生成・操作・検索するクラス文字列から作る。
利用者が渡すIDやデータから動的に作られるクラスは含めない。

## quantz-web側が「依存候補」である理由

`TextField`や`inputOuter`はSimplicity固有と判断しやすい。一方、`title`、`left`、`active`、
`show`のような一般名は、Simplicity内部とquantz-web独自UIの両方で使われうる。

ST-0では、同名の無関係な利用を含む可能性があっても候補から削らない。fixtureへ実際のDOM構造を
抽出する前に候補を削ると、Simplicity内部の依存を見落とすためである。したがって候補台帳の全行を
確定依存、または無条件の置換対象として扱ってはならない。

## 後続作業での扱い

- `rename_map.json`はSimplicity側の旧クラス台帳から作る。
- quantz-web側では、対象要素がSimplicityの生成するDOM部分木またはAPI契約に属するか確認してから置換する。
- quantz-web独自UIの同名クラスは変更しない。
- 判定できない候補はST-Rまで保持する。除外するときは理由を記録する。
- migration kitはクラスを扱う文脈だけを対象にし、無制限な全文字列置換を行わない。
- migration kitにはdry-runを用意する。

## 凍結した入力

- Simplicity: `d3abadc24bbedaf4a0f0182b8348be6f4a986dc2`
- quantz-web: `99a9488714b94e227ecec54340df031419c5d1e2`

スタイル名前空間は小文字`spl-`を使用する。CSS custom propertiesは`--spl-*`、テーマ属性は
`data-spl-theme`とする。
