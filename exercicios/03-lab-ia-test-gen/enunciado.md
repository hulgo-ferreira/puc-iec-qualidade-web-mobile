# Lab IA — Pipeline Test Generation (15 pts)

**Disciplina:** Qualidade em Aplicações Web e Mobile
**Aula:** Aula 5 — IA Avançada
**Entrega:** fork + Pull Request no repositório da disciplina
**Valor:** 15 pontos

---

## Contexto

Você recebe um pipeline **parcialmente implementado**: user story → LLM gera
teste Playwright → executa contra o CineFav Web → healing loop em caso de falha.
O gerador (`src/01-gen-test.ts`) vem resolvido; você completa o **healing loop** e o
**visual diff**, cria uma story própria e escreve o **relatório crítico** — o
componente mais importante deste lab.

## Antes de começar

```bash
cd exercicios/03-lab-ia-test-gen/pratica

# Confirme que está no lugar certo
ls src
# → 01-gen-test.ts  02-healing-loop.ts  03-visual-diff.ts  lib
```

> **Windows:** `cd exercicios\03-lab-ia-test-gen\pratica` e `dir src`

```bash
npm install
cp .env.example .env    # cole seu token GitHub (grátis — instruções no arquivo)
```

Pré-requisito: lab 02 buildado (é o app alvo) — instruções no `pratica/README.md`.

## O que você entrega

1. **`src/02-healing-loop.ts` completo** — re-prompt em falha, máx 3 tentativas,
   diff impresso pra auditoria.
2. **`src/03-visual-diff.ts` completo** — pixelmatch, drift %, gate de 1%.
3. **Uma user story SUA** em `stories/` (fluxo diferente de favoritar) + o spec
   gerado commitado em `generated/` + evidência do healing (log no PR).
4. **Relatório crítico** (`RELATORIO.md`, ~3 páginas).

## Critérios de avaliação (15 pts)

| # | Critério | Pontos |
|---|----------|--------|
| 1 | Pipeline funcional (story → teste → execução, sem intervenção manual) | 6 |
| 2 | Healing loop (re-prompt em falha, máx 3 tentativas, auditável) | 4 |
| 3 | Relatório crítico (3 pgs) identificando limites reais | 5 |

**Pontos do relatório crítico:**
- Tipos de teste em que a IA acertou vs falhou
- Oracle problem: como você detectou (ou detectaria) asserção errada
- Custo em tokens e latência observada (o pipeline imprime — colete!)
- Comparação com os testes que você escreveu à mão no lab 02

## Como entregar

1. Fork do repositório da disciplina → trabalhe em `exercicios/03-lab-ia-test-gen/pratica/`.
2. **NUNCA commite seu token** — o `.gitignore` já protege o `.env`; confira antes do push.
3. Abra o PR. O bot corretor comenta a nota parcial automática; o relatório é
   avaliado manualmente no Canvas.

## Custo e modelos

- **Você não paga nada**: o default é o GitHub Models (token grátis da sua conta
  GitHub). O free tier tem limite diário de requisições — planeje as rodadas e
  anote o impacto no relatório (é dado real de operação de IA).
- **Story curta gera teste melhor** no modelo grátis: 3–4 critérios, cada um com
  o `data-testid` exato.
- A comparação com **Claude** que aparece na aula é **demonstração do professor**
  (modelo pago, qualidade superior) — **não é critério de avaliação**.

## Dica

O healing que "cura" enfraquecendo a asserção é o anti-pattern central da Aula 5.
Se o seu log mostrar isso acontecendo — **documente no relatório**: é exatamente o
tipo de limite real que vale ponto.
