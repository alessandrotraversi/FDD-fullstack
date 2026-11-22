# 04 — Adicionando contexto específico

As skills são deliberadamente genéricas. Tudo que torna o resultado **seu** — domínio, regras de negócio, stack, convenções, integrações, design — entra por camadas de contexto bem definidas. Colocar cada informação na camada certa evita repetição, mantém o `AGENTS.md` enxuto e faz o conhecimento chegar à skill que precisa dele.

## As camadas (da mais estável para a mais pontual)

| # | Camada | Onde | Quem lê | Use para |
|---|---|---|---|---|
| 1 | Regras de sessão | `AGENTS.md` (`CLAUDE.md` é symlink) | **toda** sessão, sempre | regras invioláveis, comandos de ambiente, ponteiros para o resto. Máx. ~80 linhas |
| 2 | Contexto do projeto | `docs/context/*.md` | `prd-writer`, `spec-writer`, `implement-feature`, `evaluator`, `fix-runner` | domínio, glossário, stack, convenções, integrações, ambientes |
| 3 | Design | `docs/design/` + `README.md` | `spec-writer`, `implement-feature`, `evaluator`, agent `frontend-ui-design` | design system, telas de referência, variante a usar |
| 4 | Produto | `docs/PRD.md` | `spec-writer` em diante | o quê e por quê; critérios de aceite |
| 5 | Feature | `docs/F<ID>-*/spec.md` → *Assumptions/Decisions* | `implement-feature`, `fix-runner` | decisões que valem só para aquela feature |
| 6 | Execução | texto livre na invocação | a skill invocada | ajustes pontuais: `skip lint`, `stub the AI provider`, `max 5 retries`, `only phases 1 and 2` |
| 7 | Skill própria | `.claude/skills/<nome>/SKILL.md` | quando acionada | conhecimento procedural reutilizável (ex.: "como integrar com o gateway de pagamento X") |

**Precedência quando há conflito:** itens do `contract.md` > `spec.md` > `docs/context/` > padrões inferidos do código > defaults da stack. `AGENTS.md` define regras de processo, não comportamento de feature.

## `docs/context/` — o que vai em cada arquivo

| Arquivo | Conteúdo | Exemplos |
|---|---|---|
| `README.md` | índice; diz às skills o que ler | — |
| `product.md` | visão, público, problema, limites, fora de escopo | entrada principal do `prd-writer` |
| `domain.md` | glossário, entidades e invariantes, regras de negócio, estados | "Um pedido só pode ser cancelado em `pending`" |
| `stack.md` | linguagens, frameworks, versões, bibliotecas aprovadas/proibidas | "Validação com zod; datas com date-fns" |
| `conventions.md` | nomes, estrutura de pastas, padrões de erro, logs, testes, git | "Commits em Conventional Commits" |
| `integrations.md` | serviços externos, env vars, limites, fakes para teste | "`PAYMENTS_API_KEY`; teste usa `FakePaymentGateway`" |
| `environments.md` | como subir/derrubar, seeds, fixtures, dados de exemplo, portas | lido pelo `evaluator` na descoberta de ambiente |

Escreva em **inglês** (as skills e o PRD trabalham em inglês), com números e nomes concretos. Nunca coloque segredos — referencie a variável de ambiente.

## Como cada skill consome o contexto

- **prd-writer** — lê `docs/context/` inteiro antes da entrevista e não pergunta o que já está respondido. `product.md` substitui a descrição longa no prompt.
- **spec-writer** — lê `stack.md` e `conventions.md` sempre; `domain.md`, `integrations.md` e `environments.md` conforme a feature; `docs/design/README.md` quando há UI. Contexto vence padrões inferidos; divergências viram *Assumptions/Decisions* na spec.
- **implement-feature** — lê `conventions.md`, `stack.md` e o que a spec citar; para fases de UI, abre a referência de design.
- **evaluator** — usa `AGENTS.md` e `environments.md` para subir, resetar e derrubar o ambiente (camada 2 da descoberta).
- **fix-runner** — respeita `conventions.md`; consulta `environments.md` para falhas de seed/fixture/runtime.

## Fluxos práticos

### Registrar conhecimento novo

```
/fdd-context Usuários free podem ter no máximo 3 projetos; o plano pro remove o limite.
```

O comando classifica (aqui: `domain.md`), grava, e lista as features já especificadas que podem ser afetadas, sugerindo `spec-writer F<ID>` para regerar.

### Adicionar uma integração externa

1. Em `integrations.md`: nome, propósito, env var, limites/quotas, formato de resposta relevante e **a fake usada em testes**.
2. Em `environments.md`: como obter a credencial localmente.
3. Se a regra for crítica para toda sessão (ex.: "nunca chamar a API real em testes"), adicione uma linha em `AGENTS.md → External services`.

### Trocar ou adicionar stack

1. Atualize `stack.md` (e `conventions.md` se a organização de pastas mudar).
2. Se o backend não seguir mais `clean-arch`, remova a seção *Backend* de `AGENTS.md`.
3. Garanta que os comandos de gate existam (`npm run lint/typecheck/test/build` ou equivalentes): o `spec-writer` os detecta e coloca em *Quality gates* do contrato.

### Design system

Coloque os arquivos em `docs/design/` e preencha `docs/design/README.md` com: arquivo de entrada, variante/tema a usar, tokens, e o que **não** está coberto pela referência. Sem design system, instale a skill opcional `frontend-design` e descreva a direção visual desejada no README.

### Conhecimento procedural reutilizável → skill própria

Quando um procedimento se repete entre features (integrar um provedor, criar um tipo de relatório, padrão de migração de dados), crie `.claude/skills/<nome>/SKILL.md`:

```markdown
---
name: payments-integration
description: Use when a feature creates, captures or refunds payments, or touches the payment gateway adapter.
---

# Payments integration
- Gateway interface lives in `domain/payment/payment.gateway.ts` …
- Test with `FakePaymentGateway` …
```

Registre-a em `package.json → fdd.skills.local` e cite-a em `AGENTS.md` ("Before payment work, load the `payments-integration` skill").

## Antipadrões

- Colar o PRD ou trechos de spec no `AGENTS.md` — infla toda sessão e diverge com o tempo.
- Repetir a mesma regra em `AGENTS.md` e em `docs/context/` — escolha um lugar e aponte para ele.
- Editar `contract.md`/`spec.md` à mão para "ensinar" algo ao agente — regenere com `spec-writer` após atualizar o contexto.
- Colocar exemplos de domínio dentro das skills em `.claude/skills/` — elas devem continuar abstratas para servir a qualquer projeto.
