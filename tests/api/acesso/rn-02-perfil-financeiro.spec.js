// RN-02: AGRONOMO não acessa o financeiro; FINANCEIRO não registra aplicação.
// Na v0.1, a parte financeira que existe é a entrada de nota (ela gera contas a pagar).
const { test, expect } = require('@playwright/test');
const { login, comToken, esperarErro } = require('../../../support/api');

test.describe('RN-02 — perfis e o financeiro', () => {
  test('o AGRONOMO não lista entradas de nota @RN-02', async ({ request }) => {
    const { token } = await login(request, 'juliana');
    await esperarErro(await request.get('/entradas-nota', comToken(token)), 403, 'RN-02');
  });

  test('o AGRONOMO não lança entrada de nota @RN-02', async ({ request }) => {
    const { token } = await login(request, 'juliana');
    // O corpo é válido de propósito: a recusa tem que vir do perfil, não de validação
    const resposta = await request.post('/entradas-nota', {
      ...comToken(token),
      data: { insumoId: 'qualquer', numeroNota: '1', fornecedor: 'F', quantidade: 1, valorTotal: 1, dataEmissao: '2026-11-05' },
    });
    await esperarErro(resposta, 403, 'RN-02');
  });

  test('o FINANCEIRO e o ADMIN acessam as entradas de nota (controle) @RN-02', async ({ request }) => {
    for (const persona of ['carlos', 'roberto']) {
      const { token } = await login(request, persona);
      expect((await request.get('/entradas-nota', comToken(token))).status(), persona).toBe(200);
    }
  });

  test.fixme('o FINANCEIRO não registra aplicação @RN-02', async () => {
    // Aplicações entram na v0.3 da API (RN-08 a RN-12); este caso fica pendente até lá
  });
});
