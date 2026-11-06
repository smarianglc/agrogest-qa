// RN-07: saldo ABAIXO do estoque mínimo marca o insumo com alerta (emAlerta = true).
// Valor limite: saldo igual ao mínimo não é "abaixo", então não está em alerta.
const { test, expect } = require('@playwright/test');
const { login, comToken } = require('../../../support/api');
const { criarInsumo, lancarNotaValida } = require('../../../support/dados');

test.describe('RN-07 — alerta de estoque mínimo', () => {
  let token;

  test.beforeAll(async ({ request }) => {
    ({ token } = await login(request, 'carlos'));
  });

  const emAlerta = async (request) =>
    (await (await request.get('/insumos?alerta=true', comToken(token))).json()).map((i) => i.nome);

  test('no seed, o Herbicida e a Semente de soja estão em alerta; Ureia e KCl não @RN-07', async ({ request }) => {
    const nomes = await emAlerta(request);
    expect(nomes).toEqual(expect.arrayContaining(['Herbicida glifosato', 'Semente de soja AG 61']));
    expect(nomes).not.toContain('Ureia');
    expect(nomes).not.toContain('Cloreto de potássio (KCl)');
  });

  test('o filtro ?alerta=true devolve só insumos com emAlerta verdadeiro @RN-07', async ({ request }) => {
    const lista = await (await request.get('/insumos?alerta=true', comToken(token))).json();
    expect(lista.length).toBeGreaterThan(0);
    expect(lista.every((i) => i.emAlerta === true)).toBe(true);
  });

  test('valores limite: abaixo do mínimo alerta; igual ou acima não alerta @RN-07', async ({ request }) => {
    const insumo = await criarInsumo(request, token, { estoqueMinimo: 100 });
    expect(insumo).toMatchObject({ saldo: '0.000', estoqueMinimo: '100.000', emAlerta: true });
    expect(await emAlerta(request)).toContain(insumo.nome);

    const quase = await lancarNotaValida(request, token, insumo.id, 99.999, 300);
    expect(quase).toMatchObject({ saldo: '99.999', emAlerta: true });

    const igual = await lancarNotaValida(request, token, insumo.id, 0.001, 0.01);
    expect(igual).toMatchObject({ saldo: '100.000', emAlerta: false });
    expect(await emAlerta(request)).not.toContain(insumo.nome);
  });

  test('insumo sem estoque mínimo definido nunca entra em alerta @RN-07', async ({ request }) => {
    const insumo = await criarInsumo(request, token);
    expect(insumo).toMatchObject({ saldo: '0.000', estoqueMinimo: '0.000', emAlerta: false });
  });
});
