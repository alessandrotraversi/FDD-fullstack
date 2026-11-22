# 02 — Instalação

## Pré-requisitos

| Ferramenta | Uso | Obrigatório |
|---|---|---|
| Node.js ≥ 20 + npm | scripts, scaffold, gates | sim |
| git | commits por fase, worktrees | sim |
| `gh` autenticado (`gh auth login`) | PRs, issues opcionais, resolução de conflitos | sim |
| Docker | PostgreSQL local quando o scaffold é gerado com banco | quando houver DB |
| tmux | somente `implement-and-evaluate-tmux` | não |
| Claude Code | executor das skills | sim |

A lista canônica fica em `package.json → fdd.cli`. `npm run doctor` verifica tudo.

## Opção A — Projeto novo

```bash
git clone <este-repo> meu-produto && cd meu-produto
npm install
npm run setup                 # skills externas + browser do playwright-cli
npm run doctor
```

1. Preencha os placeholders de `AGENTS.md` (`<project-name>`, stack, design system).
2. Preencha `docs/context/product.md` com a descrição do produto (pode ser rascunho).
3. Gere o PRD com `prd-writer`.
4. O código da aplicação vem do scaffold da skill `clean-arch`. Gere-o **fora** do repositório e mescle — assim `AGENTS.md`, `README.md` e `package.json` do harness não são sobrescritos:

```bash
npm run scaffold -- app --target /tmp/app-scaffold --shape backend-n-nextjs --db --yes --no-install --no-gates --no-git
npm run merge-scaffold -- /tmp/app-scaffold   # copia apps/, scripts/, docker-compose.yml e mescla package.json/.gitignore
npm install
./scripts/init.sh                              # sobe banco, backend e web e valida /health
./scripts/run-gates.mjs                        # gates de arquitetura do backend
```

Opções do scaffold: `--shape backend | backend-n-nextjs`, `--db | --no-db`, `--yes` (sem wizard), `--dry-run`, `--force`. Sem `--yes` ele abre um wizard interativo.

O scaffold cria `apps/backend` (Fastify + Clean Architecture), `apps/web` (Next.js, opcional), `scripts/init.sh`, `stop.sh`, `run-gates.mjs`, `migrate-dev.sh`, `resolve-env.sh` (porta e banco isolados por branch/worktree — é o que permite rodar várias features em paralelo) e `docker-compose.yml` quando há banco.

**Rode o scaffold antes do primeiro `spec-writer`.** Com o esqueleto no lugar, o `spec-writer` descobre stack, convenções, gates e scripts de ambiente lendo o código, em vez de perguntar tudo na entrevista — e as Foundation features do PRD passam a construir sobre uma base já validada.

## Opção B — Projeto existente

Copie para a raiz do seu repositório:

```
.claude/  (skills, agents, commands, settings.json)
.agents   (symlink → .claude, opcional)
.mcp.json
scripts/fdd.mjs
docs/guides/ docs/context/ docs/design/ docs/templates/
```

Mescle o bloco `"fdd"`, os `scripts` e as `devDependencies` do `package.json` no seu. Mescle `AGENTS.md` com o seu `CLAUDE.md` (o harness só precisa das seções *Environment*, *FDD workflow*, *Backend*, *Frontend Tests* e *Rules*).

Pontos de atenção em projetos existentes:

- As skills esperam scripts `./scripts/init.sh` e `./scripts/stop.sh`. Se o seu projeto usa outro mecanismo, **documente-o** em `docs/context/environments.md` — o `evaluator` lê esse arquivo na descoberta e usa o que estiver lá.
- Se o backend não segue `clean-arch`, remova a seção *Backend* do `AGENTS.md` e descreva sua arquitetura em `docs/context/conventions.md`.
- No PRD de um projeto maduro normalmente não existem Foundation features.

## MCPs

`.mcp.json` declara os servidores do projeto e `.claude/settings.json` já os habilita (`enabledMcpjsonServers`). Na primeira sessão o Claude Code pede aprovação.

```bash
export CONTEXT7_API_KEY=...   # opcional, aumenta limites do context7
claude mcp list               # confere conexão
```

Detalhes e opcionais em [05 — MCPs e skills](05-mcp-and-skills.md).

## Skills externas

`npm run skills:install` lê `package.json → fdd.skills.external` e roda, para cada uma:

```bash
npx skills add <source> --skill <nome> --agent claude-code --yes
```

Elas são instaladas em `.claude/skills/<nome>/`. Faça commit delas para o time inteiro usar a mesma versão, ou adicione-as ao `.gitignore` e rode `npm run setup` em cada máquina.

## Verificação

```bash
npm run doctor        # ambiente
npm run skills:list   # skills locais e externas
npm run mcp:list      # MCPs por nível
npm run test:skills   # testes do scaffold
```
