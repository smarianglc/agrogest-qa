// RN-05: a entrada de nota soma a quantidade ao saldo e recalcula o custo médio ponderado:
// (saldo × custo médio + valor da nota) ÷ (saldo + quantidade), com 2 casas (ROUND_HALF_UP).
// É dinheiro: o foco é precisão, arredondamento e concorrência.
const { test, expect } = require('@playwright/test');
const { login, comToken } = require('../../../support/api');
const { criarInsumo, lancarNota, lancarNotaValida, buscarInsumo } = require('../../../support/dados');

test.describe('RN-05 — saldo e custo médio ponderado', () => {
  let token;

  test.beforeAll(async ({ request }) => {
    ({ token } = await login(request, 'carlos'));
  });

  test('o seed traz a Ureia do exemplo oficial: 10.000 kg a R$ 3,00 @RN-05', async ({ request }) => {
    // Só leitura: nenhum teste altera a Ureia do seed
    const lista = await (await request.get('/insumos', comToken(token))).json();
    expect(lista.find((i) => i.nome === 'Ureia')).toMatchObject({ saldo: '10000.000', custoMedio: '3.00' });
  });

  test('exemplo oficial: 10.000 kg a R$ 3,00 + nota de 5.000 kg por R$ 17.500,00 = 15.000 kg a R$ 3,17 @RN-05', async ({ request }) => {
    // Reproduz o saldo de abertura da Ureia num insumo próprio, para não alterar o seed
    const insumo = await criarInsumo(request, token);
    const abertura = await lancarNotaValida(request, token, insumo.id, 10000, 30000.0);
    expect(abertura).toMatchObject({ saldo: '10000.000', custoMedio: '3.00' });

    const depois = await lancarNotaValida(request, token, insumo.id, 5000, 17500.0);
    // A conta exata dá 3,1666...: o teste fixa o arredondamento para 2 casas
    expect(depois).toMatchObject({ saldo: '15000.000', custoMedio: '3.17' });
  });

  test('primeira nota num insumo zerado define o custo médio pelo valor unitário @RN-05', async ({ request }) => {
    const semente = await criarInsumo(request, token, { categoria: 'SEMENTE', unidade: 'SC' });
    expect(semente).toMatchObject({ saldo: '0.000', custoMedio: '0.00' });
    const depois = await lancarNotaValida(request, token, semente.id, 50, 32500.0);
    expect(depois).toMatchObject({ saldo: '50.000', custoMedio: '650.00' });
  });

  const arredondamentos = [
    // [quantidade, valor, custo esperado, por quê]
    [3, 10.0, '3.33', '3,333... arredonda para baixo'],
    [3, 10.01, '3.34', '3,3366... arredonda para cima'],
    [2, 0.25, '0.13', 'meio exato (0,125) sobe: ROUND_HALF_UP'],
  ];
  for (const [quantidade, valor, esperado, porque] of arredondamentos) {
    test(`arredondamento do custo médio: ${quantidade} por R$ ${valor} → ${esperado} (${porque}) @RN-05`, async ({ request }) => {
      const insumo = await criarInsumo(request, token);
      const depois = await lancarNotaValida(request, token, insumo.id, quantidade, valor);
      expect(depois.custoMedio).toBe(esperado);
    });
  }

  test('quantidade fracionada com 3 casas é somada sem perda @RN-05', async ({ request }) => {
    const insumo = await criarInsumo(request, token, { categoria: 'DEFENSIVO', unidade: 'L' });
    await lancarNotaValida(request, token, insumo.id, 0.125, 10.0);
    const depois = await lancarNotaValida(request, token, insumo.id, 0.875, 10.0);
    expect(depois.saldo).toBe('1.000');
  });

  test('números enviados como texto são aceitos e dão o mesmo resultado @RN-05', async ({ request }) => {
    const insumo = await criarInsumo(request, token);
    const depois = await lancarNotaValida(request, token, insumo.id, '5000', '17500.00');
    expect(depois).toMatchObject({ saldo: '5000.000', custoMedio: '3.50' });
  });

  test('a resposta traz a nota e o insumo atualizado, com decimais em texto de casas fixas @RN-05', async ({ request }) => {
    const insumo = await criarInsumo(request, token);
    const resposta = await lancarNota(request, token, insumo.id, 10, 35);
    expect(resposta.status()).toBe(201);
    expect(await resposta.json()).toEqual({
      entrada: {
        id: expect.any(String),
        insumoId: insumo.id,
        numeroNota: expect.any(String),
        fornecedor: 'Agro Insumos Fictícios',
        quantidade: '10.000',
        valorTotal: '35.00',
        dataEmissao: '2026-11-05',
        numeroParcelas: 1,
      },
      insumo: expect.objectContaining({ id: insumo.id, saldo: '10.000', custoMedio: '3.50' }),
    });
  });

  test('a nota lançada aparece na lista de entradas da fazenda @RN-05', async ({ request }) => {
    const insumo = await criarInsumo(request, token);
    await lancarNotaValida(request, token, insumo.id, 10, 35);
    const entradas = await (await request.get('/entradas-nota', comToken(token))).json();
    expect(entradas.filter((e) => e.insumoId === insumo.id)).toHaveLength(1);
  });

  test('10 notas simultâneas no mesmo insumo: nenhuma entrada se perde @RN-05', async ({ request }) => {
    // Sem a trava de linha na API, notas concorrentes leriam o mesmo saldo e uma "apagaria" a outra
    const insumo = await criarInsumo(request, token);
    const respostas = await Promise.all(
      Array.from({ length: 10 }, (_, i) => lancarNota(request, token, insumo.id, 10, 30.0, { numeroNota: `CONC-${i}` })),
    );
    expect(respostas.map((r) => r.status())).toEqual(Array(10).fill(201));

    const final = await buscarInsumo(request, token, insumo.id);
    expect(final).toMatchObject({ saldo: '100.000', custoMedio: '3.00' });
    const entradas = await (await request.get('/entradas-nota', comToken(token))).json();
    expect(entradas.filter((e) => e.insumoId === insumo.id)).toHaveLength(10);
  });
});
