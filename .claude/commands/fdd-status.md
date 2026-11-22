---
description: Show FDD progress (features by wave/status) and recommend the next command to run.
---

Read `docs/prd_progress.json` (or run `npm run status`) and produce a compact report:

1. A table per wave: feature ID, name, status, cycles, dependencies, `failure_reason` when present.
2. Features **ready to start**: status `pending` and every dependency `done`.
3. Features that need attention: `fail`, `pr-blocked`, or `implemented` with no recent eval report.
4. The single best next command, following the FDD workflow in `docs/guides/03-workflow.md`:
   - no PRD → `prd-writer`
   - ready features without `docs/F<ID>-*/contract.md` → `spec-writer F<ID>` (or `spec-writer wave <N>` when 2+ in the same wave)
   - ready features with spec/plan/contract → `implement-and-evaluate F<ID>` (or `/implement-and-evaluate-tmux wave <N>` when 2+ in the same wave and tmux is available)
   - `fail` → read the latest `eval-report-*.md` and the orchestration journal, then suggest `fix-runner` or a spec regeneration

Do not modify any file. Extra filter from the user (optional): $ARGUMENTS
