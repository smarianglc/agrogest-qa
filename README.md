# agrogest-qa

![QA](https://github.com/smarianglc/agrogest-qa/actions/workflows/qa.yml/badge.svg)

Framework de testes da AgroGest, uma empresa **fictícia** criada para um portfólio de QA. Nenhum dado é real.

Os testes rodam contra a **imagem publicada** da API (`ghcr.io/smarianglc/agrogest-api`), nunca contra o código-fonte, como num time real: cada execução diz exatamente qual versão foi testada.

## Stack

- Playwright Test (JavaScript) para os testes de API
- Docker Compose para o ambiente de teste (PostgreSQL 16 + imagem da API)

## Como rodar

Requisitos: Node 20+ e Docker Desktop.

    npm ci
    npm run ambiente:subir      # sobe banco + API 0.1.1 em http://localhost:3100 e roda o seed
    npm test                    # executa as suítes
    npm run test:relatorio      # abre o relatório HTML
    npm run ambiente:descer     # derruba tudo e apaga o banco

Outra versão da API: `API_VERSION=0.1.0 npm run ambiente:subir`.
Com bugs propositais: `BUGS_ENABLED=BUG-01 npm run ambiente:subir`.

## Suítes

| Suíte | Pasta | Regras |
| --- | --- | --- |
| Fumaça | `tests/api/fumaca.spec.js` | Ambiente, seed e contrato publicados |
| Acesso | `tests/api/acesso/` | RN-01, RN-02, RN-03, RN-04, RN-21, login e gestão de usuários |
| Estoque | `tests/api/estoque/` | RN-05, RN-06, RN-07, RN-01 aplicado a insumos, cadastro e validação de nota |

Cada teste traz a regra no título (`@RN-03`), então dá para rodar uma regra só: `npx playwright test --grep @RN-03`.

## Dados de teste

O seed da API é usado **só para leitura** (personas, fazendas e o insumo da Rio Verde). Todo teste que altera estoque cria o próprio insumo pela API. Assim os testes rodam em paralelo, em qualquer ordem e repetidos, sem refazer o seed.

## Prova de que a suíte encontra defeitos

| Ambiente | Testes `@BUG-01` | Demais testes |
| --- | --- | --- |
| `BUGS_ENABLED=false` | passam | passam |
| `BUGS_ENABLED=BUG-01` | **falham** | passam |

    BUGS_ENABLED=BUG-01 npm run ambiente:subir
    npx playwright test --grep @BUG-01      # tem que falhar
    npm run ambiente:subir                  # volta sem bugs

## CI

O workflow `QA` roda a cada push na `main`, em pull requests e sob demanda (aba **Actions** → **QA** → **Run workflow**, escolhendo a versão da API).

| Job | O que garante |
| --- | --- |
| Regressão (sem bugs) | Toda a suíte passa contra a versão da API testada |
| Prova de bugs (BUG-01) | Com o bug ligado, os testes `@BUG-01` falham e todos os outros passam |

Os relatórios HTML de cada execução ficam como artefatos do workflow por 30 dias. O relatório do job de prova de bugs é a evidência de que a suíte detecta o defeito.

## Status

Fase 4: suítes de acesso e estoque (92 testes; 1 pendente para a v0.3 da API) rodando no CI com prova de bugs.
