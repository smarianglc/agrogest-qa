// Gera tokens JWT para os testes de segurança (RN-03) sem depender de biblioteca externa.
// Usa o mesmo segredo do ambiente de teste (docker-compose.yml), nunca um segredo real.
const crypto = require('crypto');

const SEGREDO_TESTE = process.env.JWT_SECRET || 'segredo-do-ambiente-de-teste';

const base64url = (objeto) => Buffer.from(JSON.stringify(objeto)).toString('base64url');

function assinar(payload, { segredo = SEGREDO_TESTE, alg = 'HS256' } = {}) {
  const cabecalho = base64url({ alg, typ: 'JWT' });
  const corpo = base64url(payload);
  if (alg === 'none') return `${cabecalho}.${corpo}.`;
  const assinatura = crypto.createHmac('sha256', segredo).update(`${cabecalho}.${corpo}`).digest('base64url');
  return `${cabecalho}.${corpo}.${assinatura}`;
}

// Lê o payload de um token real (para reaproveitar sub, fazendaId e perfil)
function lerPayload(token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
}

const agora = () => Math.floor(Date.now() / 1000);

module.exports = { assinar, lerPayload, agora };
