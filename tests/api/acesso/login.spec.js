// Login: porta de entrada de todas as regras de acesso.
// O ponto de segurança é não revelar quais e-mails existem (mesma resposta para e-mail e senha errados).
const { test, expect } = require('@playwright/test');
const { esperarErro } = require('../../../support/api');
const { PERSONAS, SENHA_SEED } = require('../../../support/personas');

test.describe('Login', () => {
  test('credenciais corretas devolvem token, usuário e fazendas com vínculo', async ({ request }) => {
    const resposta = await request.post('/auth/login', { data: { email: PERSONAS.carlos.email, senha: SENHA_SEED } });
    expect(resposta.status()).toBe(200);
    const corpo = await resposta.json();
    expect(corpo).toEqual({
      token: expect.any(String),
      usuario: { id: expect.any(String), nome: 'Carlos', perfil: 'FINANCEIRO', fazendaId: expect.any(String) },
      fazendas: [{ id: corpo.usuario.fazendaId, nome: 'Fazenda Boa Safra', perfil: 'FINANCEIRO' }],
    });
  });

  test('o e-mail é aceito sem diferenciar maiúsculas e espaços', async ({ request }) => {
    const email = `  ${PERSONAS.carlos.email.toUpperCase()}  `;
    expect((await request.post('/auth/login', { data: { email, senha: SENHA_SEED } })).status()).toBe(200);
  });

  test('senha errada e e-mail inexistente recebem exatamente a mesma resposta', async ({ request }) => {
    const senhaErrada = await request.post('/auth/login', { data: { email: PERSONAS.carlos.email, senha: 'errada' } });
    const emailInexistente = await request.post('/auth/login', { data: { email: 'ninguem@agrogest.test', senha: 'errada' } });

    const corpoSenha = await esperarErro(senhaErrada, 401, 'CREDENCIAIS_INVALIDAS');
    const corpoEmail = await esperarErro(emailInexistente, 401, 'CREDENCIAIS_INVALIDAS');
    expect(corpoEmail).toEqual(corpoSenha);
  });

  test('sem e-mail ou senha, o login responde 422', async ({ request }) => {
    await esperarErro(await request.post('/auth/login', { data: {} }), 422, 'DADOS_INVALIDOS');
    await esperarErro(await request.post('/auth/login', { data: { email: PERSONAS.carlos.email } }), 422, 'DADOS_INVALIDOS');
  });

  test('corpo que não é JSON válido responde 400', async ({ request }) => {
    const resposta = await request.post('/auth/login', {
      headers: { 'Content-Type': 'application/json' },
      data: '{ email: quebrado',
    });
    await esperarErro(resposta, 400, 'JSON_INVALIDO');
  });
});
