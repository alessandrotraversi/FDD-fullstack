# FDD-fullstack

Harness de **Feature-Driven Development** para Claude Code (e agentes compatíveis com `.agents/`).
Transforma uma ideia de produto em features entregues, verificadas e com PR aberto, seguindo sempre o mesmo pipeline:

```
prd-writer ─► spec-writer ─► implement-feature ─► evaluator ─► fix-runner ─► evaluator … ─► PR
   PRD.md       spec/plan/        commits por        eval-report     commit por
 progress.json  contract.md         fase              -<ts>.md         ciclo
                                 └──────── implement-and-evaluate (1 feature) ────────┘
                                 └──── implement-and-evaluate-tmux (wave inteira em paralelo) ────┘
```

Todo o conteúdo do harness vive em `.claude/` e é **agnóstico de projeto**: nenhuma skill conhece o seu domínio.
O conhecimento específico do seu produto entra por `AGENTS.md`, `docs/context/` e `docs/design/`.

## Estrutura

```
.
├── .claude/
│   ├── skills/            # prd-writer, spec-writer, implement-feature, evaluator, fix-runner,
│   │                      # implement-and-evaluate, implement-and-evaluate-tmux, clean-arch
│   ├── agents/            # frontend-ui-design (critérios de avaliação visual)
│   ├── commands/          # /implement-and-evaluate-tmux, /fdd-status, /fdd-context
│   └── settings.json      # MCPs habilitados + permissões base
├── .agents -> .claude     # mesmo conteúdo para agentes que leem .agents/
├── .mcp.json              # servidores MCP do projeto
├── AGENTS.md              # instruções curtas e estáveis (CLAUDE.md é symlink)
├── package.json           # scripts + bloco "fdd" (skills, MCPs, CLIs necessários)
├── scripts/fdd.mjs        # setup / doctor / status
└── docs/
    ├── guides/            # documentação de uso (comece aqui)
    ├── context/           # conhecimento específico do projeto (você preenche)
    ├── design/            # design system / referências visuais (você preenche)
    └── templates/         # exemplos abstratos de PRD, progress e pasta de feature
```

## Começo rápido

```bash
npm install            # instala @playwright/cli e o CLI de skills
npm run setup          # instala skills externas (playwright-cli, frontend-design) + browser
npm run doctor         # valida node, git, gh, docker, tmux, MCPs e skills

# esqueleto da aplicação (backend Clean Architecture + Next.js + Postgres)
npm run scaffold -- app --target /tmp/app-scaffold --shape backend-n-nextjs --db --yes --no-install --no-gates --no-git
npm run merge-scaffold -- /tmp/app-scaffold && npm install && ./scripts/init.sh
```

Depois, dentro do Claude Code:

1. Preencha `AGENTS.md` e `docs/context/` (ou use `/fdd-context <texto>`).
2. `Use a skill prd-writer para o produto descrito em docs/context/product.md`
3. `spec-writer wave 1`
4. `implement-and-evaluate F01` — ou `/implement-and-evaluate-tmux wave 2` para paralelizar.
5. `/fdd-status` a qualquer momento para ver o próximo passo.

## Documentação

| Guia | Conteúdo |
|---|---|
| [01 — Visão geral](docs/guides/01-overview.md) | Conceitos, artefatos, ciclo de vida de uma feature |
| [02 — Instalação](docs/guides/02-installation.md) | Pré-requisitos, setup, projeto novo vs. existente |
| [03 — Workflow otimizado](docs/guides/03-workflow.md) | Passo a passo, quando paralelizar, checkpoints humanos |
| [04 — Adicionando contexto específico](docs/guides/04-adding-context.md) | Onde colocar cada tipo de conhecimento e como ele chega às skills |
| [05 — MCPs e skills](docs/guides/05-mcp-and-skills.md) | O que é necessário, opcional, e como estender |

## Stack de referência

O scaffold da skill `clean-arch` gera um monorepo **TypeScript**: backend Fastify + Prisma/PostgreSQL (Clean Architecture + DDD tático, gates de arquitetura) e, opcionalmente, um frontend Next.js.
As skills de FDD (`prd-writer` → `fix-runner`) são agnósticas de stack; troque a stack documentando-a em `docs/context/stack.md`.
