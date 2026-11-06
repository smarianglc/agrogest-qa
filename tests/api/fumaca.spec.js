// Teste de fumaça: o ambiente subiu e a API atende o mínimo antes das suítes de regra.
// Se falhar, nenhuma outra suíte é confiável.
const { test, expect } = require('@playwright/test');
const { login } = require('../../support/api');

test.describe('Fumaça — o ambiente de teste está pronto', () => {
  test('a API responde no /health', async ({ request }) => {
    const resposta = await request.get('/health');
    expect(resposta.status()).toBe(200);
    expect(await resposta.json()).toEqual({ status: 'ok' });
  });

  test('o seed foi carregado: o Roberto consegue fazer login', async ({ request }) => {
    const corpo = await login(request, 'roberto');
    expect(corpo.token).toEqual(expect.any(String));
    expect(corpo.usuario.perfil).toBe('ADMIN');
    expect(corpo.fazendas.map((f) => f.nome)).toEqual(['Fazenda Boa Safra']);
  });

  test('o contrato OpenAPI está publicado na versão testada', async ({ request }) => {
    const resposta = await request.get('/openapi.json');
    expect(resposta.status()).toBe(200);
    const contrato = await resposta.json();
    expect(contrato.info.title).toBe('AgroGest API');
    // Registra no relatório qual versão da API foi testada
    test.info().annotations.push({ type: 'versão da API', description: contrato.info.version });
    if (process.env.API_VERSION) {
      expect(contrato.info.version).toBe(process.env.API_VERSION);
    }
  });
});
