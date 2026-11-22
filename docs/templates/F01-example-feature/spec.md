# Technical Specification: <Resource> Management

## 1. Technical Overview

<What this feature delivers, in 1–2 paragraphs. Name the PRD blocks it implements (Capabilities, Experience, Provides).>

**Scope**

**Included:**
- Create, list, rename and delete `<resource>` owned by the authenticated user
- Output contract for F03: `<resource>` id, owner, status

**Deferred:**
- <Full Scope additions not selected>

## 2. Architecture Impact

- Backend: new aggregate `domain/<resource>/`, use cases in `usecase/<resource>/`, Prisma repository + queries, HTTP routes `/<resources>`.
- Frontend: page `/app/<resources>`, server-side calls through the backend client.
- Database: table `<resources>` (migration).
- Cross-cutting: authentication middleware (from F01) populates `req.user`.

## 3. Technical Decisions

| Decision | Choice | Rationale | Source |
|---|---|---|---|
| Ownership check | in the use case (`actorId`) | clean-arch rule 18 | docs/context/domain.md |
| Name uniqueness | per owner, case-insensitive | PRD Capabilities | PRD §6 F02 |

## 4. Component Overview

- `domain/<resource>/<resource>.entity.ts` — aggregate root with `create`/`restore` factories, `rename()`.
- `domain/<resource>/<resource>-name.vo.ts` — 1–80 chars, trimmed.
- `usecase/<resource>/create-<resource>.usecase.ts` — …
- `infra/http/<resource>/<resource>.routes.ts` — …
- `apps/web/app/app/<resources>/page.tsx` — …

## 5. API Contracts

### Endpoint: Create <Resource>
`POST /<resources>` → `201 { "id": "uuid", "name": "string", "status": "<initial>" }`
Errors: `400` invalid name · `409` duplicate name · `401` anonymous.

## 6. Data Model

### Table: `<resources>`
| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| owner_id | uuid | FK users.id, indexed |
| name | varchar(80) | unique (owner_id, lower(name)) |
| status | varchar(20) | not null |
| created_at | timestamptz | default now() |

## 7. Testing Strategy

- Unit: entity and VO invariants; each use case with in-memory fakes.
- Integration: Prisma repository against the local DB.
- UI smoke: create → list → rename → delete through `playwright-cli`.

## Assumptions / Decisions

- Fixtures live in `tests/fixtures/<feature>/` (docs/context/environments.md).
- Seeds for contract handles are scripts under `apps/backend/scripts/seed-<feature>-contract.ts`.
