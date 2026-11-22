# 03 — Workflow otimizado

O objetivo é gastar a atenção humana onde ela rende mais (definição do produto e revisão do contrato) e deixar o loop implementar → avaliar → corrigir rodar sozinho.

```
 HUMANO (alto valor)                     AGENTE (autônomo)
 ────────────────────                    ─────────────────
 0. Contexto do projeto ───────────────► docs/context/, AGENTS.md
 1. Entrevista do PRD ◄──────────────►   prd-writer
 2. Revisão do PRD + waves
 3. Revisão do contract.md ◄──────────   spec-writer (1 feature ou wave inteira)
                                          implement-and-evaluate / -tmux
                                            implement-feature → evaluator → fix-runner ↺
 4. Revisão do PR ◄──────────────────────   PR aberto
 5. Merge → /fdd-status → próxima wave
```

## Passo 0 — Prepare o contexto (uma vez)

1. `npm run doctor` até ficar tudo verde (exceto PRD).
2. Rode o scaffold e mescle-o (ver [02 — Instalação](02-installation.md)). `./scripts/init.sh` deve subir e responder em `/health`.
3. Preencha `AGENTS.md` e `docs/context/` — mesmo rascunhos curtos mudam muito a qualidade do PRD e das specs. Veja [04 — Contexto](04-adding-context.md).
4. Coloque o design system em `docs/design/` (se houver) e descreva-o em `docs/design/README.md`.

> Dica: `/fdd-context <texto livre>` classifica e grava o conhecimento no arquivo certo de `docs/context/`.

## Passo 1 — PRD

```
Use a skill prd-writer. Projeto: <nome>. Contexto: docs/context/product.md. Saída: docs/
```

- A entrevista é **uma pergunta por vez**. Responda com números concretos (limites, formatos, SLAs): o PRD vira critério de aceite e depois item de contrato.
- Ao final: `docs/PRD.md` + `docs/prd_progress.json`.
- **Revise as Seções 6, 8 e 9** (funcionalidades, grafo de dependências/waves, critérios de aceite). É o ponto mais barato para mudar escopo.
- Regerar o PRD é seguro: o merge do `prd_progress.json` preserva o status das features existentes e marca as removidas como `removed`.

## Passo 2 — Specs (por wave)

```
spec-writer wave 1          # batch: sub-agentes em paralelo, recomendações auto-aceitas
spec-writer F03             # single: entrevista interativa, use para features críticas ou ambíguas
spec-writer F03 create-issue
```

Quando usar cada modo:

| Situação | Modo |
|---|---|
| Foundation features / primeira feature do projeto | single, em sequência |
| Feature com regra de negócio sensível (auth, pagamentos, deleção) | single |
| Demais features de uma wave | batch (`wave <N>`) |

**Revise o `contract.md`** de cada feature antes de implementar. Verifique:

- Coverage Manifest: todo critério de aceite da feature aparece com ao menos um item.
- Prerequisites: usuários/seeds, fixtures e configs fazem sentido e não dependem de serviços externos reais (use fakes).
- Quality gates: os comandos existem no projeto.

Corrigir o contrato aqui custa minutos; descobrir o erro após 3 ciclos de fix custa horas.

## Passo 3 — Implementar e avaliar

### Uma feature

Crie a branch da feature antes (o orquestrador opera na branch atual e se recusa a abrir PR a partir da branch padrão):

```bash
git checkout -b feat/F03-<slug>
```

```
implement-and-evaluate F03
implement-and-evaluate F03 max 5 retries
implement-and-evaluate F03 pause between cycles     # revisa cada ciclo antes de seguir
implement-and-evaluate F03 keep eval env            # mantém o ambiente da última avaliação para inspeção
implement-and-evaluate F03 stub the AI provider     # repassado ao implement-feature
```

Fluxo interno: `implement-feature` (ciclo 0) → `evaluator` → se falhar, `fix-runner` → `evaluator`… até:

| Status final | Significado | O que fazer |
|---|---|---|
| `success` | contrato honrado, PR aberto | revisar e fazer merge |
| `manual-pending` | só restaram itens MANUAL (não automatizáveis) | verificar manualmente e abrir o PR |
| `stuck` | circuit breaker: mesmas falhas sem progresso | ler o último eval-report; normalmente é contrato/spec errado |
| `exhausted` | orçamento de ciclos esgotado (padrão 3) | idem, ou rodar novamente com `max N retries` |
| `aborted` | pré-condição faltando (spec/plan/contract, dependência) | seguir a mensagem |

### Uma wave inteira em paralelo

```
/implement-and-evaluate-tmux wave 2
/implement-and-evaluate-tmux wave 2 except F07 max-parallel=2
/implement-and-evaluate-tmux F04,F05 team-timeout=120m
```

- Cria uma worktree em `.claude/worktrees/F<ID>-<slug>/` e uma janela tmux por feature, cada uma rodando `/implement-and-evaluate`.
- `scripts/resolve-env.sh` isola portas e banco por branch, então as features não colidem.
- Requisitos: tmux, todas as dependências da wave com status `done`, e spec/plan/contract de cada feature.
- Acompanhe com `tmux attach -t iaet-<wave>-<run-id>` (janela 0 = dashboard); o relatório consolidado vai para `.claude/worktrees/.wave-<run-id>/wave-status.md` e para o chat.
- Worktrees de features que falharam são mantidas para inspeção (`keep worktrees` / `clean worktrees` mudam isso).

### Passos avulsos

Úteis para depuração ou quando você quer controle fino:

```
implement-feature F03 only phases 1 and 2
evaluator F03
fix-runner feature=F03 eval-report=docs/F03-<slug>/eval-report-<ts>.md failed-items=API-X-01 cycle=1
fix-runner feature=F03 pr=42 cycle=1    # mescla a base do PR e resolve os conflitos
```

## Passo 4 — PR e próxima wave

1. Revise o PR (o corpo traz ACs, ciclos e artefatos).
2. Faça merge na ordem das dependências.
3. `/fdd-status` — mostra o que está pronto para começar e qual é o próximo comando.
4. Features em `pr-blocked`: rebase/merge manual ou `fix-runner feature=F<ID> pr=<número>`.

## Otimizações que fazem diferença

- **Scaffold antes de tudo.** Spec com código existente é mais precisa e mais rápida.
- **Contexto no lugar certo.** Regra que vale sempre → `AGENTS.md` (curto). Conhecimento de domínio/stack → `docs/context/`. Nunca repita o mesmo conteúdo nos dois.
- **Foundation em sequência, o resto em paralelo.** Wave 1 normalmente é single; a partir da wave 2, batch + tmux.
- **Sessões curtas.** Cada skill roda em sub-agentes com contexto próprio; abra uma sessão nova por wave para não arrastar histórico.
- **Não edite o contrato para passar.** Se o contrato está errado, regenere com `spec-writer F<ID>` (regera os três arquivos juntos).
- **Fakes para serviços externos.** Declare-os em `docs/context/integrations.md`; o contrato e os testes usam a fake, produção usa a implementação real.
- **Evidências versionadas.** eval-reports, screenshots e journals são commitados: o histórico da feature explica decisões futuras.
