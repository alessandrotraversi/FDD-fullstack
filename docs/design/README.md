# Design reference

Drop the project's design system and reference screens in this folder, then fill in this file.
`spec-writer`, `implement-feature`, `evaluator` and the `frontend-ui-design` agent read it to locate the visual source of truth.

## Entry point
- File / folder: `<e.g. docs/design/design-system/index.html, a Figma export, a tokens file>`
- How to open it: `<e.g. open in a browser; components are JSX files under components/>`

## Variant to use
- `<e.g. "Option B — dark theme". Ignore other variants.>`

## Tokens
- Colors: `<file or summary>`
- Typography: `<families, scale>`
- Spacing / radius / shadows: `<scale>`

## Screens covered
| Screen / component | Reference file | Notes |
|---|---|---|
| `<screen>` | `<path>` | `<deviations allowed>` |

## Not covered by the reference
- `<screens or states the agent must design by analogy (empty, loading, error states, admin pages…)>`

## No design system?
Install the optional `frontend-design` skill (`npm run skills:install`) and describe the desired direction here:
mood, references, audience, density, light/dark, accessibility baseline.
