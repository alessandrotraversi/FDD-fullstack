# Environments

## Local bring-up / tear-down
- Start: `./scripts/init.sh` (env files, deps, DB, backend, web, /health check)
- Stop: `./scripts/stop.sh` · Reset: `./scripts/stop.sh --clean`
- Ports / DB are isolated per branch by `scripts/resolve-env.sh` (worktree-safe).

## Data
- Seeds: <mechanism and location, e.g. `apps/backend/scripts/seed-<feature>-contract.ts`>
- Fixtures: <location, e.g. `tests/fixtures/<feature>/`>
- Large samples: <where to download them, where to save them (git-ignored)>

## Credentials
- <How a developer obtains each key locally; never commit them>

## Evaluation notes
- <Anything the evaluator must know: headless browser flags, slow services, warm-up steps>
