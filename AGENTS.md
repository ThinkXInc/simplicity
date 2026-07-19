# simplicity Codex 作業規約

このファイルは Codex 用の入口である。プロジェクトの規範を Claude Code と二重管理しないため、
作業開始時に次の順で全文を読み、すべて適用すること。

1. `CLAUDE.md` — 長期の開発規約
2. `CLAUDE_REFACTORING.md` — リファクタリング作戦期間の規律
3. 対象計画書 — 現在のスタイル基盤刷新は `style_plan.md`
4. `CHECKSUMS.md` と `findings.md` — 現在地と既知事項

ファイル名に `CLAUDE` とあるが、内容は Codex にも同じ強さで適用する。矛盾時の優先順位は
`CLAUDE_REFACTORING.md` の「文書の優先順位」に従う。

## Codex 固有の運用

- セッション開始時に、ブランチ、HEAD、計画書の版数、完了済み ST、作業ツリーを実測して宣言する。
- 計画書(`*_plan.md`)と `docs/coding_guides/` は読み取り専用。問題は `findings.md` に記録する。
- `quantz-web` は `style_plan.md` が許可する読み取りだけに使い、書き込み・ブランチ作成・commit・push をしない。
- `dist/` を手編集しない。生成は計画書と `CLAUDE.md` に記載されたコマンドだけで行う。
- 計画外の変更、ついで修正、force push、破壊的な Git 操作をしない。
- 各 ST は完了条件を検証してから1項目1コミットにし、通常 push する。
- 承認が必要な操作、想定外の差分、セキュリティ上の疑いでは停止してオーナーへ報告する。
- ユーザーへ渡す zsh コマンドにはインラインコメントを混ぜず、パスを明示する。
- `.env*`、秘密鍵、credential、`~/.ssh/`、`~/.aws/`、`~/.config/`、`*.pem`、
  `*.tfstate`、`*.tfvars` を読み書きしない。必要になった場合は対象と理由を示して停止する。
- `.claude/`、`.codex/`、`CLAUDE*.md`、`AGENTS.md`、`docs/` の変更は、オーナーが
  文書・エージェント設定の整備を明示的に依頼した場合だけ行う。

`.claude/settings.json` は Claude Code 専用であり、Codex の権限設定として扱わない。
Codex のプロジェクト既定値は `.codex/config.toml` が正である。Claude Code の存在しない
`infra/scripts/cost-hook.sh` を呼ぶ hook は Codex へ移植しない。
