const { expect } = require('@playwright/test');
const { PERSONAS, SENHA_SEED } = require('./personas');

// Faz login de uma persona e devolve o corpo da resposta (token, usuario, fazendas)
async function login(request, persona) {
  const { email } = PERSONAS[persona];
  const resposta = await request.post('/auth/login', { data: { email, senha: SENHA_SEED } });
  expect(resposta.status(), `login de ${persona}`).toBe(200);
  return resposta.json();
}

// Cabeçalho de autorização pronto para usar nas chamadas
function comToken(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

// Confere o formato de erro da especificação: { codigo, mensagem }
async function esperarErro(resposta, status, codigo) {
  expect(resposta.status()).toBe(status);
  const corpo = await resposta.json();
  expect(corpo).toEqual({ codigo, mensagem: expect.any(String) });
  return corpo;
}

module.exports = { login, comToken, esperarErro };
