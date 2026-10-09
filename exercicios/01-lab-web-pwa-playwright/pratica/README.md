# CineFav Web — Exercícios (Playwright, SPA e PWA)

App de filmes **já pronto** (React + Vite + PWA). Você **não escreve o app** — só **testes**, completando os `TODO` dos arquivos em `tests/e2e/`.

> 👉 **Como fazer cada um, passo a passo:** [`PASSO-A-PASSO.md`](PASSO-A-PASSO.md). Comece por lá.

```bash
cd exercicios/01-lab-web-pwa-playwright/pratica
ls tests/e2e        # Windows: dir tests\e2e
```
Abra **esta pasta** no editor (`code .`).

## Os 9 exercícios (8 testes + Lighthouse)

Faça **de baixo pra cima**: cada degrau usa o que aprendeu no anterior.

### 🟢 Degrau 1 — Fácil (completar 1 linha)
| # | Exercício | Arquivo |
|---|---|---|
| 1 | O app ficou pronto? (`data-app-ready`) | `04-spa.spec.ts` · teste 1 |
| 2 | A tela de login não mudou (screenshot) | `03-visual.spec.ts` · teste 1 |
| 3 | O Service Worker está ativo? | `05-pwa-offline.spec.ts` · teste 1 |

### 🟡 Degrau 2 — Médio (juntar 2–3 comandos)
| # | Exercício | Arquivo |
|---|---|---|
| 4 | Inventar um filme com mock (`route.fulfill`) | `02-busca-mock.spec.ts` · teste 4 |
| 5 | A navegação não recarrega a página | `04-spa.spec.ts` · teste 2 |
| 6 | A home em 3 tamanhos de tela | `03-visual.spec.ts` · teste 2 |

### 🔴 Degrau 3 — Mais difícil (montar um passo a passo; todos os passos estão nos TODOs)
| # | Exercício | Arquivo |
|---|---|---|
| 7 | A rede cai e volta (retry) | `02-busca-mock.spec.ts` · teste 7 |
| 8 | O app abre sem internet | `05-pwa-offline.spec.ts` · teste 3 |

### 🔦 Extra de entrega
| # | Exercício |
|---|---|
| 9 | Rodar o Lighthouse (`npm run build` + `npm run lighthouse`) e tirar um print |

⭐ Os demais testes dos specs são **treino opcional** (não valem nota). 📘 `01-login.spec.ts` é o modelo resolvido — leia primeiro.

## O que entregar
1. Os 8 testes completos, **verdes 3 vezes seguidas** (`npx playwright test --repeat-each=3`).
2. Os baselines de screenshot commitados (`tests/e2e/03-visual.spec.ts-snapshots/`).
3. Link da **run verde** do GitHub Actions no seu fork.
4. Print do **Lighthouse**.
5. Tudo num **Pull Request** (fork → PR). O bot comenta a nota mínima; a final sai no Canvas.

## Comandos úteis
| Para quê | Comando |
|---|---|
| Rodar tudo | `npm run test:e2e` |
| Ver cada passo na tela | `npm run test:e2e:ui` |
| Rodar só um teste | `npx playwright test 05 -g "offline"` |
| Gerar baselines visuais | `npm run test:visual:update` |
| Gravar o código clicando | `npx playwright codegen http://localhost:4173/qa` |
| Placar de progresso | `npm run check` |
| Avisar `await` esquecido | `npm run lint` |

## 🎁 Bônus (não pontuam)
`tests/e2e/06-discover-tmdb.spec.ts` e `tests/e2e-bonus/` (`npm run test:bonus`). A tela principal `/` usa TMDB real (opcional: `cp .env.example .env.local` e preencha `VITE_TMDB_TOKEN`); os exercícios usam `/qa`, offline e determinístico.
