# 05 — MCPs e skills

A fonte de verdade é o bloco `"fdd"` do `package.json`. `npm run skills:list` e `npm run mcp:list` imprimem o estado atual.

## MCPs

| Servidor | Nível | Configuração | Para quê |
|---|---|---|---|
| `context7` | obrigatório | `.mcp.json` (`@upstash/context7-mcp`) | documentação atualizada e por versão das bibliotecas, usada ao especificar e implementar. `CONTEXT7_API_KEY` opcional |
| `playwright` | recomendado | `.mcp.json` (`@playwright/mcp`, headless + isolated) | fallback de browser quando o `playwright-cli` não estiver disponível; depuração interativa de UI |
| `github` | opcional | `claude mcp add --transport http github https://api.githubcopilot.com/mcp/` | navegar issues/PRs pelo chat. As skills usam o `gh` CLI, não o MCP |
| `postgres` (read-only) | opcional | qualquer servidor MCP Postgres somente leitura, com `$DATABASE_URL` | consultas ad-hoc ao investigar falhas de avaliação |

`.claude/settings.json` habilita `context7` e `playwright` via `enabledMcpjsonServers`. Para usar um MCP só na sua máquina, adicione-o com `claude mcp add --scope user` (não vai para o repositório).

**Por que tão poucos MCPs?** As skills foram desenhadas para depender de CLIs (`git`, `gh`, `tmux`, `playwright-cli`, `npm`), que são determinísticos, scriptáveis e funcionam dentro de worktrees e sub-agentes. MCPs entram onde agregam informação (docs de bibliotecas) ou como alternativa interativa.

### Adicionar um MCP ao projeto

1. Adicione a entrada em `.mcp.json` (use `${VAR}` / `${VAR:-default}` para segredos).
2. Inclua o nome em `.claude/settings.json → enabledMcpjsonServers`.
3. Registre em `package.json → fdd.mcp.<required|recommended|optional>` com `purpose`.
4. Se alguma skill deve usá-lo, diga isso em `docs/context/stack.md` ou `AGENTS.md` (ex.: "Use the `context7` MCP before adding or upgrading a library").

## Skills

### Locais (versionadas em `.claude/skills/`)

| Skill | Etapa | Observações |
|---|---|---|
| `prd-writer` | definir | 9 seções, IDs `F01…`, grafo topológico, waves, `prd_progress.json` |
| `spec-writer` | especificar | single (entrevista) ou batch (`wave N`); gera spec + plan + contract; `create-issue` opcional |
| `implement-feature` | construir | 1 commit por fase; produz seeds/fixtures/config do contrato; smoke em browser para UI |
| `evaluator` | verificar | sobe ambiente efêmero, executa cada item, baseline visual, relatório com evidências |
| `fix-runner` | corrigir | modo A (falhas de avaliação) e modo B (conflitos de merge / PR) |
| `implement-and-evaluate` | orquestrar | retry budget (3), circuit breaker, journal, PR |
| `implement-and-evaluate-tmux` | orquestrar | wave em paralelo com worktrees + tmux (`max-parallel=3`, `team-timeout=90m`) |
| `clean-arch` | transversal | 19 regras, referências, linters, `run-gates.mjs`, scaffold |

### Externas (instaladas por `npm run skills:install`)

| Skill | Fonte | Nível | Para quê |
|---|---|---|---|
| `playwright-cli` | `microsoft/playwright-cli` | obrigatória | driver de browser do smoke de UI (`implement-feature`) e dos itens UI/E2E (`evaluator`) |
| `frontend-design` | `anthropics/skills` | opcional | direção visual quando não há design system em `docs/design/` |

Comando equivalente manual:

```bash
npx skills add microsoft/playwright-cli --skill playwright-cli --agent claude-code --yes
npx skills add anthropics/skills --skill frontend-design --agent claude-code --yes
npx playwright-cli install-browser
```

### Adicionar uma skill externa

1. Inclua em `package.json → fdd.skills.external`:

```json
"<nome>": { "source": "<owner/repo>", "skill": "<nome>", "required": false, "purpose": "<quando usar>" }
```

2. `npm run skills:install`.
3. Cite-a em `AGENTS.md` se ela deve ser carregada em situações específicas.

### Agents e commands

- `.claude/agents/frontend-ui-design.md` — rubrica de avaliação visual (pesos 2x para Design Quality e Originality; qualquer dimensão ≤ 3 reprova).
- `.claude/commands/fdd-status.md` — `/fdd-status [filtro]`.
- `.claude/commands/fdd-context.md` — `/fdd-context <conhecimento>`.
- `.claude/commands/implement-and-evaluate-tmux.md` — `/implement-and-evaluate-tmux <seleção> [overrides]`.

## CLIs exigidos

`node ≥ 20`, `npm`, `git`, `gh` autenticado, `docker` (com banco). `tmux` e `jq` são opcionais. `npm run doctor` valida todos.
