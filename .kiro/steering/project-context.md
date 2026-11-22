---
inclusion: always
---

# Project context

Project-specific knowledge lives in `docs/context/` (index: `docs/context/README.md`). Precedence on conflict:
`contract.md` > `spec.md` > `docs/context/` > patterns inferred from code > stack defaults.

Always-relevant context:

#[[file:docs/context/stack.md]]

#[[file:docs/context/conventions.md]]

Read on demand: `docs/context/product.md` (PRD work), `docs/context/domain.md` (business rules), `docs/context/integrations.md` (external services), `docs/context/environments.md` (bring-up, seeds, fixtures — the evaluator's discovery layer 2), `docs/design/README.md` (UI work).

To add knowledge, use `/fdd-context <text>`; see `docs/guides/04-adding-context.md`.
