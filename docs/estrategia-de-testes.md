# Estratégia de testes — AgroGest

> A AgroGest é uma empresa **fictícia**. Os números de incidentes da narrativa são ilustrativos; os números de testes, tempos e execuções deste documento são **medidos neste repositório**.

## 1. Contexto: o problema que a estratégia resolve

A AgroGest cresceu mais rápido do que o seu processo de qualidade. A situação inicial:

| Problema | Consequência | Resposta desta estratégia |
| --- | --- | --- |
| Testes 100% manuais, no fim da sprint | Defeitos descobertos tarde, regressão lenta | Suíte automatizada de API rodando a cada mudança |
| Sem ambiente estável nem massa de dados padronizada | Testes que "falham às vezes" | Ambiente em Docker com a imagem publicada e seed reprodutível |
| Releases sem critério de go/no-go | Versões quebradas em produção | Critério objetivo: a regressão tem que estar verde no CI |
| Incidentes de cálculo financeiro e vazamento entre fazendas | Prejuízo e risco jurídico | Esses dois temas recebem a maior profundidade de teste (ver matriz) |
| Cada squad testa de um jeito | Cobertura desigual | Um repositório de QA comum, com convenções e rastreabilidade |

## 2. Objetivos

Vindos da especificação:

1. **Proteger primeiro** o que gera dinheiro ou risco jurídico: cálculo financeiro e isolamento de dados.
2. **Testar cedo:** API antes da interface (shift-left).
3. **Nenhuma versão vai para produção sem a regressão verde** no CI.
4. **Medir a qualidade** com indicadores simples.

## 3. Escopo

**Nesta versão (API v0.1):** acesso e perfis (RN-01 a RN-04), troca de fazenda (RN-21), estoque de insumos (RN-05 a RN-07) e o BUG-01.

**Fora desta versão:** financeiro (v0.2), safra e aplicações (v0.3), front e E2E (v0.3), desempenho e carga.

## 4. Abordagem

### Prioridade por risco
A profundidade de cada área vem da [matriz de risco](matriz-de-risco.md). Os quatro riscos críticos (vazamento entre fazendas, custo médio, concorrência e autenticação) concentram a maior parte dos testes.

### Pirâmide: API primeiro
As regras de negócio são testadas **na API**, que é onde moram. O E2E (v0.3) vai cobrir só o **fluxo integrado** e as regras de interface (RF-XX), sem repetir as regras que a API já prova. Isso mantém a suíte rápida e evita testar a mesma regra duas vezes.

### Testar contra a imagem publicada
O `agrogest-qa` nunca usa o código da API. Ele sobe a imagem `ghcr.io/smarianglc/agrogest-api:<versão>`. Cada relatório diz exatamente **qual versão foi testada**, e qualquer versão pode ser testada de novo.

### Tipos de teste aplicados

| Tipo | Onde | Exemplo |
| --- | --- | --- |
| Fumaça | `fumaca.spec.js` | API no ar, seed carregado, contrato publicado na versão esperada |
| Regras de negócio | Uma suíte por RN | RN-05: custo médio do exemplo oficial = R$ 3,17 |
| Valor limite | RN-06, RN-07 | Saldo 99,999 em alerta; 100,000 fora do alerta |
| Segurança | RN-01, RN-03, login | Token falsificado, `alg: none`, perfil adulterado, resposta idêntica para e-mail inexistente |
| Concorrência | RN-04, RN-05 | 10 notas simultâneas sem perder entrada; e-mail duplicado ao mesmo tempo |
| Efeito colateral | RN-06, validação | Toda recusa confere que o saldo **não mudou** |
| Formato do contrato | Respostas | Decimais em texto com casas fixas; usuário sem senha na resposta |

## 5. Ambiente e dados

- **Ambiente:** `docker compose` com PostgreSQL 16 e a imagem da API, nas portas 3100 e 5433, para não conflitar com o ambiente de desenvolvimento.
- **Seed só para leitura:** personas, fazendas e o insumo da Rio Verde.
- **Dados próprios por teste:** todo teste que altera estoque cria o próprio insumo pela API. Isso garante paralelismo, independência de ordem e repetição sem refazer o seed.
- **Tokens de teste:** gerados com o segredo do ambiente de teste, para provar expiração e falsificação sem esperas fixas.

## 6. Prova de que a suíte encontra defeitos

A API tem bugs plantados, ligados por `BUGS_ENABLED`. Os testes que cada bug derruba levam a tag do bug (`@BUG-01`).

| Ambiente | Testes `@BUG-01` | Demais testes |
| --- | --- | --- |
| Sem bugs | passam | passam |
| `BUGS_ENABLED=BUG-01` | **falham** | passam |

O CI verifica as duas colunas automaticamente. Se um teste do bug passar com o bug ligado, o CI fica vermelho: a suíte perdeu a capacidade de detectar aquele defeito.

## 7. Critérios de entrada e saída (go/no-go)

**Entrada:** a versão da API está publicada no GHCR; o teste de fumaça passa.

**Saída (go):**
- Job **Regressão** verde: todos os testes ativos passam.
- Job **Prova de bugs** verde para todos os bugs da versão.
- Nenhum teste com nova tentativa automática (`retries: 0`): um teste instável é corrigido, não repetido até passar.
- Pendências (testes `fixme`) justificadas e ligadas a uma versão futura.

Qualquer item vermelho é **no-go**.

## 8. Rastreabilidade

Cada teste carrega no título a regra que cobre. O documento [rastreabilidade.md](rastreabilidade.md) é **gerado a partir do código** (`npm run rastreabilidade`) e mostra regra → testes → situação. O CI confere se ele está atualizado.

## 9. Indicadores

| Indicador (objetivo 4) | Como medir | Valor atual |
| --- | --- | --- |
| Cobertura dos fluxos críticos | Regras da versão com pelo menos um teste ativo | **8 de 8** regras da v0.1 (RN-02 com uma parte pendente para a v0.3) |
| Tempo de regressão | Duração da suíte no CI | **8 s** a suíte; **54 s** o job completo, com ambiente |
| Detecção de defeitos plantados | Bugs da versão detectados pela prova de bugs | **1 de 1** (BUG-01) |
| Estabilidade | Execuções repetidas sem nova tentativa | **276 de 276** em 3 repetições seguidas, sem refazer o seed |
| Defeitos escapados | Defeitos achados depois do go, por versão | A medir a partir da v0.2, quando houver histórico de versões |

## 10. Evolução

| Versão da API | O que entra no QA |
| --- | --- |
| v0.2 | Suíte financeira com valores limite (RN-13 a RN-17), testes de contrato contra o `openapi.json`, prova de BUG-02, BUG-04 e BUG-05 |
| v0.3 | Fluxo integrado E2E em Cypress e em Playwright, regras de interface (RF-01 a RF-08), prova de BUG-03, BUG-06 e BUG-07 |
| Fim do projeto | Revisão de cobertura: o que a API precisa ganhar para fechar as lacunas da matriz |
