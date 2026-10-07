// tests/e2e/01-login.spec.ts
// ─────────────────────────────────────────────────────────────────────────────
// 📘 MODELO (resolvido) — locators recomendados + fluxo de login
//
// Este arquivo já vem pronto: é o exemplo que o professor resolve no
// screencast. Leia com atenção — os padrões daqui (getByTestId, getByRole,
// web-first assertions, zero sleep) são o que você replica nos specs 02–05.
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/Pages/LoginPage';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {

  test('CT01. Deve redirecionar usuário sem sessão para /login', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('login-screen')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('CT02. Deve fazer login com credenciais válidas', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.acessarPagina();
    await loginPage.realizarLogin('aluno@puc.br', '1234');
  });

  test('CT03. Deve mostrar mensagem de erro com senha inválida', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.acessarPagina();
    await loginPage.realizarLogin('aluno@puc.br', 'senhaerrada');

    // Web-first assertion: espera + verifica num passo só (auto-waiting).
    // NUNCA page.waitForTimeout(3000) — é assim que nasce suíte flaky.
    //
    // Repara: NÃO asserta um filme específico — "/" hoje é a tela Discover
    // (dado real do TMDB, muda sempre). Testar a TELA (estrutural) em vez
    // do CONTEÚDO (variável) é o que mantém esse teste estável. Pra dado
    // fixo e determinístico, veja o ambiente QA em '/qa' (specs 02-05).
    await loginPage.validarMensagemErro('E-mail ou senha inválidos');
    await expect(page).toHaveURL(/\/login/);
  });

  test('CT04. Deve monstrar mensagem de erro com usuário incorreto', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.acessarPagina();
    await loginPage.realizarLogin('usuarioerrado@puc.br', '1234');
    await loginPage.validarMensagemErro('E-mail ou senha inválidos');
    await expect(page).toHaveURL(/\/login/);
  });
});
