// RN-01: o usuário só acessa recursos da fazenda ativa no token. Recurso de outra fazenda responde 404,
// igual a um recurso que não existe, para não revelar que ele existe (risco jurídico: vazamento entre tenants).
// O isolamento de insumos (e o BUG-01) fica na suíte de estoque.
const { test, expect } = require('@playwright/test');
const { login, comToken, esperarErro } = require('../../../support/api');

const nomes = (lista) => lista.map((u) => u.nome);

test.describe('RN-01 — isolamento entre fazendas: usuários e fazenda atual', () => {
  let roberto;
  let helena;

  test.beforeAll(async ({ request }) => {
    roberto = await login(request, 'roberto');
    helena = await login(request, 'helena');
  });

  test('a lista do ADMIN da Boa Safra não traz ninguém da Rio Verde @RN-01', async ({ request }) => {
    const lista = await (await request.get('/usuarios', comToken(roberto.token))).json();
    // Comparação por inclusão: outros testes criam usuários em paralelo, então a lista pode ter mais nomes
    expect(nomes(lista)).toEqual(expect.arrayContaining(['Roberto', 'Juliana', 'Carlos']));
    expect(nomes(lista)).not.toContain('Helena');
    expect(nomes(lista)).not.toContain('Tiago');
    expect(nomes(lista)).not.toContain('Sandra');
  });

  test('a lista da Rio Verde traz a Juliana, que tem vínculo nas duas fazendas @RN-01', async ({ request }) => {
    const lista = await (await request.get('/usuarios', comToken(helena.token))).json();
    expect(nomes(lista)).toEqual(expect.arrayContaining(['Helena', 'Tiago', 'Sandra', 'Juliana']));
    expect(nomes(lista)).not.toContain('Roberto');
    expect(nomes(lista)).not.toContain('Carlos');
  });

  test('o ADMIN da Boa Safra recebe 404 ao buscar um usuário da Rio Verde pelo id @RN-01', async ({ request }) => {
    const resposta = await request.get(`/usuarios/${helena.usuario.id}`, comToken(roberto.token));
    await esperarErro(resposta, 404, 'RN-01');
  });

  test('a mesma busca feita pela própria fazenda funciona (controle) @RN-01', async ({ request }) => {
    const resposta = await request.get(`/usuarios/${helena.usuario.id}`, comToken(helena.token));
    expect(resposta.status()).toBe(200);
    expect((await resposta.json()).nome).toBe('Helena');
  });

  test('usuário de outra fazenda e usuário inexistente recebem a mesma resposta @RN-01', async ({ request }) => {
    const outraFazenda = await request.get(`/usuarios/${helena.usuario.id}`, comToken(roberto.token));
    const inexistente = await request.get('/usuarios/00000000-0000-0000-0000-000000000000', comToken(roberto.token));
    expect(await outraFazenda.json()).toEqual(await inexistente.json());
  });

  test('/fazendas/atual devolve a fazenda do token, com a área em texto de 2 casas @RN-01', async ({ request }) => {
    const boaSafra = await (await request.get('/fazendas/atual', comToken(roberto.token))).json();
    const rioVerde = await (await request.get('/fazendas/atual', comToken(helena.token))).json();
    expect(boaSafra).toMatchObject({ nome: 'Fazenda Boa Safra', cidade: 'Dourados', areaTotalHa: '1200.00' });
    expect(rioVerde).toMatchObject({ nome: 'Fazenda Rio Verde', cidade: 'Sidrolândia', areaTotalHa: '2500.00' });
  });
});
