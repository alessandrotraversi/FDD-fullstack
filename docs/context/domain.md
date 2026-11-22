# Domain

## Glossary
| Term | Meaning | Not to be confused with |
|---|---|---|
| <Term> | <definition> | <similar term> |

## Entities and invariants
### <Entity>
- Identity: <id strategy>
- Owned by: <aggregate / user>
- Invariants: <rule that must always hold, e.g. "name is 1–80 chars, unique per owner">
- States: `<state-a>` → `<state-b>` → `<state-c>` (allowed transitions only)

## Business rules
- <Rule> — <who it applies to, limit, consequence when violated, error message>

## Permissions
| Action | Who may do it | Response when denied (403 / 404-masked) |
|---|---|---|
| <action> | <role / owner> | <status> |
