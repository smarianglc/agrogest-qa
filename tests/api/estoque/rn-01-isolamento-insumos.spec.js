// RN-01 aplicado ao estoque: insumo de outra fazenda não aparece, não é encontrado e não recebe nota.
// É aqui que mora o BUG-01 (listagem sem filtro de fazenda): com BUGS_ENABLED=BUG-01, o teste
// marcado com @BUG-01 tem que FALHAR. É a prova de que a suíte encontra o defeito.
const { test, expect } = require('@playwright/test');
const { login, comToken, esperarErro, idsDasFazendas } = require('../../../support/api');
const { criarInsumo, lancarNota, buscarInsumo } = require('../../../support/dados');

test.describe('RN-01 — isolamento entre fazendas: insumos', () => {
  let carlos;
  let helena;
  let fazendas;
  let milho;

  test.beforeAll(async ({ request }) => {
    carlos = await login(request, 'carlos');
    helena = await login(request, 'helena');
    fazendas = await idsDasFazendas(request);
    // A Semente de milho só existe na Rio Verde: se aparecer para a Boa Safra, é vazamento
    const listaRioVerde = await (await request.get('/insumos', comToken(helena.token))).json();
    milho = listaRioVerde.find((i) => i.nome === 'Semente de milho MX 30');
  });

  test('a lista de insumos da Boa Safra só traz insumos da Boa Safra @RN-01 @BUG-01', async ({ request }) => {
    const lista = await (await request.get('/insumos', comToken(carlos.token))).json();
    const deOutraFazenda = lista.filter((i) => i.fazendaId !== fazendas.boaSafra);
    expect(deOutraFazenda, 'insumos de outra fazenda na lista da Boa Safra').toEqual([]);
    expect(lista.map((i) => i.nome)).not.toContain('Semente de milho MX 30');
  });

  test('o filtro de alerta também não traz insumo de outra fazenda @RN-01 @BUG-01', async ({ request }) => {
    // O milho da Rio Verde está em alerta (8 < 10): é o candidato natural a vazar nesse filtro
    const lista = await (await request.get('/insumos?alerta=true', comToken(carlos.token))).json();
    expect(lista.every((i) => i.fazendaId === fazendas.boaSafra)).toBe(true);
  });

  test('buscar pelo id um insumo de outra fazenda responde 404 @RN-01', async ({ request }) => {
    await esperarErro(await request.get(`/insumos/${milho.id}`, comToken(carlos.token)), 404, 'RN-01');
  });

  test('insumo de outra fazenda e insumo inexistente recebem a mesma resposta @RN-01', async ({ request }) => {
    const outraFazenda = await request.get(`/insumos/${milho.id}`, comToken(carlos.token));
    const inexistente = await request.get('/insumos/00000000-0000-0000-0000-000000000000', comToken(carlos.token));
    expect(await outraFazenda.json()).toEqual(await inexistente.json());
  });

  test('nota com insumo de outra fazenda é recusada e o saldo dele não muda @RN-01', async ({ request }) => {
    const antes = await buscarInsumo(request, helena.token, milho.id);
    await esperarErro(await lancarNota(request, carlos.token, milho.id, 10, 100), 404, 'RN-01');
    const depois = await buscarInsumo(request, helena.token, milho.id);
    expect(depois).toMatchObject({ saldo: antes.saldo, custoMedio: antes.custoMedio });
  });

  test('o cadastro ignora um fazendaId enviado no corpo: o insumo nasce na fazenda do token @RN-01', async ({ request }) => {
    // Tentativa de "atribuição em massa": cadastrar direto na fazenda de outro cliente
    const resposta = await request.post('/insumos', {
      ...comToken(carlos.token),
      data: { nome: `Intruso ${Date.now()}`, categoria: 'SEMENTE', unidade: 'SC', fazendaId: fazendas.rioVerde },
    });
    expect(resposta.status()).toBe(201);
    expect((await resposta.json()).fazendaId).toBe(fazendas.boaSafra);
  });

  test('a nota lançada na Rio Verde não aparece nas entradas da Boa Safra @RN-01', async ({ request }) => {
    // A Sandra (FINANCEIRO da Rio Verde) lança uma nota num insumo próprio, sem tocar no seed
    const sandra = await login(request, 'sandra');
    const insumoRioVerde = await criarInsumo(request, sandra.token);
    const nota = await (await lancarNota(request, sandra.token, insumoRioVerde.id, 10, 30)).json();

    const daBoaSafra = await (await request.get('/entradas-nota', comToken(carlos.token))).json();
    expect(daBoaSafra.map((e) => e.id)).not.toContain(nota.entrada.id);
    const daRioVerde = await (await request.get('/entradas-nota', comToken(sandra.token))).json();
    expect(daRioVerde.map((e) => e.id)).toContain(nota.entrada.id);
  });
});
