import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);

    this.emailInput = page.getByTestId('login-email-input');
    this.passwordInput = page.getByTestId('login-password-input');
    this.loginButton = page.getByTestId('login-submit-button');
  }

  async acessarPagina(): Promise<void> {
    await this.acessar('/login');
  }

  async realizarLogin(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async validarMensagemErro(mensagemEsperada: string): Promise<void> {
    const mensagemErro = this.page.getByRole('alert');
    await expect(mensagemErro).toBeVisible();
    await expect(mensagemErro).toHaveText(mensagemEsperada);
  }
}