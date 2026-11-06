// RN-04: o e-mail do usuário é único em todo o sistema, não só na fazenda. Violação responde 409.
// Risco conhecido: o 409 permite a um ADMIN descobrir e-mails de outras fazendas (candidato a RA-02).
const { test, expect } = require('@playwright/test');
const { login, comToken, esperarErro, emailUnico } = require('../../../support/api');
const { PERSONAS } = require('../../../support/personas');

test.describe('RN-04 — e-mail único no sistema', () => {
  let token;

  test.beforeAll(async ({ request }) => {
    ({ token } = await login(request, 'roberto'));
  });

  const criar = (request, email) =>
    request.post('/usuarios', { ...comToken(token), data: { nome: 'Teste RN-04', email, senha: '12345678', perfil: 'AGRONOMO' } });

  test('e-mail já usado em outra fazenda é recusado @RN-04', async ({ request }) => {
    await esperarErro(await criar(request, PERSONAS.helena.email), 409, 'RN-04');
  });

  test('e-mail já usado na própria fazenda é recusado @RN-04', async ({ request }) => {
    await esperarErro(await criar(request, PERSONAS.carlos.email), 409, 'RN-04');
  });

  test('o mesmo e-mail com maiúsculas e espaços também é recusado @RN-04', async ({ request }) => {
    await esperarErro(await criar(request, `  ${PERSONAS.helena.email.toUpperCase()} `), 409, 'RN-04');
  });

  test('duas criações simultâneas com o mesmo e-mail: só uma é aceita @RN-04', async ({ request }) => {
    // Concorrência: as duas passam pela checagem antes de gravar; quem barra a segunda é o índice único do banco
    const email = emailUnico('simultaneo');
    const respostas = await Promise.all([criar(request, email), criar(request, email)]);
    const status = respostas.map((r) => r.status()).sort();
    expect(status).toEqual([201, 409]);
    const recusada = respostas.find((r) => r.status() === 409);
    await esperarErro(recusada, 409, 'RN-04');
  });
});
