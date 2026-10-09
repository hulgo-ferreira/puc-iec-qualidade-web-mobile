// tests/e2e/03-visual.spec.ts
// ─────────────────────────────────────────────────────────────────────────────
// ✅ AVALIATIVO — visual regression nativo (toHaveScreenshot)
//
// 1ª execução: `npm run test:visual:update` GERA os baselines
//              (tests/e2e/03-visual.spec.ts-snapshots/).
// Execuções seguintes: comparam contra o baseline — qualquer pixel diferente
// além da tolerância falha o teste.
//
// ⚠️ Baseline é gerado POR máquina/OS. Commite os baselines gerados no SEU
// ambiente; no CI, gere-os no próprio CI (mesma imagem de SO).
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';

// Rubrica pede visual regression em 3 viewports.
const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

test.describe('Visual regression', () => {
  // 🧑‍🏫 1. FÁCIL — tela de login (estática, ótima pra começar)
  // 🎯 OBRIGATÓRIO · 🟢 fácil — 1 comando: `toHaveScreenshot`
  test('1. login se mantém visualmente estável', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-screen')).toBeVisible();

    // TODO: tire o snapshot da página
    // await expect(page).toHaveScreenshot('login.png');
  });

  // 🧑‍💻 2. 🔴 DESAFIO — home em 3 viewports (loop sobre VIEWPORTS)
  // ⚠️ Use '/qa' (ambiente determinístico), NÃO '/' — "/" hoje é a tela
  // Discover com dado real do TMDB, que muda e quebraria o baseline sozinho.
  for (const vp of VIEWPORTS) {
    // 🎯 OBRIGATÓRIO · 🟡 médio — o mesmo comando, repetido 3 vezes por um `for` (a lista VIEWPORTS já está pronta)
    test(`2. home estável em ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      // TODO: ajuste o viewport: page.setViewportSize({ width: vp.width, height: vp.height })
      // TODO: navegue pra '/qa' e espere movielist-grid ficar visível
      // TODO: snapshot nomeado por viewport: `home-${vp.name}.png`
      // Dica: fullPage: true captura a página inteira, não só a dobra.
    });
  }

  // 🧑‍💻 3. 🔴 DESAFIO — mascarar região dinâmica
  // ⭐ OPCIONAL — treino, NÃO conta nota (o núcleo que vale nota são os outros testes)
  test('3. detalhe do filme com máscara no botão de favorito', async ({ page }) => {
    // O botão de favorito muda de cor conforme o estado — típica região que
    // gera diff falso. toHaveScreenshot aceita { mask: [locator] }.
    // TODO: navegue pra /movie/603 e espere detail-title
    // TODO: snapshot com mask no getByTestId('detail-favorite-button')
  });
});
