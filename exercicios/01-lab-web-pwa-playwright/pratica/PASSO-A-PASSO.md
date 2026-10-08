# Passo a passo — Lab Web + PWA 🎬

Siga **na ordem**. Cada passo diz **o que abrir**, **o que escrever**, **como rodar** e **o que deve acontecer**. A lista só dos exercícios está no [`README.md`](README.md).

> Você **não escreve o app** — escreve os **testes**. E não precisa programar bem: quase tudo é **completar uma linha** que já está comentada no arquivo.

---

## Parte 0 — Preparar o ambiente (uma vez só)

```bash
# 1) entre na pasta certa
cd exercicios/01-lab-web-pwa-playwright/pratica
ls tests/e2e          # tem que listar: auth.setup.ts  01-login.spec.ts  02-busca-mock.spec.ts ...
```
> **Windows:** `cd exercicios\01-lab-web-pwa-playwright\pratica` e `dir tests\e2e`

```bash
# 2) instale
npm install
npx playwright install chromium

# 3) abra ESTA pasta no VS Code (senão o editor não acha o projeto)
code .
```

**Teste o ambiente:** rode `npm run test:e2e`. Tudo verde? Ótimo — mas está "verde vazio": os testes ainda têm `TODO`. É o seu trabalho completar.

**Conheça o app** (2 min): `npm run dev` → abra <http://localhost:5173> → entre com `aluno@puc.br` / `1234` (ou **Criar conta**). Navegue: lista, busca, favoritos, detalhe. **É esse app que você vai testar.**

---

## Como rodar **só um** teste (use sempre!)

```bash
npx playwright test 04-spa -g "pronto"      # só o spec 04, só o teste com "pronto" no nome
npm run test:e2e:ui                          # Modo UI: mostra cada passo na tela (recomendado!)
npm run check                                # placar: quantos testes de cada spec estão completos
```

- **Modo UI:** clique no teste → veja o **antes/depois** de cada linha. Se algo falhar, a tela mostra **onde**.
- **Gravador** (se travar): `npx playwright codegen http://localhost:4173/qa` abre o app e **escreve o código** enquanto você clica. Copie o trecho útil.
- **`await`:** quase toda linha do Playwright começa com `await`. Esqueceu? O teste passa "vazio". Rode `npm run lint` para ele avisar.

---

# 🟢 Degrau 1 — Fácil (1 linha cada)

## Exercício 1 — O app ficou pronto? (`04-spa.spec.ts`, teste 1)

**Ideia:** não clique antes de o app estar pronto. O app avisa quando está pronto colocando `data-app-ready="true"` na página.

1. Abra `tests/e2e/04-spa.spec.ts` e ache o **teste 1**.
2. Depois do `page.goto('/qa')`, escreva a linha que **espera o atributo**:
   ```ts
   await expect(page.locator('html')).toHaveAttribute('data-app-ready', ___);   // troque ___ pelo valor
   ```
3. Rode: `npx playwright test 04-spa -g "pronto"`

✅ **Pronto quando:** o teste passa (verde) e **não tem mais `TODO`** nele.

## Exercício 2 — A tela de login não mudou (`03-visual.spec.ts`, teste 1)

**Ideia:** tirar uma "foto" da tela de login. Nas próximas execuções, o Playwright compara a tela com a foto e avisa se algo mudou.

1. Abra `tests/e2e/03-visual.spec.ts`, **teste 1**.
2. Descomente/escreva a linha do screenshot:
   ```ts
   await expect(page).toHaveScreenshot('login.png');
   ```
3. **A 1ª vez vai falhar** — é normal: ainda não existe a foto. Crie-a:
   ```bash
   npm run test:visual:update
   ```
4. Rode de novo: `npx playwright test 03-visual -g "login"` → agora **passa**.

✅ **Pronto quando:** passa e existe o arquivo `tests/e2e/03-visual.spec.ts-snapshots/login-...png`.

## Exercício 3 — O Service Worker está ativo? (`05-pwa-offline.spec.ts`, teste 1)

**Ideia:** um PWA tem um "porteiro" (Service Worker). O teste confere que ele chegou ao estado final.

1. Abra `tests/e2e/05-pwa-offline.spec.ts`, **teste 1**.
2. Já existe `.toBeDefined()` no fim. Troque por conferir o estado final do SW:
   ```ts
   .toBe('___')      // qual é o estado final do Service Worker? (dica: está no comentário do teste)
   ```
3. Rode: `npx playwright test 05 -g "Service Worker"`

✅ **Pronto quando:** passa. *(O SW só existe no **build**; o `playwright.config.ts` já cuida disso.)*

---

# 🟡 Degrau 2 — Médio (juntar 2 ou 3 comandos)

## Exercício 4 — Inventar um filme com mock (`02-busca-mock.spec.ts`, teste 4)

**Ideia:** em vez de usar o servidor de verdade, o teste **responde no lugar dele** com um filme inventado. Assim você controla o "backend".

1. Abra `02-busca-mock.spec.ts`, **teste 4**. O **mock já está escrito** (`page.route(...)` com `route.fulfill(...)`).
2. Falta só **conferir o resultado**. Escreva dois `expect`:
   - o resultado `search-result-999` está **visível**;
   - o título **"O Filme Que Só Existe No Mock"** aparece.
   ```ts
   await expect(page.getByTestId('search-result-___')).___();
   await expect(page.getByText('___')).___();
   ```
3. Rode: `npx playwright test 02 -g "fulfill"`

✅ **Pronto quando:** passa. Você provou que o teste controla o backend.

## Exercício 5 — A navegação não recarrega a página (`04-spa.spec.ts`, teste 2)

