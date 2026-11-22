# Project context

Project-specific knowledge consumed by the FDD skills. The skills themselves stay generic; this folder makes them yours.
Write in English, be concrete (names, numbers, formats, env var names), never paste secrets.

| File | Read by | Holds |
|---|---|---|
| `product.md` | prd-writer | vision, audience, problem, scope limits |
| `domain.md` | prd-writer, spec-writer | glossary, entities, invariants, business rules, state machines |
| `stack.md` | spec-writer, implement-feature | runtimes, frameworks, versions, approved / forbidden libraries |
| `conventions.md` | spec-writer, implement-feature, fix-runner | naming, folders, errors, logging, tests, git |
| `integrations.md` | spec-writer, implement-feature | external services, env vars, quotas, test fakes |
| `environments.md` | evaluator, fix-runner | bring-up / tear-down, seeds, fixtures, ports, sample data |

Precedence on conflict: `contract.md` > `spec.md` > `docs/context/` > patterns inferred from code > stack defaults.
Delete sections that do not apply; an empty heading is worse than no heading.
