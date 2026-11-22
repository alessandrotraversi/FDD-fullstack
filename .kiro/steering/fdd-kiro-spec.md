---
inclusion: manual
---

# /fdd-kiro-spec — mirror an FDD feature into a Kiro spec

Input: a feature ID (`F03`) or folder (`docs/F03-<slug>/`). Requires `spec.md`, `plan.md` and `contract.md` to exist (otherwise tell the user to run `spec-writer` first).

Create or refresh `.kiro/specs/F<ID>-<slug>/` with three files:

1. `requirements.md` — `# Requirements: <Feature Name>`, an Introduction paragraph from `spec.md` §1, then one numbered requirement per row of the contract's **Coverage Manifest**:
   - **User Story:** the matching story from PRD §5.
   - **Acceptance Criteria:** EARS statements (`WHEN <given/when> THEN THE SYSTEM SHALL <then>`) derived from the covering contract items, each tagged with the item ID (e.g. `[API-CREATE-01]`).
2. `design.md` — condensed `spec.md` (Architecture Impact, Technical Decisions, Component Overview, Data Model, API Contracts) with a link to the full `docs/F<ID>-<slug>/spec.md`.
3. `tasks.md` — one top-level checkbox per `plan.md` phase and one sub-checkbox per step, e.g. `- [ ] 2.1 Use cases` followed by `_Requirements: 1.1, 2.3_` and `_Contract: API-CREATE-01_`. Add a final task "Run evaluator for F<ID> and attach the eval-report".

Rules: never change `docs/F<ID>-*/` files; the mirror is regenerated, not hand-edited; tell the user that the verdict still comes from the `evaluator` skill.
