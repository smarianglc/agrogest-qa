// Validação da entrada de nota (código DADOS_INVALIDOS, proposta da etapa 3).
// Destaque: casas decimais a mais são recusadas, nunca arredondadas em silêncio
// (arredondamento escondido é a origem clássica das diferenças de centavo).
const { test, expect } = require('@playwright/test');
const { login, esperarErro } = require('../../../support/api');
const { criarInsumo, lancarNota, buscarInsumo } = require('../../../support/dados');

test.describe('Entrada de nota — validação dos dados', () => {
  let token;

  test.beforeAll(async ({ request }) => {
    ({ token } = await login(request, 'carlos'));
  });

  const casos = [
    ['valor com 3 casas decimais', { valorTotal: 10.555 }],
    ['quantidade com 4 casas decimais', { quantidade: 1.0001 }],
    ['quantidade que não é número', { quantidade: 'abc' }],
    ['valor ausente', { valorTotal: null }],
    ['data fora do formato AAAA-MM-DD', { dataEmissao: '05/11/2026' }],
    ['data inexistente', { dataEmissao: '2026-13-45' }],
    ['sem fornecedor', { fornecedor: '' }],
    ['sem número da nota', { numeroNota: '' }],
    ['número de parcelas não inteiro', { numeroParcelas: 1.5 }],
  ];

  for (const [caso, alteracao] of casos) {
    test(`${caso} é recusado com 422 e não altera o insumo`, async ({ request }) => {
      // Insumo próprio por teste: os casos rodam em paralelo e cada um confere o seu
      const insumo = await criarInsumo(request, token);
      const resposta = await lancarNota(request, token, insumo.id, 10, 30, alteracao);
      await esperarErro(resposta, 422, 'DADOS_INVALIDOS');
      expect(await buscarInsumo(request, token, insumo.id)).toMatchObject({ saldo: '0.000', custoMedio: '0.00' });
    });
  }
});
