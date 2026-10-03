import { defineConfig, devices } from '@playwright/test';

// Config SEPARADA pro desafio bônus (tests/e2e-bonus/). Roda com
// `npm run test:bonus`, nunca com `npm run test:e2e` — fica fora do
// critério eliminatório e fora do workflow.yml de propósito: esse
// desafio bate em rede REAL do TMDB, não pode travar o CI de ninguém.
export default defineConfig({
  timeout: 30_000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run build && npm run preview',
    // Credenciais FALSAS só pra ligar o banner (a chamada é mockada no spec 08).
    env: { VITE_FIREBASE_PROJECT_ID: 'demo', VITE_FIREBASE_API_KEY: 'fake', VITE_FIREBASE_APP_ID: 'fake' },
    url: 'http://localhost:4173',
    reuseExistingServer: false, // build próprio, com as credenciais falsas
    timeout: 120_000,
  },
  projects: [
    // Reaproveita o MESMO login do auth.setup.ts da suíte principal.
    { name: 'setup', testDir: './tests/e2e', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      testDir: './tests/e2e-bonus',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
