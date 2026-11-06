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

// IDs das fazendas do seed, lidos do login da Juliana (a única persona com vínculo nas duas)
async function idsDasFazendas(request) {
  const { fazendas } = await login(request, 'juliana');
  const id = (nome) => fazendas.find((f) => f.nome === nome).id;
  return { boaSafra: id('Fazenda Boa Safra'), rioVerde: id('Fazenda Rio Verde') };
}

// E-mail único por execução: testes que criam usuários não colidem entre si nem com o seed
function emailUnico(prefixo = 'qa') {
  return `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@agrogest.test`;
}

module.exports = { login, comToken, esperarErro, idsDasFazendas, emailUnico };
