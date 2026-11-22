# 06 — Usando com o Kiro

O harness roda em dois alvos a partir da **mesma fonte**:

| | Claude Code | Kiro (IDE e CLI) |
|---|---|---|
| Raiz | `.claude/` (fonte da verdade) | `.kiro/` (skills e steering manuais **gerados**) |
| Instruções sempre ativas | `AGENTS.md` (via `CLAUDE.md`) | `AGENTS.md` (lido automaticamente) + `.kiro/steering/*` `inclusion: always` |
| Skills | `.claude/skills/<nome>/SKILL.md` | `.kiro/skills/<nome>/SKILL.md` |
| Comandos | `.claude/commands/*.md` → `/nome` | steering `inclusion: manual` → `/nome` |
| Sub-agentes | `general-purpose` via Agent tool | custom agent `fdd-worker` invocado como sub-agente |
| Agente principal | sessão padrão | custom agent `fdd` (`.kiro/agents/fdd.json`) |
| MCP | `.mcp.json` | `.kiro/settings/mcp.json` |
| Hooks | git hooks do projeto | `.kiro/hooks/*.json` (schema `v1`) + git hooks |
| Execução sem UI / waves | `claude` | `kiro-cli chat --agent fdd --no-interactive --trust-all-tools` |

## O que existe em `.kiro/`

```
.kiro/
├── steering/
│   ├── fdd-workflow.md            always    — pipeline, mapeamento de termos Claude → Kiro
│   ├── project-context.md         always    — inclui docs/context/stack.md e conventions.md
│   ├── backend.md                 fileMatch — apps/backend/**, prisma/**
│   ├── frontend.md                fileMatch — apps/web/**
│   ├── fdd-status.md              manual    — /fdd-status            (gerado de .claude/commands)
│   ├── fdd-context.md             manual    — /fdd-context <texto>   (gerado)
│   ├── implement-and-evaluate-tmux.md manual — /implement-and-evaluate-tmux wave N (gerado)
│   ├── frontend-ui-design.md      manual    — rubrica de UI           (gerado de .claude/agents)
│   └── fdd-kiro-spec.md           manual    — /fdd-kiro-spec F03 (espelho em Kiro Specs)
├── skills/                        gerado por npm run kiro:sync (+ skills externas)
├── agents/  fdd.json · fdd-worker.json · frontend-ui-design.json
├── hooks/   fdd-progress-guard.json · fdd-backend-typecheck.json (desligado até existir apps/backend)
└── settings/mcp.json              context7 + playwright
```

## Setup

```bash
npm install
npm run setup          # instala playwright-cli e frontend-design para claude-code e kiro-cli
npm run kiro:check     # confirma que .kiro está em sincronia com .claude
npm run doctor
```

No Kiro IDE:

1. Abra a pasta e marque o workspace como confiável (agentes, skills e hooks de `.kiro/` só são lidos em workspaces confiáveis).
2. Habilite MCP em *Settings → MCP* (vem desligado) e aprove `CONTEXT7_API_KEY` quando solicitado.
3. Selecione o agente **fdd** no seletor de agentes.

No Kiro CLI:

```bash
curl -fsSL https://cli.kiro.dev/install | bash
kiro-cli chat --agent fdd
# headless (CI / waves): export KIRO_API_KEY=... e
kiro-cli chat --agent fdd --no-interactive --trust-all-tools "Use the implement-and-evaluate skill with this input: F03"
```

## Workflow no Kiro

Igual ao [03 — Workflow](03-workflow.md), trocando a forma de chamar:

| Etapa | Kiro |
|---|---|
| PRD | `/prd-writer` (ou "use a skill prd-writer…") |
| Specs | `/spec-writer wave 1` · `/spec-writer F03` |
| Uma feature | `git checkout -b feat/F03-<slug>` e `/implement-and-evaluate F03` |
| Wave paralela | `/implement-and-evaluate-tmux wave 2` — cada janela tmux roda `kiro-cli chat --agent fdd --no-interactive` |
| Status | `/fdd-status` ou `npm run status` |
| Contexto | `/fdd-context <texto>` |
| Revisão visual | agente `frontend-ui-design` ou `/frontend-ui-design` |

Para trocar o executor das waves (ex.: outro binário ou flags), defina `FDD_AGENT_CLI` antes de rodar a wave.

### Kiro Specs (opcional)

O Kiro tem specs nativas (`requirements.md`, `design.md`, `tasks.md`) com UI de tarefas. `/fdd-kiro-spec F03` gera um **espelho** em `.kiro/specs/F03-<slug>/` a partir de `spec.md`, `plan.md` e `contract.md` (critérios em EARS, tarefas por fase do plano, cada uma ligada aos itens do contrato). Use-o se quiser executar tarefas pela UI do Kiro; o veredito continua sendo do `evaluator`, e os arquivos em `docs/F03-*/` continuam canônicos.

## Mantendo os dois alvos

- **Edite sempre `.claude/`** (skills, commands, agent de UI). Depois rode `npm run kiro:sync` — ou deixe o hook `Keep .kiro in sync with .claude` fazer isso quando o Kiro salvar um arquivo em `.claude/`.
- `npm run kiro:check` falha se `.kiro/` estiver desatualizado; use-o em CI.
- Arquivos escritos à mão no lado Kiro (steering `always`/`fileMatch`, `agents/`, `hooks/`, `settings/`, `fdd-kiro-spec.md`) não são tocados pelo sync.
- Não use symlinks dentro de `.kiro/steering` ou `.kiro/skills`: o Kiro ignora steering com symlink, por isso o sync copia arquivos reais.
- Contexto de projeto (`docs/context/`, `docs/design/`) é compartilhado pelos dois alvos.

## Diferenças e limitações conhecidas

- As skills mantêm o texto original; um bloco **Kiro runtime notes** no topo de cada `SKILL.md` traduz os termos específicos do Claude Code (Agent tool, `general-purpose`, `CLAUDE.md`).
- Hooks do Kiro usam o schema `v1` (`trigger` em PascalCase, `action.type` = `command` | `agent`). Se a sua versão do Kiro for anterior ao IDE 1.0 / CLI 3.0, recrie-os pelo painel de hooks.
- `fdd-backend-typecheck` vem com `enabled: false`; ligue-o depois do scaffold.