**Ideia:** num app SPA, ir para outra tela **não recarrega** a página. O teste guarda um "bilhete" (`42`) no navegador; se o bilhete sobreviver, não houve recarga.

1. Em `04-spa.spec.ts`, **teste 2**: o bilhete já é colocado e a navegação já acontece.
2. Falta **ler o bilhete de volta** e conferir:
   ```ts
   const marker = await page.evaluate(() => (window as any).__spaMarker);
   expect(marker).___(42);
   ```
3. Rode: `npx playwright test 04-spa -g "estado do JS"`

✅ **Pronto quando:** passa.

## Exercício 6 — A home em 3 tamanhos de tela (`03-visual.spec.ts`, teste 2)

**Ideia:** o mesmo screenshot, mas em **celular, tablet e desktop**. Um `for` já repete o teste 3 vezes; a lista `VIEWPORTS` está pronta.

1. Em `03-visual.spec.ts`, **teste 2** (dentro do `for`), siga os `TODO` **na ordem**:
   1. mude o tamanho da tela: `await page.setViewportSize({ width: vp.width, height: vp.height });`
   2. vá para `/qa` e **espere** `movielist-grid` ficar visível;
   3. tire o screenshot **com o nome do tamanho**: `` `home-${vp.name}.png` `` (use `fullPage: true`).
2. Crie as fotos: `npm run test:visual:update` e depois rode `npx playwright test 03-visual` → passa nos 3 tamanhos.

✅ **Pronto quando:** 3 testes passam e existem 3 fotos (`home-mobile`, `home-tablet`, `home-desktop`).

---

# 🔴 Degrau 3 — Mais difícil (passo a passo — mas obrigatório)

Esses dois são **mais longos**, mas **todos os passos estão nos `TODO`** do arquivo. Faça **um comando por vez** e rode no **Modo UI** (`npm run test:e2e:ui`) para ver cada passo.

## Exercício 7 — A rede cai e volta (`02-busca-mock.spec.ts`, teste 7)

**Ideia:** simular uma **queda de internet**, ver o app mostrar o erro, "consertar a rede" e ver o botão *Tentar de novo* recuperar a lista.

Os 4 passos, **nesta ordem** (cada um é 1–2 linhas):
1. **Derrubar a rede** para o catálogo: `page.route('**/api/movies.json', route => route.abort())`
2. **Abrir** `/qa` e **esperar** o aviso de erro (`movielist-error`)
3. **Consertar a rede:** `page.unroute('**/api/movies.json')`
4. **Clicar** em *Tentar de novo* (`movielist-retry-button`) e **esperar** a lista (`movielist-grid`) aparecer

> 💡 Repare: os passos 2 e 4 são `expect(...).toBeVisible()`; os passos 1 e 3 são "mexer na rede". Escreva **um passo, rode, escreva o próximo**.

Rode: `npx playwright test 02 -g "rede fora do ar"`

✅ **Pronto quando:** passa.

## Exercício 8 — O app abre sem internet (`05-pwa-offline.spec.ts`, teste 3)

**Ideia:** o grande poder do PWA. Visitar **online**, ficar **offline**, **recarregar** e o app ainda abrir.

Os passos, **nesta ordem** (a ordem é o segredo):
1. **Visitar** `/qa` e esperar `movielist-grid` aparecer (online)
2. **Esperar o Service Worker assumir a página:** `page.waitForFunction(() => navigator.serviceWorker.controller !== null)`
3. **Ficar offline:** `context.setOffline(true)`
4. **Recarregar:** `page.reload()`
5. **Conferir:** a lista (`movielist-grid`) **de novo** visível **e** o aviso `offline-banner` visível

> ⚠️ **O erro nº 1:** pular o passo 2. Sem esperar o Service Worker, o teste passa às vezes e falha outras. (Veja o slide "Ciclo de vida do SW".)

Rode: `npx playwright test 05 -g "offline"`

✅ **Pronto quando:** passa **3 vezes seguidas** (`npx playwright test 05 --repeat-each=3`).

---

# 🔦 Exercício 9 — Lighthouse (não precisa escrever código)

```bash
npm run build
npm run lighthouse      # roda 3 vezes e confere os 3 "budgets" (metas de velocidade)
```
✅ **Pronto quando:** termina sem `error`. **Tire um print** ou copie o log — vai no PR.

---

# 📦 Entrega

1. **Tudo verde 3 vezes seguidas:** `npx playwright test --repeat-each=3` *(critério eliminatório)*. As fotos de screenshot podem falhar na 1ª vez — gere antes com `npm run test:visual:update`.
2. **Commite** as fotos (`tests/e2e/03-visual.spec.ts-snapshots/`) e os testes.
3. **Habilite o GitHub Actions** no seu fork (aba *Actions*) — o workflow já vem pronto — e copie o **link da run verde**.
4. **Abra o Pull Request** para o repositório da disciplina e inclua: o **link da run verde** e o **print do Lighthouse**.
5. O bot comenta a **nota mínima** automática. A nota final sai no Canvas.

## 🆘 Travou?
| Sintoma | O que fazer |
|---|---|
| `Cannot find module` / erro estranho | você abriu a pasta errada → feche e rode `code .` **dentro** de `pratica/` |
| O teste passa "vazio" | falta `await` ou falta o `expect` → `npm run lint` mostra |
| Visual falha na 1ª vez | normal: rode `npm run test:visual:update` |
| Offline passa às vezes | faltou esperar o `controller` do Service Worker (Exercício 8, passo 2) |
| Não sabe qual seletor usar | rode o **gravador**: `npx playwright codegen http://localhost:4173/qa` |
| Mais ajuda | pergunte no canal da turma com **print** do erro |
