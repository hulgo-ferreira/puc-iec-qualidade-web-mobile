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

## 4. Leia os resolvidos, depois suba a trilha

1. `tests/e2e/auth.setup.ts` — como o storageState é salvo (resolvido)
2. `tests/e2e/01-login.spec.ts` — locators + assertions modelo (resolvido)
3. Depois siga a trilha abaixo, **do degrau 🟢 ao 🔴**:

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

## 6. (Opcional) Demo Firebase — banner via Remote Config

Na Aula 3 o professor mostra o app lendo um valor do **Firebase Remote Config** (grátis, plano Spark).
Pra ver no seu app: copie `.env.example` para `.env` e preencha as 3 variáveis `VITE_FIREBASE_*`
(o professor passa em aula, ou use as do seu próprio projeto). `npm run dev` → banner no topo.
Sem as variáveis o app roda normal. O teste bônus `tests/e2e-bonus/08-*` mostra como **mockar** essa chamada.

## 6b. (Opcional) Crie a sua conta no CineFav

Na tela de login há o botão **"Criar conta"**: a conta fica **no seu navegador** (a senha é guardada só como *hash*) e você entra com ela depois. A conta de demonstração **`aluno@puc.br` / `1234` continua valendo** (os testes usam ela). Nada para instalar ou programar.

O teste bônus `tests/e2e-bonus/11-cadastro-login.spec.ts` mostra como **testar** o cadastro (conta nova, senha errada, e-mail repetido, senha nunca em texto puro).

## 7. (Opcional) Explore a PWA — o que é "PWA" de verdade

Rode **no build** (o Service Worker não existe no `npm run dev`):

```bash
cd exercicios/01-lab-web-pwa-playwright/pratica
npm run build && npm run preview     # abre http://localhost:4173
```

1. Entre (`aluno@puc.br` / `1234`) e abra **`/pwa`** — o "Raio-X" mostra ao vivo HTTPS, manifest, Service Worker, cache, banco local e rede.
2. No Chrome, procure o ícone **Instalar** na barra de endereço (ou DevTools → Application → Manifest).
3. DevTools → **Network → Offline**, recarregue: o app continua abrindo.
4. Abra um filme, **comente com a rede desligada** (⏳ na fila) e religue a rede (✓ enviado). DevTools → Application → **IndexedDB → cinefav** mostra o dado salvo.
5. Teste automatizado: `npm run test:bonus` (specs `09-pwa-painel` e `10-banco-offline` — não pontuam).

> Posters do TMDB (precisa do token do `.env`): visitou online uma vez → aparecem offline. Veja `Application → Cache storage → cinefav-posters`.

## 8. Assista o screencast

O screencast da unidade mostra o professor resolvendo o primeiro exercício de
cada spec. Pause, rode, compare.

## Travou?

- `npm run test:e2e:ui` — modo UI do Playwright (timeline + DOM de cada passo)
- `src/utils/testIDs.ts` — todos os seletores do app num arquivo só
- Office hours semanal — link no Canvas
