// RN-03: requisição sem token ou com token expirado é recusada com 401.
// Além do que a regra diz, cobre os ataques clássicos a JWT: assinatura falsa e "alg: none".
const { test, expect } = require('@playwright/test');
const { login, comToken, esperarErro } = require('../../../support/api');
const { assinar, lerPayload, agora } = require('../../../support/tokens');

// Rota protegida qualquer, acessível ao ADMIN: o foco aqui é a autenticação, não o perfil
const ROTA_PROTEGIDA = '/usuarios';

test.describe('RN-03 — autenticação por token', () => {
  let payloadRoberto;

  test.beforeAll(async ({ request }) => {
    const { token } = await login(request, 'roberto');
    payloadRoberto = lerPayload(token);
  });

  test('sem token, a requisição é recusada @RN-03', async ({ request }) => {
    const corpo = await esperarErro(await request.get(ROTA_PROTEGIDA), 401, 'RN-03');
    expect(corpo.mensagem).toBe('Token de acesso ausente');
  });

  test('esquema diferente de Bearer é recusado @RN-03', async ({ request }) => {
    const resposta = await request.get(ROTA_PROTEGIDA, { headers: { Authorization: 'Basic cm9iZXJ0bzpzZW5oYQ==' } });
    await esperarErro(resposta, 401, 'RN-03');
  });

  test('token expirado é recusado com a mensagem "Token expirado" @RN-03', async ({ request }) => {
    // Mesmo usuário e fazenda de um token real, mas vencido há 1 minuto: nenhuma espera fixa no teste
    const expirado = assinar({ ...payloadRoberto, iat: agora() - 3600, exp: agora() - 60 });
    const corpo = await esperarErro(await request.get(ROTA_PROTEGIDA, comToken(expirado)), 401, 'RN-03');
    expect(corpo.mensagem).toBe('Token expirado');
  });

  test('o mesmo token, ainda válido, é aceito (controle do teste acima) @RN-03', async ({ request }) => {
    // Prova que a recusa acima foi pela expiração, e não por outro defeito do token gerado
    const valido = assinar({ ...payloadRoberto, iat: agora(), exp: agora() + 300 });
    expect((await request.get(ROTA_PROTEGIDA, comToken(valido))).status()).toBe(200);
  });

  test('token com texto aleatório é recusado como inválido @RN-03', async ({ request }) => {
    const corpo = await esperarErro(await request.get(ROTA_PROTEGIDA, comToken('abc.def.ghi')), 401, 'RN-03');
    expect(corpo.mensagem).toBe('Token inválido');
  });

  test('token assinado com outro segredo é recusado @RN-03', async ({ request }) => {
    const falsificado = assinar({ ...payloadRoberto, exp: agora() + 300 }, { segredo: 'segredo-do-atacante' });
    await esperarErro(await request.get(ROTA_PROTEGIDA, comToken(falsificado)), 401, 'RN-03');
  });

  test('token sem assinatura ("alg: none") é recusado @RN-03', async ({ request }) => {
    const semAssinatura = assinar({ ...payloadRoberto, exp: agora() + 300 }, { alg: 'none' });
    await esperarErro(await request.get(ROTA_PROTEGIDA, comToken(semAssinatura)), 401, 'RN-03');
  });

  test('token com o perfil adulterado perde a assinatura e é recusado @RN-03', async ({ request }) => {
    // A Juliana (AGRONOMO) troca o perfil para ADMIN no corpo do token, mantendo a assinatura original
    const { token } = await login(request, 'juliana');
    const [cabecalho, , assinatura] = token.split('.');
    const corpoAdulterado = Buffer.from(JSON.stringify({ ...lerPayload(token), perfil: 'ADMIN' })).toString('base64url');
    const adulterado = `${cabecalho}.${corpoAdulterado}.${assinatura}`;
    await esperarErro(await request.get(ROTA_PROTEGIDA, comToken(adulterado)), 401, 'RN-03');
  });
});
