// tests/e2e/05-pwa-offline.spec.ts
// ─────────────────────────────────────────────────────────────────────────────
// ✅ AVALIATIVO — PWA: Service Worker, manifest e modo offline
//
// Estes testes rodam contra o BUILD (vite preview) — o SW não existe no dev
// server. O playwright.config.ts já cuida disso.
//
// A sequência clássica do teste offline:
//   1. visita online (SW instala e cacheia)
//   2. espera o SW CONTROLAR a página (não basta registrado!)
//   3. context.setOffline(true)
//   4. recarrega → o app precisa continuar funcionando
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';

test.describe('PWA', () => {
  // ⚠️ Toda visita deste spec é pra '/qa', não '/'. "/" hoje é a tela
  // Discover (dado real do TMDB) — testar offline ali não faz sentido,
  // já que a tela depende de internet pra existir. '/qa' é o catálogo
  // fixo/cacheável que o Service Worker consegue servir sem rede.

  // 🧑‍🏫 1. FÁCIL — Service Worker registrado e ativo
  // 🎯 OBRIGATÓRIO · 🟢 fácil — falta só trocar o valor esperado
  test('1. Service Worker fica ativo após a primeira visita', async ({ page }) => {
    await page.goto('/qa');
    await expect(page.getByTestId('movielist-grid')).toBeVisible();

    // serviceWorker.ready resolve com o worker ainda em "activating" —
    // expect.poll re-consulta até o estado terminal.
    await expect
      .poll(() =>
        page.evaluate(async () => {
          const reg = await navigator.serviceWorker.getRegistration();
          return reg?.active?.state;
        }),
      )
      // TODO: complete a asserção — o estado terminal do SW é 'activated'
      .toBeDefined(); // troque por .toBe('...')
  });

  // 🧑‍💻 2. FÁCIL — manifest válido e linkado
  // ⭐ OPCIONAL — treino, NÃO conta nota (o núcleo que vale nota são os outros testes)
  test('2. manifest da PWA está linkado e tem os campos mínimos', async ({ page }) => {
    await page.goto('/qa');

    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestHref).toBeTruthy();

    // Busca o manifest e valida os campos que a instalação exige.
    const manifest = await page.evaluate(async (href) => {
      const res = await fetch(href!);
      return res.json();
    }, manifestHref);

    // TODO: expect(manifest.name) contém 'CineFav'
    // TODO: expect(manifest.display).toBe('standalone')
    // TODO: expect(manifest.icons.length).toBeGreaterThanOrEqual(2)
  });

  // 🧑‍💻 3. 🔴 DESAFIO — o app funciona OFFLINE
  // 🎯 OBRIGATÓRIO · 🔴 mais difícil — 4 passos em ordem (visitar → esperar o SW → ficar offline → recarregar); os TODOs já listam todos
  test('3. catálogo continua acessível offline', async ({ page, context }) => {
    // Passo 1: visita online.
    // TODO: goto('/qa') e espere movielist-grid

    // Passo 2: espere o SW CONTROLAR a página. "activated" não basta —
    // quem responde navegação offline é o CONTROLLER desta página:
    // TODO: await page.waitForFunction(() => navigator.serviceWorker.controller !== null)

    // Passo 3: derruba a rede DO CONTEXTO (não da sua máquina).
    // TODO: await context.setOffline(true)

    // Passo 4: recarrega — o SW serve app shell + /api/movies.json do cache.
    // TODO: await page.reload()
    // TODO: espere movielist-grid visível DE NOVO (dados do cache!)
    // TODO: espere o banner offline-banner aparecer

    // Bônus: reative a rede e confira que o banner some.
    // TODO: await context.setOffline(false)
  });
});
