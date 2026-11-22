# 01 — Visão geral

## O que é este harness

Um conjunto de **skills** (instruções versionadas em `.claude/skills/`) que conduzem um agente de código por um processo de **Feature-Driven Development**:
cada funcionalidade do produto recebe um ID (`F01`, `F02`…), uma especificação técnica, um plano de implementação e um **contrato de comportamento testável**.
A implementação só é considerada pronta quando um avaliador independente exercita cada item do contrato e dá veredito positivo.

Princípios:

- **Contrato é a verdade.** `contract.md` descreve o comportamento observável (HTTP, UI, DB, filesystem) em formato Given/When/Then. O código se adapta ao contrato, nunca o contrário.
- **Quem implementa não avalia.** `implement-feature` produz o código; `evaluator` dá o veredito em um contexto separado; `fix-runner` corrige apenas o que falhou.
- **Estado determinístico.** `docs/prd_progress.json` registra status, ciclos e motivo de falha de cada feature; todas as skills leem e escrevem nele.
- **Skills agnósticas, contexto explícito.** Nenhuma skill conhece seu domínio. O que é específico do projeto fica em `AGENTS.md`, `docs/context/` e `docs/design/`.

## As skills

| Etapa | Skill | Entrada | Saída |
|---|---|---|---|
| 1. Definir | `prd-writer` | descrição do produto + `docs/context/` | `docs/PRD.md` (9 seções) + `docs/prd_progress.json` |
| 2. Especificar | `spec-writer` | `F<ID>` ou `wave <N>` | `docs/F<ID>-<slug>/spec.md`, `plan.md`, `contract.md` |
| 3. Construir | `implement-feature` | pasta da feature | código + 1 commit por fase do plano + fixtures/seeds do contrato |
| 4. Verificar | `evaluator` | pasta da feature | `eval-report-<ts>.md` (+ screenshots para UI) |
| 5. Corrigir | `fix-runner` | eval-report com falhas **ou** conflito de merge | 1 commit `fix(F<ID>): cycle <N> — …` |
| Orquestrar | `implement-and-evaluate` | `F<ID>` | loop 3→4→5→4… até passar, journal `orchestration-<ts>.md`, PR |
| Paralelizar | `implement-and-evaluate-tmux` | `wave <N>` | uma worktree + janela tmux por feature, `wave-status.md` |
| Transversal | `clean-arch` | qualquer mudança de backend | regras, linters, gates e o scaffold fullstack |

Complementos:

- **Agent** `frontend-ui-design` — rubrica (Design Quality, Originality, Craft, Functionality) para avaliar UI sem complacência.
- **Commands** `/fdd-status` (próximo passo), `/fdd-context` (registrar contexto), `/implement-and-evaluate-tmux`.

## Artefatos de uma feature

```
docs/F03-<slug>/
├── spec.md                      # 7 seções: overview, impacto, decisões, componentes, API, dados, testes
├── plan.md                      # fases e passos (1 commit por fase)
├── contract.md                  # Prerequisites, Quality gates, Coverage Manifest, itens SVC/API/UI/E2E…
├── eval-report-<ts>.md          # um por execução do evaluator
├── eval-screenshots-<ts>/       # evidências visuais (UI/E2E)
└── orchestration-<ts>.md        # journal do implement-and-evaluate
```

Veja exemplos abstratos em [`docs/templates/`](../templates/).

## Ciclo de vida do status (`prd_progress.json`)

```
pending ──► implementing ──► implemented ──► done
                 │                 │
                 └──► fail ◄───────┘          pr-blocked (passou na avaliação, mas o merge com main conflitou)
                                              removed    (saiu do PRD; histórico preservado)
```

- `cycles` conta quantos ciclos do `fix-runner` foram gastos.
- `failure_reason` explica `fail` / `pr-blocked` em uma linha.
- `report_path` aponta para o último eval-report.

## Waves e dependências

O PRD calcula **waves** a partir do grafo de dependências: wave 1 = features sem dependências; wave N = features cujas dependências estão todas em waves anteriores.
Features da mesma wave podem ser especificadas e implementadas em paralelo. **Foundation features** (scaffold, layout, auth, banco) devem ser feitas em sequência antes das demais em um projeto novo.
