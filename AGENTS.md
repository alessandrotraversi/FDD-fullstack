# AGENTS.md

> Project instructions loaded by every agent session (Claude Code reads this through the `CLAUDE.md` symlink).
> Keep this file **short and stable**. Project-specific knowledge lives in `docs/context/` — see
> `docs/guides/04-adding-context.md`. Replace every `<placeholder>` before the first feature run.

## Project

- Name: `<project-name>`
- One-line purpose: `<what the product does, for whom>`
- PRD: `docs/PRD.md` · Progress: `docs/prd_progress.json`
- Project context (read before planning or implementing): `docs/context/`

## Monorepo

- `apps/web/` — Frontend (`<framework, e.g. Next.js>`)
- `apps/backend/` — Backend (`<framework, e.g. Fastify + Prisma>`) following the `clean-arch` skill
- `docs/` — PRD, per-feature specs/plans/contracts, eval reports, design system, project context

## Environment

- Use `./scripts/init.sh` to start the project.
- Use `./scripts/stop.sh` to stop dev processes.
- Use `./scripts/stop.sh --clean` to stop processes and reset generated local state.
- Do not run app dev servers directly.
- Before starting any task, init the environment.
- Secrets come from the system environment or `.env` files that are never committed. Never hardcode keys.

## Feature-Driven Development (FDD) workflow

Every feature goes through the same pipeline. Do not skip stages.

1. `prd-writer` → `docs/PRD.md` + `docs/prd_progress.json`
2. `spec-writer F<ID>` (or `wave <N>`) → `docs/F<ID>-<slug>/{spec,plan,contract}.md`
3. `implement-and-evaluate F<ID>` (single feature) or `/implement-and-evaluate-tmux wave <N>` (parallel wave)
   - internally: `implement-feature` → `evaluator` → `fix-runner` → `evaluator` … → PR
4. `docs/prd_progress.json` is the single source of truth for feature status. Only the skills write to it.

## Backend

- Before backend work, you must load/use the `clean-arch` skill.
- Follow clean architecture: `domain/` <- `usecase/` <- `infra/`.
- `src/main.ts` is the composition root and the only place that wires concrete infra classes.
- `process.env` is only allowed in `src/config/env.ts`.
- Handlers validate input and call use cases; handlers do not catch errors.
- Run `./scripts/run-gates.mjs` before declaring backend work done.
- Use the provided gates and linters. Do not create replacement gates.

## Code Style

- Keep functions small, focused, and explicitly typed.
- Prefer small modules over large files; follow SOLID (SRP) — a module has one reason to change.
- Avoid `any`, duplicated logic, and deep nesting. Early returns over nested ifs; max 2 levels of indentation.
- Error messages must include the offending value and the expected shape.
- Comments explain why, not what.

## Backend Tests and Logs

- Every new backend function gets a test; bug fixes get a regression test.
- Mock external I/O with named fake classes, not inline stubs.
- Use structured JSON for observability logs and plain text for CLI output.

## Frontend Tests

- Use `playwright-cli` (load the `playwright-cli` skill) for every navigation/browser check.
  Do not add a Playwright test runner or `e2e/` folders.
- Only write tests for behavior that protects business rules or critical UI flows — no granular snapshot tests.
- Confirm UI against the design reference in `docs/design/` (see `docs/design/README.md`).

## Design System

- Source of truth: `docs/design/` → `<file or folder of the chosen design system>`
- Variant/theme to use: `<e.g. "Option B — dark">`
- Treat the design pages as reference for look & feel; the PRD and contract define behavior.

## External services

- `<SERVICE_NAME>`: key read from `<ENV_VAR>` via `src/config/env.ts`. Tests use a named fake gateway.
- Sample/fixture data: `<where large samples live, e.g. tests/fixtures/<feature>/ or a download link>`

## Rules

- NEVER create temp files in the project root (scratch scripts, ad-hoc test files, screenshots).
- NEVER bypass git hooks (`--no-verify`). If a gate is wrong, stop and ask.
- NEVER edit `contract.md` to make a failing item pass — fix the implementation, or regenerate the contract with `spec-writer`.
