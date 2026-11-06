// RN-06: quantidade e valor da nota devem ser maiores que zero (422).
// Além do status, cada caso confere que a nota recusada não mexeu no estoque.
const { test, expect } = require('@playwright/test');
const { login, esperarErro } = require('../../../support/api');
const { criarInsumo, lancarNota, lancarNotaValida, buscarInsumo } = require('../../../support/dados');

test.describe('RN-06 — quantidade e valor maiores que zero', () => {
  let token;

  test.beforeAll(async ({ request }) => {
    ({ token } = await login(request, 'carlos'));
  });

  const casos = [
    ['quantidade zero', 0, 100],
    ['quantidade negativa', -5, 100],
    ['valor zero', 10, 0],
    ['valor negativo', 10, -1],
    ['quantidade e valor zero', 0, 0],
  ];

  for (const [caso, quantidade, valor] of casos) {
    test(`${caso} é recusada e o estoque não muda @RN-06`, async ({ request }) => {
      const insumo = await criarInsumo(request, token);
      await lancarNotaValida(request, token, insumo.id, 10, 30);

      await esperarErro(await lancarNota(request, token, insumo.id, quantidade, valor), 422, 'RN-06');

      expect(await buscarInsumo(request, token, insumo.id)).toMatchObject({ saldo: '10.000', custoMedio: '3.00' });
    });
  }

  test('o menor valor positivo aceito (0,001 e R$ 0,01) passa (limite) @RN-06', async ({ request }) => {
    const insumo = await criarInsumo(request, token);
    const resposta = await lancarNota(request, token, insumo.id, 0.001, 0.01);
    expect(resposta.status()).toBe(201);
  });
});
