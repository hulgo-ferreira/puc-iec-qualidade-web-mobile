// tests/e2e/04-spa.spec.ts
// ─────────────────────────────────────────────────────────────────────────────
// ✅ AVALIATIVO — comportamento de SPA: app-ready, navegação client-side,
//                 lazy loading de rota
//
// SPA não "recarrega página": o JS troca a tela. Testar SPA é saber ESPERAR
// pelos sinais certos (não por tempo) e provar que a navegação não derrubou
// o estado do JavaScript.
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';

test.describe('Comportamento SPA', () => {
  // 🧑‍🏫 1. FÁCIL — esperar o app ficar interativo (sem sleep!)
  // 🎯 OBRIGATÓRIO · 🟢 fácil — esperar o sinal `data-app-ready`
  test('1. app sinaliza que está pronto via data-app-ready', async ({ page }) => {
    await page.goto('/qa');

    // O app seta data-app-ready="true" no <html> quando o React montou.
    // Esperar por um SINAL do app >>> esperar 3 segundos e torcer.
    // TODO: espere o seletor 'html[data-app-ready="true"]'
    // Dica: page.locator(...).waitFor() ou expect(...).toHaveAttribute
  });

  // 🧑‍💻 2. FÁCIL — navegação client-side não recarrega a página
  // 🎯 OBRIGATÓRIO · 🟡 médio — ler uma variável do navegador com `page.evaluate`
  test('2. ir pra busca e voltar mantém o estado do JS', async ({ page }) => {
    // '/qa' = ambiente determinístico (ver nota do teste 1 do spec 03).
    await page.goto('/qa');
    await expect(page.getByTestId('movielist-grid')).toBeVisible();

    // Marca uma variável no window. Se a navegação fizer full reload,
    // a variável some — se for client-side de verdade, sobrevive.
    await page.evaluate(() => {
      (window as any).__spaMarker = 42;
    });

    await page.getByTestId('movielist-search-button').click();
    await expect(page.getByTestId('search-screen')).toBeVisible();

    // TODO: leia (window as any).__spaMarker com page.evaluate
    // TODO: expect(marker).toBe(42)  → prova que não houve reload
  });

  // 🧑‍💻 3. 🔴 DESAFIO — lazy loading: o chunk da rota só baixa ao navegar
  // ⭐ OPCIONAL — treino, NÃO conta nota (o núcleo que vale nota são os outros testes)
  test('3. rota /favorites é um chunk lazy', async ({ page }) => {
    // Estratégia: colete as URLs de .js baixadas (page.on('request')),
    // navegue até favoritos e verifique que um chunk NOVO foi baixado
    // depois da navegação (o import() dinâmico do React.lazy).
    // TODO: const chunks: string[] = []
    // TODO: page.on('request', ...) filtrando url que termina com .js
    // TODO: goto('/qa'), zere a lista, clique em movielist-favorites-button
    // TODO: espere favorites-screen e expect(chunks.length).toBeGreaterThan(0)
  });

  // 🧑‍💻 4. 🔴 DESAFIO — deep link em rota protegida
  // ⭐ OPCIONAL — treino, NÃO conta nota (o núcleo que vale nota são os outros testes)
  test('4. acessar /movie/603 direto (deep link) funciona logado', async ({ page }) => {
    // SPA com router precisa responder a URL direta, não só a cliques.
    // TODO: goto('/movie/603') e espere detail-title com texto "Matrix"
  });
});
