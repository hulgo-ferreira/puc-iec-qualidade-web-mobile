// tests/e2e-bonus/09-pwa-painel.spec.ts
// ─────────────────────────────────────────────────────────────────────────────
// ⭐ BÔNUS (não pontua) — o que faz um site virar PWA, testado de verdade
//
// A tela /pwa ("Raio-X") lê o estado real do navegador. Aqui a gente testa o
// MESMO que ela mostra: manifest (instalável), Service Worker, cache e rede.
//
// Rodar: npm run test:bonus
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect, type Page } from '@playwright/test';

async function waitForSwControl(page: Page) {
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
}

test.describe('PWA — instalável + offline', () => {
  test('1. manifest declara o necessário pra instalar (id, atalhos, standalone)', async ({ page }) => {
    await page.goto('/qa');
    const href = await page.locator('link[rel="manifest"]').getAttribute('href');
    const manifest = await page.evaluate(async (h) => (await fetch(h!)).json(), href);

    expect(manifest.display).toBe('standalone');
    expect(manifest.id).toBe('/');
    expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true);
    // atalhos: aparecem ao segurar o ícone do app instalado
    expect(manifest.shortcuts.map((s: { url: string }) => s.url)).toEqual(['/favorites', '/search']);
  });

  test('2. Raio-X mostra SW ativo, controlando a página e cache preenchido', async ({ page }) => {
    await page.goto('/qa');
    await waitForSwControl(page);

    await page.goto('/pwa');
    await expect(page.getByTestId('pwa-check-https')).toHaveAttribute('data-ok', 'true');
    await expect(page.getByTestId('pwa-check-manifest')).toHaveAttribute('data-ok', 'true');
    await expect(page.getByTestId('pwa-check-sw')).toHaveAttribute('data-ok', 'true');
    await expect(page.getByTestId('pwa-check-controller')).toHaveAttribute('data-ok', 'true');
    await expect(page.getByTestId('pwa-check-cache')).toHaveAttribute('data-ok', 'true');
    // numa aba normal (não instalada) NÃO está em modo standalone
    await expect(page.getByTestId('pwa-check-standalone')).toHaveAttribute('data-ok', 'false');
  });

  test('3. o app abre offline e o Raio-X reflete a rede caída', async ({ page, context }) => {
    await page.goto('/qa');
    await waitForSwControl(page);

    await context.setOffline(true);
    await page.goto('/pwa'); // navegação offline: quem responde é o Service Worker
    await expect(page.getByTestId('pwa-screen')).toBeVisible();
    await expect(page.getByTestId('offline-banner')).toBeVisible();
    await expect(page.getByTestId('pwa-check-network')).toHaveAttribute('data-ok', 'false');

    await context.setOffline(false);
    await expect(page.getByTestId('pwa-check-network')).toHaveAttribute('data-ok', 'true');
  });

  test('4. "Instalar" fica desligado enquanto o navegador não oferece a instalação', async ({ page }) => {
    await page.goto('/pwa');
    // beforeinstallprompt só dispara em condições reais de instalação;
    // em teste automatizado o botão deve estar desabilitado (progressive enhancement).
    await expect(page.getByTestId('pwa-install-button')).toBeDisabled();
  });

  test('5. beforeinstallprompt simulado habilita o botão de instalar', async ({ page }) => {
    await page.goto('/pwa');
    await expect(page.getByTestId('pwa-screen')).toBeVisible();
    await page.evaluate(() => {
      // Dispara o MESMO evento que o Chrome dispararia quando o app é instalável.
      const evt = new Event('beforeinstallprompt') as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
      evt.prompt = async () => {};
      evt.userChoice = Promise.resolve({ outcome: 'accepted' });
      window.dispatchEvent(evt);
    });
    await expect(page.getByTestId('pwa-install-button')).toBeEnabled();
    await page.getByTestId('pwa-install-button').click();
    await expect(page.getByTestId('pwa-action-result')).toContainText('accepted');
  });
});
