// Gera docs/rastreabilidade.md a partir das tags dos testes (@RN-XX, @BUG-XX).
// Assim a tabela nunca fica desatualizada: quem manda é o código dos testes.
// Uso: npm run rastreabilidade   (não precisa do ambiente no ar; só lista os testes)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const VERSAO_API_ATUAL = '0.1';

// Catálogo da especificação (fonte de verdade): código, versão do roadmap e resumo da regra
const CATALOGO = [
  ['RN-01', '0.1', 'Acesso só à fazenda ativa no token (404)'],
  ['RN-02', '0.1', 'AGRONOMO fora do financeiro; FINANCEIRO não registra aplicação (403)'],
  ['RN-03', '0.1', 'Sem token ou token expirado é recusado (401)'],
  ['RN-04', '0.1', 'E-mail único em todo o sistema (409)'],
  ['RN-05', '0.1', 'Nota soma ao saldo e recalcula o custo médio ponderado'],
  ['RN-06', '0.1', 'Quantidade e valor da nota maiores que zero (422)'],
  ['RN-07', '0.1', 'Saldo abaixo do mínimo marca alerta'],
  ['RN-08', '0.3', 'Aplicação realizada não excede o saldo (422)'],
  ['RN-09', '0.3', 'Aplicação baixa o estoque na mesma transação'],
  ['RN-10', '0.3', 'Custo da aplicação = dose × área × custo médio'],
  ['RN-11', '0.3', 'Soma dos talhões não passa da área da fazenda (422)'],
  ['RN-12', '0.3', 'Safra encerrada não aceita aplicações (422)'],
  ['RN-13', '0.2', 'Parcelas somam o total; centavos na última'],
  ['RN-14', '0.2', 'Parcelas entre 1 e 12 (422)'],
  ['RN-15', '0.2', 'Conta paga não é editada nem excluída (422)'],
  ['RN-16', '0.2', 'Competência fechada não aceita lançamentos (422)'],
  ['RN-17', '0.2', 'Só ADMIN ou FINANCEIRO fecham o mês (403)'],
  ['RN-18', '0.3', 'Área aplicada > 0 e ≤ área do talhão (422)'],
  ['RN-19', '0.3', 'Defensivo realizado exige receituário e responsável (422)'],
  ['RN-20', '0.3', 'Aplicação planejada não baixa estoque nem gera custo'],
  ['RN-21', '0.1', 'Troca de fazenda gera token novo; sem vínculo é recusada (404)'],
  ['BUG-01', '0.1', 'Listagem de insumos ignora o filtro de fazenda (RN-01)'],
  ['BUG-02', '0.2', 'Parcelas arredondadas para baixo (RN-13)'],
  ['BUG-03', '0.3', 'Estoque baixado antes de validar a safra (RN-09)'],
  ['BUG-04', '0.2', 'AGRONOMO lista contas a pagar (RN-02)'],
  ['BUG-05', '0.2', 'Fechamento não bloqueia o último dia (RN-16)'],
  ['BUG-06', '0.3', '(front) Menu do AGRONOMO mostra Contas a pagar (RF-01)'],
  ['BUG-07', '0.3', '(front) Botão de salvar nota não desabilita (RF-05)'],
];

function listarTestes() {
  const saida = execSync('npx playwright test --list --reporter=json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const relatorio = JSON.parse(saida);
  const testes = [];
  const percorrer = (suite, describe = []) => {
    const titulos = suite.file && suite.title === suite.file ? describe : [...describe, suite.title];
    for (const spec of suite.specs || []) {
      const pendente = spec.tests.some((t) => t.expectedStatus === 'skipped' || t.annotations.some((a) => a.type === 'fixme'));
      testes.push({ titulo: spec.title, describe: titulos.filter(Boolean).join(' › '), arquivo: `tests/${spec.file}`, linha: spec.line, tags: spec.tags, pendente });
    }
    for (const filha of suite.suites || []) percorrer(filha, titulos);
  };
  relatorio.suites.forEach((s) => percorrer(s));
  return testes;
}

function situacao(versao, ativos, pendentes) {
  if (Number(versao) > Number(VERSAO_API_ATUAL)) return `Fora do escopo da API atual (v${versao})`;
  if (ativos > 0 && pendentes > 0) return 'Coberta (parte pendente)';
  if (ativos > 0) return 'Coberta';
  return pendentes > 0 ? 'Pendente' : '**Sem teste**';
}

function gerar() {
  const testes = listarTestes();
  // O Playwright extrai as tags do título e as entrega sem o "@" (ex.: "RN-05")
  const semArroba = (tag) => tag.replace(/^@/, '');
  const comTag = (codigo) => testes.filter((t) => t.tags.map(semArroba).includes(codigo));
  const linhas = [];

  linhas.push('# Rastreabilidade: regras e bugs × testes');
  linhas.push('');
  linhas.push('> Arquivo **gerado** por `npm run rastreabilidade` a partir das tags dos testes. Não edite à mão.');
  linhas.push('> Fonte das regras: especificação da AgroGest. API testada: v' + VERSAO_API_ATUAL + '.');
  linhas.push('');

  const ativos = testes.filter((t) => !t.pendente).length;
  const pendentes = testes.length - ativos;
  linhas.push(`**Total:** ${testes.length} testes (${ativos} ativos, ${pendentes} ${pendentes === 1 ? 'pendente' : 'pendentes'}).`);
  linhas.push('');
  linhas.push('## Resumo por regra');
  linhas.push('');
  linhas.push('| Código | Regra | Versão | Testes ativos | Pendentes | Situação |');
  linhas.push('| --- | --- | --- | --- | --- | --- |');
  for (const [codigo, versao, resumo] of CATALOGO) {
    const lista = comTag(codigo);
    const nAtivos = lista.filter((t) => !t.pendente).length;
    const nPendentes = lista.length - nAtivos;
    linhas.push(`| ${codigo} | ${resumo} | v${versao} | ${nAtivos} | ${nPendentes} | ${situacao(versao, nAtivos, nPendentes)} |`);
  }

  linhas.push('');
  linhas.push('## Testes por regra');
  for (const [codigo] of CATALOGO) {
    const lista = comTag(codigo);
    if (lista.length === 0) continue;
    linhas.push('');
    linhas.push(`### ${codigo}`);
    linhas.push('');
    for (const t of lista) {
      linhas.push(`- ${t.pendente ? '⏸️ ' : ''}${t.titulo.replace(/\s*@\S+/g, '')} — [${t.arquivo}:${t.linha}](../${t.arquivo}#L${t.linha})`);
    }
  }

  const semTag = testes.filter((t) => !t.tags.map(semArroba).some((tag) => /^(RN|BUG)-/.test(tag)));
  linhas.push('');
  linhas.push('## Testes sem RN numerada');
  linhas.push('');
  linhas.push('Cobrem comportamentos definidos nas personas, nas convenções da API ou em propostas das etapas (login, gestão de usuários, cadastro e validação).');
  const porArquivo = {};
  for (const t of semTag) (porArquivo[t.arquivo] ||= []).push(t);
  for (const [arquivo, lista] of Object.entries(porArquivo)) {
    linhas.push('');
    linhas.push(`**${arquivo}** (${lista.length})`);
    linhas.push('');
    for (const t of lista) linhas.push(`- ${t.titulo}`);
  }
  linhas.push('');

  const destino = path.join(__dirname, '..', 'docs', 'rastreabilidade.md');
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, linhas.join('\n'));
  console.log(`docs/rastreabilidade.md gerado: ${testes.length} testes, ${CATALOGO.length} regras e bugs no catálogo.`);
}

gerar();
