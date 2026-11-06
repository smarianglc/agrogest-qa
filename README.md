# agrogest-qa

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

## Status

Fase 1: ambiente e teste de fumaça.
