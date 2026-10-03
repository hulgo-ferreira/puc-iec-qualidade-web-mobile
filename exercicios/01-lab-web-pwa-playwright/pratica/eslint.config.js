// Lint só dos testes: pega os erros que mais confundem em Playwright
// (expect sem await / sem matcher → teste verde que não verifica nada).
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'test-results/**', 'playwright-report/**'] },
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.ts'],
    languageOptions: { parser: tseslint.parser },
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/missing-playwright-await': 'error', // await no expect de locator/page
      'playwright/valid-expect': 'error', // expect(...) precisa de matcher
      'playwright/no-wait-for-timeout': 'error', // sleep fixo = flaky
      'playwright/prefer-web-first-assertions': 'warn',
      'playwright/consistent-spacing-between-blocks': 'off',
    },
  },
];
