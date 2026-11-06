// Cadastro de insumos. Permissões (proposta da etapa 3): todos os perfis consultam o estoque;
// só ADMIN e FINANCEIRO cadastram. Saldo e custo médio nascem zerados: só mudam por nota (RN-05).
const { test, expect } = require('@playwright/test');
const { login, comToken, esperarErro } = require('../../../support/api');
const { nomeUnico, criarInsumo } = require('../../../support/dados');

test.describe('Cadastro e consulta de insumos', () => {
  test('todos os perfis consultam o estoque, inclusive o AGRONOMO', async ({ request }) => {
    for (const persona of ['roberto', 'juliana', 'carlos']) {
      const { token } = await login(request, persona);
      expect((await request.get('/insumos', comToken(token))).status(), persona).toBe(200);
    }
  });

  test('o AGRONOMO não cadastra insumo', async ({ request }) => {
    const { token } = await login(request, 'juliana');
    const resposta = await request.post('/insumos', {
      ...comToken(token),
      data: { nome: nomeUnico(), categoria: 'DEFENSIVO', unidade: 'L' },
    });
    await esperarErro(resposta, 403, 'ACESSO_NEGADO');
  });

  test('ADMIN e FINANCEIRO cadastram insumo com os dados opcionais', async ({ request }) => {
    for (const persona of ['roberto', 'carlos']) {
      const { token } = await login(request, persona);
      const insumo = await criarInsumo(request, token, {
        categoria: 'DEFENSIVO',
        unidade: 'L',
        especificacao: 'Princípio ativo fictício 200 g/L',
        lote: 'QA-001',
        validade: '2027-12-31',
        estoqueMinimo: 50,
      });
      expect(insumo, persona).toMatchObject({
        categoria: 'DEFENSIVO',
        unidade: 'L',
        especificacao: 'Princípio ativo fictício 200 g/L',
        lote: 'QA-001',
        validade: '2027-12-31',
        saldo: '0.000',
        custoMedio: '0.00',
        estoqueMinimo: '50.000',
      });
    }
  });

  test('os dados opcionais ausentes voltam como null', async ({ request }) => {
    const { token } = await login(request, 'carlos');
    const insumo = await criarInsumo(request, token);
    expect(insumo).toMatchObject({ especificacao: null, lote: null, validade: null });
  });

  test('saldo e custo médio enviados no cadastro são ignorados: nascem zerados', async ({ request }) => {
    // Se o saldo pudesse ser digitado, o custo médio perderia o sentido; o estoque só entra por nota
    const { token } = await login(request, 'carlos');
    const insumo = await criarInsumo(request, token, { saldo: 999, custoMedio: 1 });
    expect(insumo).toMatchObject({ saldo: '0.000', custoMedio: '0.00' });
  });

  const invalidos = [
    ['sem nome', { nome: '' }],
    ['categoria inexistente', { categoria: 'MAQUINA' }],
    ['unidade inexistente', { unidade: 'TON' }],
    ['estoque mínimo negativo', { estoqueMinimo: -1 }],
    ['validade fora do formato', { validade: '31/12/2027' }],
  ];
  for (const [caso, dados] of invalidos) {
    test(`cadastro recusado: ${caso}`, async ({ request }) => {
      const { token } = await login(request, 'carlos');
      const resposta = await request.post('/insumos', {
        ...comToken(token),
        data: { nome: nomeUnico(), categoria: 'FERTILIZANTE', unidade: 'KG', ...dados },
      });
      await esperarErro(resposta, 422, 'DADOS_INVALIDOS');
    });
  }
});
