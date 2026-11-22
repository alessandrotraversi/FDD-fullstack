---
description: Capture project-specific knowledge into docs/context/ so every FDD skill picks it up.
---

The user wants to add or update project context. Input: $ARGUMENTS

1. Read `docs/context/README.md` to learn which file holds which kind of knowledge.
2. Classify the input (domain rule / glossary term, stack or library decision, convention, external integration, environment/runbook, design direction). If it fits several, split it.
3. Update the matching file in `docs/context/` — append or edit the relevant section, keep the existing headings, write in English, be concrete (names, limits, formats, env var names). Never paste secrets; reference the env var instead.
4. If the knowledge must be enforced on **every** session (a hard rule), also add one short bullet to the right section of `AGENTS.md` pointing to the context file. Keep `AGENTS.md` short.
5. If the change affects features already specified (`docs/F<ID>-*/spec.md` exists), list them and recommend regenerating with `spec-writer F<ID>`; do not edit specs or contracts yourself.
6. Reply with the files changed and a one-line summary per change.
