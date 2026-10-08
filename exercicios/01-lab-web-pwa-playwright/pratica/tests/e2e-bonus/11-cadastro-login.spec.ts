// tests/e2e-bonus/11-cadastro-login.spec.ts
// ─────────────────────────────────────────────────────────────────────────────
// ⭐ BÔNUS (não pontua) — criar conta e entrar com ela
//
// O CineFav agora deixa o usuário criar uma conta (tela de login → "Criar conta").
// Sem VITE_API_URL as contas ficam no localStorage do navegador; com a API
// (`npm run api`) ficam num banco em arquivo. Aqui testamos o modo padrão (local).
//
// Cada teste roda num contexto NOVO e SEM sessão (storageState vazio) — por isso
// uma conta criada num teste não "vaza" pro outro.
//
// Rodar: npm run test:bonus
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect, type Page } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

async function criarConta(page: Page, nome: string, email: string, senha: string) {
  await page.goto('/login');
  await page.getByTestId('auth-mode-toggle').click(); // "Criar conta"
  await page.getByTestId('register-name-input').fill(nome);
  await page.getByTestId('register-email-input').fill(email);
  await page.getByTestId('register-password-input').fill(senha);
  await page.getByTestId('register-submit-button').click();
}

test.describe('Cadastro e login', () => {
  test('1. criar conta já entra no app', async ({ page }) => {
    await criarConta(page, 'Ana Souza', 'ana@teste.com', 'segredo1');
    await expect(page.getByTestId('discover-screen')).toBeVisible();
  });

  test('2. depois de sair, dá pra entrar de novo com a conta criada', async ({ page }) => {
    await criarConta(page, 'Bruno Lima', 'bruno@teste.com', 'segredo2');
    await expect(page.getByTestId('discover-screen')).toBeVisible();

    // "sair": apaga só a SESSÃO (a conta continua guardada)
    await page.evaluate(() => localStorage.removeItem('cinefav-auth'));
    await page.goto('/login');

    await page.getByTestId('login-email-input').fill('bruno@teste.com');
    await page.getByTestId('login-password-input').fill('segredo2');
    await page.getByTestId('login-submit-button').click();
    await expect(page.getByTestId('discover-screen')).toBeVisible();
  });

  test('3. senha errada na conta criada é recusada', async ({ page }) => {
    await criarConta(page, 'Carla Dias', 'carla@teste.com', 'segredo3');
    await expect(page.getByTestId('discover-screen')).toBeVisible();
    await page.evaluate(() => localStorage.removeItem('cinefav-auth'));
    await page.goto('/login');

    await page.getByTestId('login-email-input').fill('carla@teste.com');
    await page.getByTestId('login-password-input').fill('outra-senha');
    await page.getByTestId('login-submit-button').click();
    await expect(page.getByRole('alert')).toHaveText('E-mail ou senha inválidos');
  });

  test('4. e-mail repetido mostra erro de conta já existente', async ({ page }) => {
    await criarConta(page, 'Davi Rocha', 'davi@teste.com', 'segredo4');
    await expect(page.getByTestId('discover-screen')).toBeVisible();
    await page.evaluate(() => localStorage.removeItem('cinefav-auth'));

    await criarConta(page, 'Outro Davi', 'davi@teste.com', 'segredo5');
    await expect(page.getByTestId('register-error-message')).toHaveText('Já existe uma conta com esse e-mail');
  });

  test('5. a senha NUNCA fica em texto puro no navegador', async ({ page }) => {
    await criarConta(page, 'Eva Nunes', 'eva@teste.com', 'senha-super-secreta');
    await expect(page.getByTestId('discover-screen')).toBeVisible();

    const guardado = await page.evaluate(() => localStorage.getItem('cinefav-users'));
    expect(guardado).toContain('eva@teste.com');
    expect(guardado).not.toContain('senha-super-secreta'); // só o hash SHA-256
  });

  test('6. a conta de demonstração aluno@puc.br continua valendo', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email-input').fill('aluno@puc.br');
    await page.getByTestId('login-password-input').fill('1234');
    await page.getByTestId('login-submit-button').click();
    await expect(page.getByTestId('discover-screen')).toBeVisible();
  });
});
