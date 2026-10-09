# Lab Web + PWA — Playwright + Lighthouse (15 pts)

**Disciplina:** Qualidade em Aplicações Web e Mobile
**Aulas:** Aula 2 — Playwright Avançado + Aula 3 — SPA & PWA Testing
**Entrega:** fork + Pull Request no repositório da disciplina
**Valor:** 15 pontos

---

## Contexto

Você recebe o **CineFav Web** — SPA React + PWA **já implementada** (login, busca,
favoritos, detalhe, Service Worker, manifest). Seu trabalho é a **suíte de testes**:
completar os specs Playwright de `pratica/tests/e2e/` e configurar o Lighthouse CI.

Regra de ouro da disciplina: **o app vem pronto; você escreve só os testes.**

> ⚠️ **Os specs avaliativos rodam contra `/qa`, não `/`.** A tela principal (`/`) busca
> filmes de verdade no TMDB — ótima pra ver a UI com dado real, mas inútil pra teste
> determinístico (visual regression, offline). `/qa` é o catálogo fixo/mockado — é lá
> que o critério eliminatório (3 runs consecutivos 100% verde) precisa passar.

As Aulas 2 e 3 demonstram cada técnica ao vivo, e o screencast mostra o
professor resolvendo o primeiro spec de cada tema.

## Antes de começar

```bash
cd exercicios/01-lab-web-pwa-playwright/pratica

# Confirme que está no lugar certo
ls tests/e2e
# → auth.setup.ts  01-login.spec.ts  02-busca-mock.spec.ts ...
```

> **Windows:** `cd exercicios\01-lab-web-pwa-playwright\pratica` e `dir tests\e2e`

```bash
npm install
npx playwright install chromium
npm run test:e2e     # a suíte roda — specs com TODO ainda passam "vazios"
```

## O que você entrega

1. **Os 8 testes 🎯 obrigatórios** (a trilha 🟢→🟡→🔴 está no `COMECE-AQUI.md`), com asserção real: `02` #4 e #7 · `03` #1 e #2 · `04` #1 e #2 · `05` #1 e #3. Os demais testes são treino opcional (⭐) e **não contam nota**.
2. **Baselines de visual regression** commitados (`tests/e2e/03-visual.spec.ts-snapshots/`).
3. **Workflow de CI verde** no seu fork (`.github/workflows/playwright.yml` já fornecido —
   habilite o Actions e anexe o link da run verde no PR).
4. **Lighthouse CI** rodando com os 3 budgets do `lighthouserc.json` (print ou log no PR). A config já vem pronta: basta `npm run build && npm run lighthouse`.

## Critérios de avaliação (15 pts)

| # | Critério | Pontos |
|---|----------|--------|
| 1 | Auth state reuse correto (`storageState` entre testes) | 2 |
| 2 | Network mocking (`route()` — fulfill, abort, unroute) | 2 |
| 3 | Visual regression em 3 viewports com baseline versionado | 3 |
| 4 | SW lifecycle testado (registrado e ativo) | 2 |
| 5 | Offline mode test (`context.setOffline(true)`) | 3 |
| 6 | Lighthouse CI com 3 budgets configurados e rodando | 3 |

**Critério eliminatório:** a suíte deve passar 100% em 3 runs consecutivos
(flakiness é bug do teste, não azar).

> **Nota sobre o critério 1:** o score automático dele combina `auth.setup.ts` (dá hoje,
> na Aula 2) **com** o spec 04 (SPA, Aula 3) — por isso o bot vai comentar um score
> parcial nesse critério até vocês fazerem a Aula 3. Normal, não é erro seu.

## Como entregar

1. Faça **fork** do repositório da disciplina.
2. Trabalhe em `exercicios/01-lab-web-pwa-playwright/pratica/` (edite os specs in-place).
3. Abra um **Pull Request** pro repositório da disciplina.
4. O bot corretor comenta a **nota parcial automática** a cada push; critérios manuais
   (CI verde no fork, Lighthouse) entram na nota final no Canvas.

## Dica de fluxo

- Faça na ordem: 02 → 03 → 04 → 05 (cada spec usa técnicas do anterior).
- `npm run test:e2e:ui` abre o modo UI do Playwright — o melhor debugger da ferramenta.
- Travou num seletor? Todos os `data-testid` estão centralizados em `src/utils/testIDs.ts`.

## 🎁 Bônus (não pontua)

- **Tela principal (`/`) com TMDB de verdade** (`06-discover-tmdb.spec.ts`): pôster real,
  dado real, e um botão "Ver comentários" por filme que busca `/movie/:id/reviews` de
  verdade. O spec mocka **2 domínios externos reais** com `page.route()` (popular +
  reviews), diferente do mock same-origin do spec 02. Não precisa de token pra rodar o
  teste (o route() intercepta antes da chamada sair pra rede); só pra usar a tela
  manualmente. Detalhes em `pratica/README.md`.

> 📘 **Passo a passo de cada exercício:** `pratica/PASSO-A-PASSO.md` (lista resumida em `pratica/README.md`).

- **🔴 Desafio difícil — loader + rede real throttled** *(pra casa, depois dos specs 02-03)*:
  a tela de detalhe do Discover (`/`) tem um loading state enquanto busca o filme de
  verdade no TMDB. Teste esse loader com **rede real desacelerada artificialmente** —
  não mocka o conteúdo, só atrasa a resposta antes de deixar ela seguir pra rede de
  verdade (`route.continue()` depois de um `setTimeout`). Verifique: o loader aparece
  assim que navega, continua visível durante o atraso, e some quando o conteúdo real
  chega. Organize com **Page Object** (scaffold em `pratica/tests/e2e-bonus/`).

  Roda **separado** da suíte avaliativa: `npm run test:bonus` (nunca `test:e2e`) — bate
  em rede real do TMDB, por isso não participa do critério eliminatório nem do CI que
  corrige a Atividade. Precisa de `VITE_TMDB_TOKEN` válido no seu `.env.local` pra
  passar (sem token, TMDB responde 401 — normal, não é bug seu).
