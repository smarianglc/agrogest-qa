// RN-21: trocar de fazenda gera um token novo para a fazenda escolhida, com o perfil do vínculo dela.
// Fazenda sem vínculo ativo é recusada com 404. O login entra na fazenda do primeiro vínculo ativo.
// A Juliana (AGRONOMO nas duas fazendas) é a persona que prova a regra.
const { test, expect } = require('@playwright/test');
const { login, comToken, esperarErro, idsDasFazendas } = require('../../../support/api');

const trocar = (request, token, fazendaId) =>
  request.post('/auth/trocar-fazenda', { ...comToken(token), data: { fazendaId } });

test.describe('RN-21 — troca de fazenda', () => {
  let fazendas;

  test.beforeAll(async ({ request }) => {
    fazendas = await idsDasFazendas(request);
  });

  test('o login da Juliana lista as duas fazendas e entra na primeira (Boa Safra) @RN-21', async ({ request }) => {
    const juliana = await login(request, 'juliana');
    expect(juliana.fazendas).toEqual([
      { id: fazendas.boaSafra, nome: 'Fazenda Boa Safra', perfil: 'AGRONOMO' },
      { id: fazendas.rioVerde, nome: 'Fazenda Rio Verde', perfil: 'AGRONOMO' },
    ]);
    expect(juliana.usuario.fazendaId).toBe(fazendas.boaSafra);
  });

  test('trocar para a Rio Verde devolve um token novo dessa fazenda, com o perfil do vínculo @RN-21', async ({ request }) => {
    const juliana = await login(request, 'juliana');
    const resposta = await trocar(request, juliana.token, fazendas.rioVerde);
    expect(resposta.status()).toBe(200);
    const corpo = await resposta.json();
    expect(corpo).toEqual({ token: expect.any(String), fazendaId: fazendas.rioVerde, perfil: 'AGRONOMO' });
    expect(corpo.token).not.toBe(juliana.token);

    const atual = await (await request.get('/fazendas/atual', comToken(corpo.token))).json();
    expect(atual.nome).toBe('Fazenda Rio Verde');
  });

  test('depois da troca, nenhum dado da fazenda anterior aparece @RN-21 @RN-01 @BUG-01', async ({ request }) => {
    const juliana = await login(request, 'juliana');
    const antes = await (await request.get('/insumos', comToken(juliana.token))).json();
    expect(antes.length).toBeGreaterThan(0);
    expect(antes.every((i) => i.fazendaId === fazendas.boaSafra)).toBe(true);

    const { token } = await (await trocar(request, juliana.token, fazendas.rioVerde)).json();
    const depois = await (await request.get('/insumos', comToken(token))).json();
    expect(depois.length).toBeGreaterThan(0);
    expect(depois.every((i) => i.fazendaId === fazendas.rioVerde)).toBe(true);
  });

  test('é possível voltar para a fazenda anterior @RN-21', async ({ request }) => {
    const juliana = await login(request, 'juliana');
    const naRioVerde = await (await trocar(request, juliana.token, fazendas.rioVerde)).json();
    const deVolta = await trocar(request, naRioVerde.token, fazendas.boaSafra);
    expect(deVolta.status()).toBe(200);
    expect((await deVolta.json()).fazendaId).toBe(fazendas.boaSafra);
  });

  test('o perfil continua valendo na nova fazenda: AGRONOMO não gerencia usuários lá @RN-21', async ({ request }) => {
    const juliana = await login(request, 'juliana');
    const { token } = await (await trocar(request, juliana.token, fazendas.rioVerde)).json();
    await esperarErro(await request.get('/usuarios', comToken(token)), 403, 'ACESSO_NEGADO');
  });

  test('quem não tem vínculo com a fazenda recebe 404 @RN-21', async ({ request }) => {
    const roberto = await login(request, 'roberto');
    await esperarErro(await trocar(request, roberto.token, fazendas.rioVerde), 404, 'RN-21');
  });

  test('fazenda sem vínculo e fazenda inexistente recebem a mesma resposta @RN-21', async ({ request }) => {
    const roberto = await login(request, 'roberto');
    const semVinculo = await trocar(request, roberto.token, fazendas.rioVerde);
    const inexistente = await trocar(request, roberto.token, '00000000-0000-0000-0000-000000000000');
    expect(await inexistente.json()).toEqual(await semVinculo.json());
  });

  test('sem fazendaId no corpo, a troca é recusada @RN-21', async ({ request }) => {
    const juliana = await login(request, 'juliana');
    const resposta = await request.post('/auth/trocar-fazenda', { ...comToken(juliana.token), data: {} });
    await esperarErro(resposta, 404, 'RN-21');
  });

  test('sem token, a troca é recusada @RN-21 @RN-03', async ({ request }) => {
    const resposta = await request.post('/auth/trocar-fazenda', { data: { fazendaId: fazendas.rioVerde } });
    await esperarErro(resposta, 401, 'RN-03');
  });
});
