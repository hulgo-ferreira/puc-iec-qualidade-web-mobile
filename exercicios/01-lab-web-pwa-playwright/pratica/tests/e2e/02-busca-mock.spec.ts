// tests/e2e/02-busca-mock.spec.ts
// ─────────────────────────────────────────────────────────────────────────────
// ✅ AVALIATIVO — network mocking com page.route()
//
// O catálogo do CineFav vem de GET /api/movies.json. Interceptando essa rota
// você controla o "backend" sem backend: injeta dados inventados, simula
// erro de rede, testa estados que o dado real nunca produziria.
//
// Legenda:  🧑‍🏫 = professor faz no screencast · 🧑‍💻 = você faz sozinho
//           FÁCIL = arrange/act prontos, você escreve o expect
//           🔴 DESAFIO = você escreve o teste inteiro
//
// Progressão (fica mais difícil de cima pra baixo):
//   1-2  só navegar + 1 assert (sem mock)
//   3    busca real (sem mock ainda, mas já por testID específico)
//   4    1º mock (fulfill já escrito, só falta o assert)
//   5    busca vazia (ainda sem mock — só muda o caso de teste)
//   6-7  desafio: mock inteiro do zero
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';

// ⚠️ PITFALL REAL: o CineFav é uma PWA — o Service Worker intercepta os fetch
// e responde do cache. Requisição que o SW responde NUNCA chega no page.route!
// Pra testar network mocking, desligamos o SW neste arquivo.
// (Sem esta linha, o teste 4 falha de um jeito misterioso. Guarde esse pitfall.)
test.use({ serviceWorkers: 'block' });

test.describe('Busca + network mocking', () => {
  // 🧑‍🏫 1. FÁCIL — só navegar: a tela abriu?
  test('1. abrir a tela de busca', async ({ page }) => {
    await page.goto('/search');

    // TODO: espere a tela ficar visível.
    // Dica: o testID da tela é search-screen.
    // await expect(page.getByTestId('search-screen'))....
  });

  // 🧑‍🏫 2. FÁCIL — assert de texto (sem testID ainda)
  test('2. título da tela de busca aparece', async ({ page }) => {
    await page.goto('/search');

    // TODO: espere o texto "Buscar" ficar visível.
    // Dica: page.getByText('Buscar') — é o <h1> da tela.
    // await expect(page.getByText('Buscar'))....
  });

  // 🧑‍🏫 3. FÁCIL — busca real (sem mock): dado do catálogo aparece
  // ⭐ OPCIONAL — treino, NÃO conta nota (o núcleo que vale nota são os outros testes)
  test('3. buscar "Matrix" mostra o resultado', async ({ page }) => {
    await page.goto('/search');
    await page.getByTestId('search-input').fill('Matrix');

    // TODO: espere o resultado da busca ficar visível.
    // Dica: o testID de resultado é search-result-<id> e o id do Matrix é 603.
    // await expect(page.getByTestId('search-result-603'))....
  });

  // 🧑‍💻 4. FÁCIL — mock: o "backend" devolve um filme que NÃO existe no catálogo
  // 🎯 OBRIGATÓRIO · 🟡 médio — o mock já está escrito; falta só o `expect`
  test('4. route() com fulfill injeta um filme inventado', async ({ page }) => {
    // Intercepta ANTES do goto — rota registrada tarde não intercepta nada.
    await page.route('**/api/movies.json', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 999,
            title: 'O Filme Que Só Existe No Mock',
            overview: 'Prova de que o teste controla o backend.',
            release_date: '2026-01-01',
            vote_average: 9.9,
          },
        ]),
      }),
    );

    await page.goto('/search');
    await page.getByTestId('search-input').fill('mock');

    // TODO: verifique que o resultado search-result-999 está visível
    // TODO: verifique que o título "O Filme Que Só Existe No Mock" aparece
  });

  // 🧑‍💻 5. FÁCIL — busca vazia (ainda sem mock)
  // ⭐ OPCIONAL — treino, NÃO conta nota (o núcleo que vale nota são os outros testes)
  test('5. busca sem resultado mostra estado vazio', async ({ page }) => {
    // TODO: sem mock nenhum, busque um título que não existe (ex.: "xyzw")
    // TODO: espere o testID search-empty ficar visível
  });

  // 🧑‍💻 6. 🔴 DESAFIO — matriz de erros HTTP: o catálogo falha de formas diferentes
  // Mesmo padrão do teste 4 (route.fulfill) — só troca o status. Raciocínio de
  // QA (equivalência de classes, ISTQB): 404 representa falha 4xx (erro do
  // cliente), 500 e 503 representam falha 5xx (erro do servidor — 503 é a
  // mais comum em indisponibilidade real). 1 caso por classe, não repetição.
  for (const status of [404, 500, 503]) {
    // ⭐ OPCIONAL — treino, NÃO conta nota (o núcleo que vale nota são os outros testes)
    test(`6. catálogo responde ${status} mostra estado de erro`, async ({ page }) => {
      // TODO: route.fulfill com este status (contentType json, body '{}')
      // TODO: navegue pra '/qa'
      // TODO: espere o testID movielist-error ficar visível
    });
  }

  // 🧑‍💻 7. 🔴 DESAFIO — recuperação: rede cai, depois volta, retry funciona
  // 🎯 OBRIGATÓRIO · 🔴 o mais difícil — mas é só juntar 4 comandos que já aparecem nos TODOs. Dica: rode com `npm run test:e2e:ui` e veja cada passo na tela
  test('7. rede fora do ar, depois volta — retry recarrega o catálogo', async ({ page }) => {
    // TODO: intercepte '**/api/movies.json' com route.abort() (rede totalmente fora)
    // TODO: navegue pra '/qa' e espere movielist-error
    // TODO: "conserte a rede": page.unroute('**/api/movies.json')
    // TODO: clique em movielist-retry-button e espere movielist-grid aparecer
  });
});
