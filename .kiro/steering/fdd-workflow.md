---
inclusion: always
---

# FDD workflow (Kiro)

This workspace uses the **FDD-fullstack** harness. Root `AGENTS.md` holds the stable project rules (Kiro loads it automatically); this file explains how the harness runs inside Kiro.

## Pipeline

1. `prd-writer` skill → `docs/PRD.md` + `docs/prd_progress.json`
2. `spec-writer` skill (`F<ID>` or `wave <N>`) → `docs/F<ID>-<slug>/{spec,plan,contract}.md`
3. `implement-and-evaluate` skill (`F<ID>`) → `implement-feature` → `evaluator` → `fix-runner` → … → PR
4. Parallel wave: `/implement-and-evaluate-tmux` (manual steering) — one git worktree + tmux window per feature, each running `kiro-cli chat --agent fdd`.

`docs/prd_progress.json` is the single source of truth for feature status; only the skills write to it.
`contract.md` is the testable promise of a feature: never edit it to make an item pass.

## How the skills map to Kiro

- Skills live in `.kiro/skills/<name>/SKILL.md` and are **generated** from `.claude/skills/` by `npm run kiro:sync`. Edit `.claude/`, then re-sync.
- Activate a skill with `/<skill-name>` in chat or by asking for it by name.
- Where a skill says "spawn a `general-purpose` subagent" / "Agent tool", delegate to the **`fdd-worker`** custom agent as a sub-agent — one sub-agent per skill invocation, same prompt, same JSON return.
- Use the **`fdd`** custom agent as the primary agent for FDD work (it preloads skills, steering and project context).
- Manual steering available as slash commands: `/fdd-status`, `/fdd-context`, `/implement-and-evaluate-tmux`, `/fdd-kiro-spec`, `/frontend-ui-design`.

## Kiro Specs vs FDD artifacts

FDD artifacts in `docs/F<ID>-*/` are canonical. Kiro-native specs under `.kiro/specs/` are optional mirrors produced by `/fdd-kiro-spec` so you can use Kiro's task UI; when they disagree, `contract.md` > `spec.md` > `.kiro/specs/`.
