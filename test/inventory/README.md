# ST-0 inventory rationale and handoff rules

This directory is the frozen input to the style-prefix migration. Read this file before ST-4,
ST-5, ST-6, ST-7 or any regeneration of `rename_map.json`.

## Why the quantz-web ledger is conservative

`classes_legacy.txt` contains simplicity-owned selector names and static class strings. Some names
are distinctive (`TextField`, `inputOuter`), while others are generic (`title`, `left`, `active`,
`show`). `quantz_web_class_dependencies.txt` searches class-bearing contexts in quantz-web for all
of them. A hit such as `class="title"` can therefore be either:

1. a real dependency on a simplicity-generated DOM structure; or
2. an unrelated quantz-web class with the same spelling.

ST-0 deliberately keeps both. Removing ambiguous hits before the relevant DOM/component context is
available risks a false negative, which would leave an old class behind when quantz-web eventually
adopts the renamed library. The ledger is therefore a **dependency-candidate ledger**, not a claim
that every line is a confirmed dependency.

## Required use in later stages

- Do not apply the rename mechanically to every ledger line.
- `rename_map.json` is built from the simplicity-owned names in `classes_legacy.txt`, not from every
  class owned by quantz-web.
- During fixture extraction/application, classify an ambiguous quantz-web occurrence from its DOM
  relationship to a simplicity component. Preserve unrelated application classes unchanged.
- Keep unresolved candidates until ST-R. A candidate may be removed only with a recorded reason
  showing that it is outside a simplicity-generated subtree or API contract.
- The migration kit must use class-aware contexts and provide a dry run; it must not perform an
  unrestricted text replacement across quantz-web.

## Frozen decisions

- Prefix: `spl-` for classes, `--spl-*` for CSS custom properties, `data-spl-theme` for the theme
  attribute and `spl-theme` as the current storage-key proposal.
- Consumer strategy: vendored site fixture plus migration kit. quantz-web remains read only until
  the separately triggered ST-R adoption session.

## Source snapshots

- simplicity input: `d3abadc24bbedaf4a0f0182b8348be6f4a986dc2`
- quantz-web input: `99a9488714b94e227ecec54340df031419c5d1e2`

The detailed extraction boundaries are written in the headers of the two inventory files. The page
selection and proposed file closure are in `site_fixture_plan.md`.
