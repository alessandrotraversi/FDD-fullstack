---
inclusion: fileMatch
fileMatchPattern: ["apps/web/**/*"]
---

# Frontend rules

- Visual source of truth: `docs/design/README.md` (entry file, variant to use, tokens).
- Browser checks use `playwright-cli` (load the `playwright-cli` skill). No Playwright test runner, no `e2e/` folders.
- Test only behavior that protects business rules or critical flows.
- For visual review, use the `frontend-ui-design` agent or `/frontend-ui-design` steering (scores ≤ 3 in any dimension fail).
