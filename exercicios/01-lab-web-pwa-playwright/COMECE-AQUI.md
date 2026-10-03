# COMECE AQUI — Lab Web + PWA 🎬

Perdido? Sequência mínima:

## 1. Clone e entre na pasta certa

```bash
git clone https://github.com/<SEU-USUARIO>/puc-iec-qualidade-web-mobile.git
cd puc-iec-qualidade-web-mobile/exercicios/01-lab-web-pwa-playwright/pratica

# prova de que está no lugar certo:
ls tests/e2e
```

> **Windows:** troque `ls` por `dir` e `/` por `\`.

## 2. Instale e rode o app

```bash
npm install
npx playwright install chromium
npm run dev
```

Abra <http://localhost:5173> → login `aluno@puc.br` / `1234`. Explore o app:
lista, busca, favoritos, detalhe. **É esse app que você vai testar.**

## 3. Rode a suíte como ela vem

```bash
npm run test:e2e
```

Tudo verde? Ótimo — mas os specs 02–05 estão passando **vazios** (os TODOs
estão comentados). Seu trabalho é preenchê-los.

## 4. Leia os resolvidos, depois complete na ordem

1. `tests/e2e/auth.setup.ts` — como o storageState é salvo (resolvido)
2. `tests/e2e/01-login.spec.ts` — locators + assertions modelo (resolvido)
3. `02-busca-mock.spec.ts` → `03-visual.spec.ts` → `04-spa.spec.ts` → `05-pwa-offline.spec.ts`

## 5. Confira seu progresso (`npm run check`)

```bash
cd exercicios/01-lab-web-pwa-playwright/pratica   # confirme o lugar: ls scripts
npm run check
```

Mostra o placar por aula, **mesmo com testes incompletos** (não aborta). Teste que passa
"vazio" (TODO sem asserção) **não conta**:

```
✓ Aula 2 · 01-login: 3/3
✗ Aula 2 · 02-busca-mock: 2/9 — 7 sem asserção (TODO)
```

- **`npm run lint`** pega os erros que mais confundem: `expect` **sem `await`**, `expect`
  **sem matcher** (`.toBeVisible()`…) e `waitForTimeout`. Instale a extensão ESLint do VS Code.
- **Spec 03 (visual) falha na 1ª vez:** ainda não existe baseline. Rode
  `npm run test:visual:update` uma vez, **commite** a pasta `*-snapshots/` e depois `npm run check`.
- **Ver o teste em câmera lenta:** `SLOWMO=800 npx playwright test --headed --workers=1`
  (Windows: `set SLOWMO=800 && npx playwright test --headed --workers=1`).

## 6. Assista o screencast

O screencast da unidade mostra o professor resolvendo o primeiro exercício de
cada spec. Pause, rode, compare.

## Travou?

- `npm run test:e2e:ui` — modo UI do Playwright (timeline + DOM de cada passo)
- `src/utils/testIDs.ts` — todos os seletores do app num arquivo só
- Office hours semanal — link no Canvas
