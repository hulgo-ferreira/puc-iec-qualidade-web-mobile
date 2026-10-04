// tests/e2e-bonus/10-banco-offline.spec.ts
// ─────────────────────────────────────────────────────────────────────────────
// ⭐ BÔNUS (não pontua) — "banco offline": IndexedDB + Cache Storage
//
// Dois lugares guardam dados no navegador, com papéis diferentes:
//   • IndexedDB (src/services/db.ts) → dados que o APP controla: respostas
//     da API TMDB e os comentários (com fila offline).
//   • Cache Storage (Service Worker)  → arquivos prontos: app shell e POSTERS.
//
// Ler os dois com page.evaluate() é como se testa "persistência" de verdade.
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect, type Page } from '@playwright/test';

const TMDB = '**/api.themoviedb.org/**';

const popular = (poster_path: string | null = null) => ({
  results: [
    { id: 777, title: 'Filme Offline', overview: 'Salvo no IndexedDB.', release_date: '2026-03-01', vote_average: 8.1, poster_path, genre_ids: [18] },
  ],
});

async function waitForSwControl(page: Page) {
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
}

test.describe('Banco offline', () => {
  test('1. lista TMDB sobrevive sem rede (vem do IndexedDB)', async ({ page, context }) => {
    await page.route(TMDB, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(popular()) }));

    await page.goto('/discover');
    await expect(page.getByTestId('discover-title-777')).toHaveText('Filme Offline');
    await waitForSwControl(page);

    // Derruba a rede E o mock: agora o fetch rejeita (TypeError) de verdade.
    await page.unroute(TMDB);
    await context.setOffline(true);
    await page.reload();

    await expect(page.getByTestId('discover-title-777')).toHaveText('Filme Offline');
    await expect(page.getByTestId('discover-from-cache')).toBeVisible();
  });

  test('2. o dado está mesmo gravado no IndexedDB (sem token na chave)', async ({ page }) => {
    await page.route(TMDB, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(popular()) }));
    await page.goto('/discover');
    await expect(page.getByTestId('discover-title-777')).toBeVisible();

    const keys = await page.evaluate(
      () =>
        new Promise<string[]>((resolve, reject) => {
          const open = indexedDB.open('cinefav');
          open.onerror = () => reject(open.error);
          open.onsuccess = () => {
            const req = open.result.transaction('kv').objectStore('kv').getAllKeys();
            req.onsuccess = () => resolve(req.result as string[]);
          };
        }),
    );
    expect(keys).toContain('tmdb:/movie/popular?page=1');
    expect(keys.join()).not.toMatch(/api_key|eyJ/); // nunca grave segredo em storage
  });

  test('3. comentário escrito OFFLINE entra na fila e sincroniza quando a rede volta', async ({ page, context }) => {
    await page.goto('/movie/603');
    await expect(page.getByTestId('detail-title')).toBeVisible();
    await waitForSwControl(page);

    await context.setOffline(true);
    await page.getByTestId('comment-input').fill('Clássico absoluto');
    await page.getByTestId('comment-submit-button').click();

    const item = page.locator('[data-testid^="comment-item-"]').first();
    await expect(item).toContainText('Clássico absoluto');
    await expect(item.locator('[data-status]')).toHaveAttribute('data-status', 'pending');

    // sobrevive a um reload mesmo offline (está no IndexedDB)
    await page.reload();
    await expect(page.locator('[data-testid^="comment-item-"]').first()).toContainText('Clássico absoluto');

    await context.setOffline(false);
    await expect(page.locator('[data-testid^="comment-status-"]').first()).toHaveAttribute('data-status', 'synced');
  });

  test('4. poster visto online fica no Cache Storage (precisa de internet real)', async ({ page }) => {
    // Esta checagem bate no CDN real do TMDB: se não houver rede, pula.
    const poster = '/1E5baAaEse26fej7uHcjOgEE2t2.jpg';
    const reachable = await page.request.get(`https://image.tmdb.org/t/p/w342${poster}`).then((r) => r.ok()).catch(() => false);
    // eslint-disable-next-line playwright/no-skipped-test -- pula quando não há internet real
    test.skip(!reachable, 'sem acesso ao image.tmdb.org');

    await page.route(TMDB, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(popular(poster)) }));
    await page.goto('/discover');
    await waitForSwControl(page);
    await page.reload(); // agora as imagens passam pelo Service Worker (CacheFirst)

    await expect
      .poll(() => page.evaluate(async () => (await (await caches.open('cinefav-posters')).keys()).length), { timeout: 15_000 })
      .toBeGreaterThan(0);
  });
});
