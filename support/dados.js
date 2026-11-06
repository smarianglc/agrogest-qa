// Fábrica de dados de estoque. Regra da suíte: o seed é só para LEITURA;
// todo teste que altera saldo ou custo cria o próprio insumo, para que nenhum teste interfira em outro
// (e para que a suíte possa rodar em paralelo e repetida sem refazer o seed).
const { expect } = require('@playwright/test');
const { comToken } = require('./api');

function nomeUnico(prefixo = 'Insumo QA') {
  return `${prefixo} ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

async function criarInsumo(request, token, dados = {}) {
  const resposta = await request.post('/insumos', {
    ...comToken(token),
    data: { nome: nomeUnico(), categoria: 'FERTILIZANTE', unidade: 'KG', ...dados },
  });
  expect(resposta.status(), 'criação do insumo de teste').toBe(201);
  return resposta.json();
}

function lancarNota(request, token, insumoId, quantidade, valorTotal, extras = {}) {
  return request.post('/entradas-nota', {
    ...comToken(token),
    data: {
      insumoId,
      numeroNota: `NF-${Date.now()}`,
      fornecedor: 'Agro Insumos Fictícios',
      quantidade,
      valorTotal,
      dataEmissao: '2026-11-05',
      ...extras,
    },
  });
}

// Lança a nota e já confere que foi aceita; devolve o insumo atualizado
async function lancarNotaValida(request, token, insumoId, quantidade, valorTotal) {
  const resposta = await lancarNota(request, token, insumoId, quantidade, valorTotal);
  expect(resposta.status(), `nota de ${quantidade} por ${valorTotal}`).toBe(201);
  return (await resposta.json()).insumo;
}

async function buscarInsumo(request, token, id) {
  const resposta = await request.get(`/insumos/${id}`, comToken(token));
  expect(resposta.status()).toBe(200);
  return resposta.json();
}

module.exports = { nomeUnico, criarInsumo, lancarNota, lancarNotaValida, buscarInsumo };
