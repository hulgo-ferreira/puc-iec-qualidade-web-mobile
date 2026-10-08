// tests/e2e-bonus/08-remote-config-banner.spec.ts
// ─────────────────────────────────────────────────────────────────────────────
// ⭐ BÔNUS (não pontua) — mockar uma API de TERCEIRO (Firebase Remote Config)
//
// O banner busca `banner_message` em firebaseremoteconfig.googleapis.com.
// Em teste a gente NÃO bate no Firebase de verdade (rede + credencial = flaky):
// interceptamos a chamada com page.route() e controlamos a resposta.
//
// Rodar: npm run test:bonus  (o playwright.bonus.config.ts injeta credenciais
// FALSAS no build só pra ligar o recurso — nenhuma chamada real sai).
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';

const FETCH_URL = '**/firebaseremoteconfig.googleapis.com/**';

test.describe('Banner via Remote Config (mock)', () => {
  test('1. mostra o banner com o valor que o servidor devolve', async ({ page }) => {
    await page.route(FETCH_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ entries: { banner_message: 'Promo de teste ativa!' } }),
      }),
    );

    await page.goto('/qa');

    await expect(page.getByTestId('remote-banner')).toHaveText('Promo de teste ativa!');
  });

  test('2. se o Firebase falhar (500), o app segue sem banner', async ({ page }) => {
    await page.route(FETCH_URL, (route) => route.fulfill({ status: 500 }));

    await page.goto('/qa');

    await expect(page.getByTestId('movielist-grid')).toBeVisible();
    await expect(page.getByTestId('remote-banner')).toHaveCount(0);
  });

  test('3. o banner se atualiza sozinho (consulta o Remote Config a cada 15 s)', async ({ page }) => {
    let chamadas = 0;
    await page.route(FETCH_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ entries: { banner_message: chamadas++ === 0 ? 'Texto 1' : 'Texto 2' } }),
      }),
    );

    await page.clock.install(); // relógio simulado: dá pra "pular" 15 s sem esperar de verdade
    await page.goto('/qa');
    await expect(page.getByTestId('remote-banner')).toHaveText('Texto 1');

    await page.clock.fastForward(16_000); // o professor publicou outro texto; passou o intervalo
    await expect(page.getByTestId('remote-banner')).toHaveText('Texto 2');
  });
});
