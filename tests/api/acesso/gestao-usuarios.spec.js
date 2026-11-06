// Gestão de usuários: só o ADMIN gerencia usuários da própria fazenda (tabela de personas da especificação).
// Não é uma RN numerada; o código de erro é ACESSO_NEGADO (proposta da etapa 2).
const { test, expect } = require('@playwright/test');
const { login, comToken, esperarErro, emailUnico } = require('../../../support/api');

test.describe('Gestão de usuários — exclusiva do ADMIN', () => {
  for (const persona of ['juliana', 'carlos']) {
    test(`${persona} (sem perfil ADMIN) não lista nem cria usuários`, async ({ request }) => {
      const { token } = await login(request, persona);
      await esperarErro(await request.get('/usuarios', comToken(token)), 403, 'ACESSO_NEGADO');
      const criar = await request.post('/usuarios', {
        ...comToken(token),
        data: { nome: 'Intruso', email: emailUnico('intruso'), senha: '12345678', perfil: 'ADMIN' },
      });
      await esperarErro(criar, 403, 'ACESSO_NEGADO');
    });
  }

  test('o ADMIN cria um usuário, que já consegue entrar na mesma fazenda com o perfil escolhido', async ({ request }) => {
    const roberto = await login(request, 'roberto');
    const email = emailUnico('novo');

    const criado = await request.post('/usuarios', {
      ...comToken(roberto.token),
      data: { nome: 'Novo Agrônomo', email, senha: 'Senha@123', perfil: 'AGRONOMO' },
    });
    expect(criado.status()).toBe(201);
    expect(await criado.json()).toEqual({ id: expect.any(String), nome: 'Novo Agrônomo', email, perfil: 'AGRONOMO', ativo: true });

    const loginNovo = await request.post('/auth/login', { data: { email, senha: 'Senha@123' } });
    expect(loginNovo.status()).toBe(200);
    const corpo = await loginNovo.json();
    expect(corpo.usuario).toMatchObject({ perfil: 'AGRONOMO', fazendaId: roberto.usuario.fazendaId });
  });

  test('a resposta de usuários nunca expõe a senha nem o hash', async ({ request }) => {
    const { token } = await login(request, 'roberto');
    const lista = await (await request.get('/usuarios', comToken(token))).json();
    for (const usuario of lista) {
      expect(Object.keys(usuario).sort()).toEqual(['ativo', 'email', 'id', 'nome', 'perfil']);
    }
  });

  const invalidos = [
    ['senha com menos de 8 caracteres', { senha: '1234567', perfil: 'AGRONOMO' }],
    ['perfil inexistente', { senha: '12345678', perfil: 'GERENTE' }],
    ['sem nome', { nome: '', senha: '12345678', perfil: 'AGRONOMO' }],
  ];
  for (const [caso, dados] of invalidos) {
    test(`cadastro recusado: ${caso}`, async ({ request }) => {
      const { token } = await login(request, 'roberto');
      const resposta = await request.post('/usuarios', {
        ...comToken(token),
        data: { nome: 'Teste', email: emailUnico('invalido'), ...dados },
      });
      await esperarErro(resposta, 422, 'DADOS_INVALIDOS');
    });
  }
});
