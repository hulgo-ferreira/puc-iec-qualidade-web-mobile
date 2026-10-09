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

import { test, expect, type Page } from '@playwright/test';

async function abrirPagina(page: Page, path: string) {
  await page.goto(path);
}

// ⚠️ PITFALL REAL: o CineFav é uma PWA — o Service Worker intercepta os fetch
// e responde do cache. Requisição que o SW responde NUNCA chega no page.route()!
// Pra testar network mocking, desligamos o SW neste arquivo.
// (Sem esta linha, o teste 4 falha de um jeito misterioso. Guarde esse pitfall.)
test.use({ serviceWorkers: 'block' });

test.describe('Busca + network mocking', () => {
  test.beforeEach(async ({ page }) => {
    await page.unrouteAll();
  });

  test('CT01. Deve abrir a tela de busca', async ({ page }) => {
    await abrirPagina(page, '/search'); 
    await expect(page.getByTestId('search-screen')).toBeVisible();
  });

<<<<<<< HEAD
  // 2. FÁCIL - assert de texto (sem testID ainda)
  test('CT02. Deve mostrar o título da tela de busca', async ({ page }) => {
    await abrirPagina(page, '/search');
    await expect(page.getByRole('heading', { name: 'Buscar' })).toBeVisible();
  });

  // 3. FÁCIL - busca real (sem mock): dado do catálogo aparece
  test('CT03. Deve buscar "Matrix" e mostrar o resultado', async ({ page }) => {
    await abrirPagina(page, '/search');
=======
  // 🧑‍🏫 3. FÁCIL — busca real (sem mock): dado do catálogo aparece
  // ⭐ OPCIONAL — treino, NÃO conta nota (o núcleo que vale nota são os outros testes)
  test('3. buscar "Matrix" mostra o resultado', async ({ page }) => {
    await page.goto('/search');
>>>>>>> bb820e301b6a5730e87d138570ef19cdf600a8f6
    await page.getByTestId('search-input').fill('Matrix');
    await expect(page.getByTestId('search-result-603')).toBeVisible();
  });

<<<<<<< HEAD
  // 4. FÁCIL - Mock: o "backend" devolve um filme que não existe no catálogo
  test('CT04. Deve injetar um filme inventado através do mock', async ({ page }) => {
=======
  // 🧑‍💻 4. FÁCIL — mock: o "backend" devolve um filme que NÃO existe no catálogo
  // 🎯 OBRIGATÓRIO · 🟡 médio — o mock já está escrito; falta só o `expect`
  test('4. route() com fulfill injeta um filme inventado', async ({ page }) => {
    // Intercepta ANTES do goto — rota registrada tarde não intercepta nada.
>>>>>>> bb820e301b6a5730e87d138570ef19cdf600a8f6
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
    await abrirPagina(page, '/search');
    await page.getByTestId('search-input').fill('filme');
    await expect(page.getByTestId('search-result-999')).toBeVisible();
    await expect(page.getByText('O Filme Que Só Existe No Mock')).toBeVisible();
  });

<<<<<<< HEAD
  // 5. FÁCIL - busca vazia (ainda sem mock)
  test('CT05. Deve mostrar vazio quando a busca não encontrar resultados', async ({ page }) => {
    await abrirPagina(page, '/search');
    await page.getByTestId('search-input').fill('xyzw');

    await expect(page.getByTestId('search-empty')).toBeVisible();
=======
  // 🧑‍💻 5. FÁCIL — busca vazia (ainda sem mock)
  // ⭐ OPCIONAL — treino, NÃO conta nota (o núcleo que vale nota são os outros testes)
  test('5. busca sem resultado mostra estado vazio', async ({ page }) => {
    // TODO: sem mock nenhum, busque um título que não existe (ex.: "xyzw")
    // TODO: espere o testID search-empty ficar visível
>>>>>>> bb820e301b6a5730e87d138570ef19cdf600a8f6
  });

  for (const status of [404, 500, 503]) {
    // ⭐ OPCIONAL — treino, NÃO conta nota (o núcleo que vale nota são os outros testes)
    test(`6. catálogo responde ${status} mostra estado de erro`, async ({ page }) => {
      await page.route('**/api/movies.json', (route) =>
        route.fulfill({
          status,
          contentType: 'application/json',
          body: '{}',
        }),
      );

      await abrirPagina(page, '/qa');
      await expect(page.getByTestId('movielist-error')).toBeVisible();
    });
  }

<<<<<<< HEAD
  test('CT07. Deve mostrar erro quando a rede estiver fora do ar, e depois voltar — retry recarrega o catálogo', async ({ page }) => {
    await page.route('**/api/movies.json', (route) => route.abort());

    await abrirPagina(page, '/qa');
    await expect(page.getByTestId('movielist-error')).toBeVisible();

    await page.unroute('**/api/movies.json');
    await page.getByTestId('movielist-retry-button').click();

    await expect(page.getByTestId('movielist-grid')).toBeVisible();
  });

  test('CT08. Prova do pitfall', async ({ page }) => {
    await abrirPagina(page, '/search');
    await page.getByTestId('search-input').fill('Matrix');

    await expect(page.getByTestId('search-result-999999')).toBeVisible();
=======
  // 🧑‍💻 7. 🔴 DESAFIO — recuperação: rede cai, depois volta, retry funciona
  // 🎯 OBRIGATÓRIO · 🔴 o mais difícil — mas é só juntar 4 comandos que já aparecem nos TODOs. Dica: rode com `npm run test:e2e:ui` e veja cada passo na tela
  test('7. rede fora do ar, depois volta — retry recarrega o catálogo', async ({ page }) => {
    // TODO: intercepte '**/api/movies.json' com route.abort() (rede totalmente fora)
    // TODO: navegue pra '/qa' e espere movielist-error
    // TODO: "conserte a rede": page.unroute('**/api/movies.json')
    // TODO: clique em movielist-retry-button e espere movielist-grid aparecer
>>>>>>> bb820e301b6a5730e87d138570ef19cdf600a8f6
  });
});
