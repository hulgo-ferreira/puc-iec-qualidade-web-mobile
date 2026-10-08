# CineFav Web — prática de Playwright, SPA e PWA

App de filmes **já implementado** (React + Vite + PWA). Você **não escreve UI** —
escreve os **testes**: os specs em `tests/e2e/` têm TODOs marcando o que falta.

**Duas áreas, propósitos diferentes:**

- **`/`** — tela principal, busca filmes de verdade no TMDB (pôster + comentários reais).
  Precisa de internet; dado muda (não é usada pelos specs avaliativos).
- **`/qa`** — o app original, mesmo produto do CineFav mobile (Lab Maestro): mesmas
  telas, mesmos `data-testid`, mesmo dataset mockado — **offline, sem token,
  determinístico**. É aqui que os specs 01-05 (avaliativos) rodam.

> Por quê a separação? Teste de verdade (visual regression, offline) precisa de dado
> fixo — ver comentário em `src/services/api.ts`. `/qa` garante isso; `/` é só pra
> mostrar a mesma UI com dado real.

## Setup

```bash
cd exercicios/01-lab-web-pwa-playwright/pratica

# confirme que está no lugar certo:
ls tests/e2e
# → deve mostrar: auth.setup.ts  01-login.spec.ts  02-busca-mock.spec.ts ...
```

> **Windows:** `cd exercicios\01-lab-web-pwa-playwright\pratica` e `dir tests\e2e`

```bash
npm install
npx playwright install chromium

# rodar o app (dev):
npm run dev          # http://localhost:5173  (login: aluno@puc.br / 1234)

# rodar a suíte E2E (builda e testa contra o preview — o SW só existe no build):
npm run test:e2e
```

> **Abra ESTA pasta no editor** (`code .` dentro de `pratica/`) — senão o TS e a
> extensão do Playwright não acham o projeto.

## 🧭 A trilha — do fácil ao difícil (você não precisa saber programar bem)

Os testes estão em **3 degraus**. Faça **de baixo pra cima**: cada degrau usa o que você aprendeu no anterior. Cada teste tem uma **etiqueta** (🟢🟡🔴) e **dicas dentro do próprio arquivo** — leia os comentários!

| Degrau | O que é | Testes que **valem nota** (🎯 obrigatórios) | Treino extra (⭐ opcional) |
|---|---|---|---|
| 🟢 **1 · Fácil** | completar **1 linha** (o `expect`) | `03` #1 login · `04` #1 app pronto · `05` #1 SW ativo | `02` #3 · #5 |
| 🟡 **2 · Médio** | juntar **2 ou 3 comandos** | `02` #4 mock · `03` #2 3 telas · `04` #2 estado do JS | `03` #3 · `04` #3 · #4 · `05` #2 · `02` #6 |
| 🔴 **3 · Mais difícil** | montar um **passo a passo** (todos os passos estão nos TODOs) | `02` #7 rede cai e volta · `05` #3 offline | — |

**Total que vale nota: 8 testes.** Os outros são treino (não precisa fazer, mas ajuda).

### 💡 Dicas pra quem não programa muito
- **Gravador:** `npx playwright codegen http://localhost:4173/qa` abre o app e **escreve o código por você** enquanto você clica. Copie o trecho e cole no teste.
- **Modo UI:** `npm run test:e2e:ui` mostra **cada passo do teste na tela** (com "antes/depois"). Ótimo pra entender onde travou.
- **`await`:** quase toda linha do Playwright começa com `await`. Se esquecer, o teste passa "vazio" — o `npm run lint` avisa.
- **Travou?** Rode só um teste: `npx playwright test 05 -g "offline"`.
- **Confira o progresso:** `npm run check` mostra quantos testes de cada spec estão completos.

### Os arquivos

| Spec | Tema | Aula |
|------|------|------|
| `auth.setup.ts` · `01-login.spec.ts` | 📘 storageState + locators (resolvidos — leia primeiro) | Playwright Avançado |
| `02-busca-mock.spec.ts` | network mocking com `route()` | Playwright Avançado |
| `03-visual.spec.ts` | visual regression, 3 viewports | Visual Regression + CI |
| `04-spa.spec.ts` | app-ready e estado do JS na navegação | Testando SPAs |
| `05-pwa-offline.spec.ts` | Service Worker e modo offline | Testando PWAs |
| `06-discover-tmdb.spec.ts` · `e2e-bonus/*` | 🎁 bônus — não pontuam | — |

📘 = modelo resolvido · 🎯 = obrigatório (vale nota) · ⭐ = opcional · 🎁 = bônus

## 🎁 Bônus — tela principal (`/`) com TMDB de verdade

A tela principal busca de verdade em `api.themoviedb.org` (pôster real + comentários
reais via `/movie/:id/reviews`). Pra usar manualmente (não precisa pra rodar os
testes — `06-discover-tmdb.spec.ts` intercepta a chamada):

```bash
cp .env.example .env.local
# edite .env.local com seu VITE_TMDB_TOKEN (veja instruções no arquivo)
npm run dev
# a tela principal já abre com os filmes reais
```

`06-discover-tmdb.spec.ts` roda sem token nenhum — `page.route('**/api.themoviedb.org/**', ...)`
intercepta a chamada antes dela sair pra rede de verdade. Diferença do spec 02: lá o mock é
same-origin (`/api/movies.json`, o próprio servidor); aqui é um domínio externo de verdade —
mais parecido com o que você vai mockar num app em produção.

## 🔴 Desafio difícil — loader + rede real throttled

Em `tests/e2e-bonus/` (pasta própria, config própria — veja `playwright.bonus.config.ts`).
Diferente do spec 06, este **não mocka o conteúdo** — intercepta a request real do TMDB,
espera um pouco (`setTimeout`) e só depois deixa ela seguir (`route.continue()`). Prova que
o loading state do `DiscoverDetail` aparece e depois some de verdade.

```bash
cp .env.example .env.local   # precisa de VITE_TMDB_TOKEN válido — sem token, TMDB responde 401
npm run test:bonus
```

Roda **separado** da suíte avaliativa — nunca entra no `npm run test:e2e` nem no CI que
corrige a Atividade (bate em rede real, não pode travar o critério eliminatório de ninguém).

## Visual regression

```bash
npm run test:visual:update   # 1ª vez: gera os baselines na SUA máquina
npm run test:visual          # depois: compara contra o baseline
```

## Lighthouse CI

```bash
npm run build
npm run lighthouse           # roda 3x contra ./dist com budgets do lighthouserc.json
```

## CI (GitHub Actions)

`.github/workflows/playwright.yml` — suíte com **sharding 2-way + blob reports
mesclados**. Habilite o Actions no seu fork pra rodar.
