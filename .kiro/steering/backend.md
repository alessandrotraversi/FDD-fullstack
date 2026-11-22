---
inclusion: fileMatch
fileMatchPattern: ["apps/backend/**/*", "**/prisma/**/*"]
---

# Backend rules

- Load the `clean-arch` skill before creating, moving or renaming any backend artifact.
- Dependency rule: `domain/` <- `usecase/` <- `infra/`. `src/main.ts` is the only composition root.
- `process.env` only in `src/config/env.ts`. Handlers validate with zod and call one use case; no try/catch in handlers.
- Every new backend function gets a test; external I/O uses named fake classes.
- Run `./scripts/run-gates.mjs` before declaring backend work done. Never bypass hooks with `--no-verify`.
