# Stack

## Runtime and languages
- <e.g. Node.js 20 LTS, TypeScript 5 (strict)>

## Backend
- Framework: <e.g. Fastify>
- Architecture: clean-arch skill (`domain/ <- usecase/ <- infra/`)
- Persistence: <e.g. PostgreSQL 16 + Prisma>
- Validation: <e.g. zod at the handler boundary>

## Frontend
- Framework: <e.g. Next.js (App Router)>
- Styling: <e.g. CSS modules / Tailwind>
- Data access: <e.g. server-side calls through BACKEND_INTERNAL_URL>

## Libraries
- Approved: <lib> — <use for>
- Forbidden: <lib> — <reason / replacement>

## Quality gates
- `<command>` — <what it checks>

## Tooling notes
- Use the `context7` MCP before adding or upgrading a library.
