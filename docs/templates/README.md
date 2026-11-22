# Templates

Abstract, domain-free examples of every artifact the FDD pipeline produces. They are **references for humans** —
the skills generate the real files from their own templates (`.claude/skills/*/references/`). Do not copy these into
`docs/` as-is; run the skills instead.

| File | Produced by | Real location |
|---|---|---|
| `PRD.template.md` | prd-writer | `docs/PRD.md` |
| `prd_progress.example.json` | prd-writer (+ every downstream skill) | `docs/prd_progress.json` |
| `F01-example-feature/spec.md` | spec-writer | `docs/F<ID>-<slug>/spec.md` |
| `F01-example-feature/plan.md` | spec-writer | `docs/F<ID>-<slug>/plan.md` |
| `F01-example-feature/contract.md` | spec-writer | `docs/F<ID>-<slug>/contract.md` |

Placeholders use `<angle-brackets>`; `<Resource>` stands for any domain aggregate of your project.
