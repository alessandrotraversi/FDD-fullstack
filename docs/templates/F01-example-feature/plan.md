# Implementation Plan: <Resource> Management

## Prerequisites

- Review `docs/F01-example-feature/spec.md` before changing code.
- Follow the clean-arch dependency rule; `process.env` only in `src/config/env.ts`.
- Use `./scripts/init.sh` / `./scripts/stop.sh` for the runtime.

## Phase 1: Domain and Persistence

**1. Aggregate and value objects** - Create the `<Resource>` aggregate, its id and name VOs, domain errors, and the repository/queries interfaces.

**2. Schema and migration** - Add the `<resources>` table and generate the migration.

**3. Persistence adapters** - Prisma repository, queries, mapper, and named in-memory fakes.

## Phase 2: Use Cases and HTTP

**4. Use cases** - Create, list, rename, delete with ownership checks via `actorId`.

**5. Handlers, routes, composition root** - zod-validated handlers, route registration, wiring in `src/main.ts`.

## Phase 3: Frontend

**6. List and create UI** - Page following the design reference in `docs/design/`; inline validation and empty/error states.

**7. Rename and delete UI** - Inline rename, confirm-before-delete.

## Phase 4: Contract Prerequisites and Readiness

**8. Seeds and fixtures** - Produce every Persistent state / Static input declared in `contract.md`.

**9. Readiness** - Run quality gates and browser smoke for UI items.
