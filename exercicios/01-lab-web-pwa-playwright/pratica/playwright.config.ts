import { defineConfig, devices } from '@playwright/test';

// Os testes rodam contra o BUILD (vite preview), não contra o dev server —
// Service Worker só existe no build, e a prática de PWA/offline depende dele.
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['json', { outputFile: 'playwright-results.json' }], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    // Demo ao vivo / ver o teste rodando devagar: SLOWMO=800 npx playwright test --headed
    launchOptions: { slowMo: Number(process.env.SLOWMO ?? 0) },
  },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    // 1º: o setup loga UMA vez pela UI e salva o storageState.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },

    // 2º: os specs rodam já autenticados, reaproveitando o estado salvo.
    // (O spec de login zera o storageState localmente com test.use.)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
