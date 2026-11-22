# Conventions

## Naming
- <files, classes, routes, DB tables/columns, env vars>

## Errors
- <error shape returned by the API, e.g. `{ "error": { "code": "...", "message": "..." } }`>
- Messages include the offending value and the expected shape.

## Logging
- Structured JSON for observability; plain text for CLI output.

## Tests
- <test runner, file placement, naming, what deserves a test>
- External I/O is replaced by named fake classes (see `integrations.md`).

## Git
- Branch: `feat/F<ID>-<slug>` (created automatically in wave/tmux mode; create it yourself before a single-feature run)
- Commits: <e.g. Conventional Commits; skills already use `feat(F<ID>)`, `fix(F<ID>)`, `chore(F<ID>)`>

## UI
- <accessibility baseline, responsive breakpoints, copy tone, i18n>
