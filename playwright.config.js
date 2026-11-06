// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  // Cada teste cria os próprios dados quando precisa alterar algo, então eles podem rodar em paralelo
  fullyParallel: true,
  // Teste instável se corrige, não se repete: nenhuma nova tentativa automática
  retries: 0,
  // test.only esquecido no código quebra o CI
  forbidOnly: !!process.env.CI,
  // RELATORIO_DIR separa os relatórios quando o CI roda a suíte mais de uma vez no mesmo job
  reporter: [['list'], ['html', { open: 'never', outputFolder: process.env.RELATORIO_DIR || 'playwright-report' }]],
  use: {
    // O Playwright já envia JSON com o cabeçalho certo quando usamos `data` nas requisições
    baseURL: process.env.API_URL || 'http://localhost:3100',
  },
  projects: [{ name: 'api', testDir: './tests/api' }],
});
