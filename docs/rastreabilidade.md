# Rastreabilidade: regras e bugs × testes

> Arquivo **gerado** por `npm run rastreabilidade` a partir das tags dos testes. Não edite à mão.
> Fonte das regras: especificação da AgroGest. API testada: v0.1.

**Total:** 93 testes (92 ativos, 1 pendente).

## Resumo por regra

| Código | Regra | Versão | Testes ativos | Pendentes | Situação |
| --- | --- | --- | --- | --- | --- |
| RN-01 | Acesso só à fazenda ativa no token (404) | v0.1 | 14 | 0 | Coberta |
| RN-02 | AGRONOMO fora do financeiro; FINANCEIRO não registra aplicação (403) | v0.1 | 3 | 1 | Coberta (parte pendente) |
| RN-03 | Sem token ou token expirado é recusado (401) | v0.1 | 9 | 0 | Coberta |
| RN-04 | E-mail único em todo o sistema (409) | v0.1 | 4 | 0 | Coberta |
| RN-05 | Nota soma ao saldo e recalcula o custo médio ponderado | v0.1 | 11 | 0 | Coberta |
| RN-06 | Quantidade e valor da nota maiores que zero (422) | v0.1 | 6 | 0 | Coberta |
| RN-07 | Saldo abaixo do mínimo marca alerta | v0.1 | 4 | 0 | Coberta |
| RN-08 | Aplicação realizada não excede o saldo (422) | v0.3 | 0 | 0 | Fora do escopo da API atual (v0.3) |
| RN-09 | Aplicação baixa o estoque na mesma transação | v0.3 | 0 | 0 | Fora do escopo da API atual (v0.3) |
| RN-10 | Custo da aplicação = dose × área × custo médio | v0.3 | 0 | 0 | Fora do escopo da API atual (v0.3) |
| RN-11 | Soma dos talhões não passa da área da fazenda (422) | v0.3 | 0 | 0 | Fora do escopo da API atual (v0.3) |
| RN-12 | Safra encerrada não aceita aplicações (422) | v0.3 | 0 | 0 | Fora do escopo da API atual (v0.3) |
| RN-13 | Parcelas somam o total; centavos na última | v0.2 | 0 | 0 | Fora do escopo da API atual (v0.2) |
| RN-14 | Parcelas entre 1 e 12 (422) | v0.2 | 0 | 0 | Fora do escopo da API atual (v0.2) |
| RN-15 | Conta paga não é editada nem excluída (422) | v0.2 | 0 | 0 | Fora do escopo da API atual (v0.2) |
| RN-16 | Competência fechada não aceita lançamentos (422) | v0.2 | 0 | 0 | Fora do escopo da API atual (v0.2) |
| RN-17 | Só ADMIN ou FINANCEIRO fecham o mês (403) | v0.2 | 0 | 0 | Fora do escopo da API atual (v0.2) |
| RN-18 | Área aplicada > 0 e ≤ área do talhão (422) | v0.3 | 0 | 0 | Fora do escopo da API atual (v0.3) |
| RN-19 | Defensivo realizado exige receituário e responsável (422) | v0.3 | 0 | 0 | Fora do escopo da API atual (v0.3) |
| RN-20 | Aplicação planejada não baixa estoque nem gera custo | v0.3 | 0 | 0 | Fora do escopo da API atual (v0.3) |
| RN-21 | Troca de fazenda gera token novo; sem vínculo é recusada (404) | v0.1 | 9 | 0 | Coberta |
| BUG-01 | Listagem de insumos ignora o filtro de fazenda (RN-01) | v0.1 | 3 | 0 | Coberta |
| BUG-02 | Parcelas arredondadas para baixo (RN-13) | v0.2 | 0 | 0 | Fora do escopo da API atual (v0.2) |
| BUG-03 | Estoque baixado antes de validar a safra (RN-09) | v0.3 | 0 | 0 | Fora do escopo da API atual (v0.3) |
| BUG-04 | AGRONOMO lista contas a pagar (RN-02) | v0.2 | 0 | 0 | Fora do escopo da API atual (v0.2) |
| BUG-05 | Fechamento não bloqueia o último dia (RN-16) | v0.2 | 0 | 0 | Fora do escopo da API atual (v0.2) |
| BUG-06 | (front) Menu do AGRONOMO mostra Contas a pagar (RF-01) | v0.3 | 0 | 0 | Fora do escopo da API atual (v0.3) |
| BUG-07 | (front) Botão de salvar nota não desabilita (RF-05) | v0.3 | 0 | 0 | Fora do escopo da API atual (v0.3) |

## Testes por regra

### RN-01

- a lista do ADMIN da Boa Safra não traz ninguém da Rio Verde — [tests/api/acesso/rn-01-isolamento.spec.js:18](../tests/api/acesso/rn-01-isolamento.spec.js#L18)
- a lista da Rio Verde traz a Juliana, que tem vínculo nas duas fazendas — [tests/api/acesso/rn-01-isolamento.spec.js:27](../tests/api/acesso/rn-01-isolamento.spec.js#L27)
- o ADMIN da Boa Safra recebe 404 ao buscar um usuário da Rio Verde pelo id — [tests/api/acesso/rn-01-isolamento.spec.js:34](../tests/api/acesso/rn-01-isolamento.spec.js#L34)
- a mesma busca feita pela própria fazenda funciona (controle) — [tests/api/acesso/rn-01-isolamento.spec.js:39](../tests/api/acesso/rn-01-isolamento.spec.js#L39)
- usuário de outra fazenda e usuário inexistente recebem a mesma resposta — [tests/api/acesso/rn-01-isolamento.spec.js:45](../tests/api/acesso/rn-01-isolamento.spec.js#L45)
- /fazendas/atual devolve a fazenda do token, com a área em texto de 2 casas — [tests/api/acesso/rn-01-isolamento.spec.js:51](../tests/api/acesso/rn-01-isolamento.spec.js#L51)
- depois da troca, nenhum dado da fazenda anterior aparece — [tests/api/acesso/rn-21-troca-fazenda.spec.js:38](../tests/api/acesso/rn-21-troca-fazenda.spec.js#L38)
- a lista de insumos da Boa Safra só traz insumos da Boa Safra — [tests/api/estoque/rn-01-isolamento-insumos.spec.js:23](../tests/api/estoque/rn-01-isolamento-insumos.spec.js#L23)
- o filtro de alerta também não traz insumo de outra fazenda — [tests/api/estoque/rn-01-isolamento-insumos.spec.js:30](../tests/api/estoque/rn-01-isolamento-insumos.spec.js#L30)
- buscar pelo id um insumo de outra fazenda responde 404 — [tests/api/estoque/rn-01-isolamento-insumos.spec.js:36](../tests/api/estoque/rn-01-isolamento-insumos.spec.js#L36)
- insumo de outra fazenda e insumo inexistente recebem a mesma resposta — [tests/api/estoque/rn-01-isolamento-insumos.spec.js:40](../tests/api/estoque/rn-01-isolamento-insumos.spec.js#L40)
- nota com insumo de outra fazenda é recusada e o saldo dele não muda — [tests/api/estoque/rn-01-isolamento-insumos.spec.js:46](../tests/api/estoque/rn-01-isolamento-insumos.spec.js#L46)
- o cadastro ignora um fazendaId enviado no corpo: o insumo nasce na fazenda do token — [tests/api/estoque/rn-01-isolamento-insumos.spec.js:53](../tests/api/estoque/rn-01-isolamento-insumos.spec.js#L53)
- a nota lançada na Rio Verde não aparece nas entradas da Boa Safra — [tests/api/estoque/rn-01-isolamento-insumos.spec.js:63](../tests/api/estoque/rn-01-isolamento-insumos.spec.js#L63)

### RN-02

- o AGRONOMO não lista entradas de nota — [tests/api/acesso/rn-02-perfil-financeiro.spec.js:7](../tests/api/acesso/rn-02-perfil-financeiro.spec.js#L7)
- o AGRONOMO não lança entrada de nota — [tests/api/acesso/rn-02-perfil-financeiro.spec.js:12](../tests/api/acesso/rn-02-perfil-financeiro.spec.js#L12)
- o FINANCEIRO e o ADMIN acessam as entradas de nota (controle) — [tests/api/acesso/rn-02-perfil-financeiro.spec.js:22](../tests/api/acesso/rn-02-perfil-financeiro.spec.js#L22)
- ⏸️ o FINANCEIRO não registra aplicação — [tests/api/acesso/rn-02-perfil-financeiro.spec.js:29](../tests/api/acesso/rn-02-perfil-financeiro.spec.js#L29)

### RN-03

- sem token, a requisição é recusada — [tests/api/acesso/rn-03-autenticacao.spec.js:18](../tests/api/acesso/rn-03-autenticacao.spec.js#L18)
- esquema diferente de Bearer é recusado — [tests/api/acesso/rn-03-autenticacao.spec.js:23](../tests/api/acesso/rn-03-autenticacao.spec.js#L23)
- token expirado é recusado com a mensagem "Token expirado" — [tests/api/acesso/rn-03-autenticacao.spec.js:28](../tests/api/acesso/rn-03-autenticacao.spec.js#L28)
- o mesmo token, ainda válido, é aceito (controle do teste acima) — [tests/api/acesso/rn-03-autenticacao.spec.js:35](../tests/api/acesso/rn-03-autenticacao.spec.js#L35)
- token com texto aleatório é recusado como inválido — [tests/api/acesso/rn-03-autenticacao.spec.js:41](../tests/api/acesso/rn-03-autenticacao.spec.js#L41)
- token assinado com outro segredo é recusado — [tests/api/acesso/rn-03-autenticacao.spec.js:46](../tests/api/acesso/rn-03-autenticacao.spec.js#L46)
- token sem assinatura ("alg: none") é recusado — [tests/api/acesso/rn-03-autenticacao.spec.js:51](../tests/api/acesso/rn-03-autenticacao.spec.js#L51)
- token com o perfil adulterado perde a assinatura e é recusado — [tests/api/acesso/rn-03-autenticacao.spec.js:56](../tests/api/acesso/rn-03-autenticacao.spec.js#L56)
- sem token, a troca é recusada — [tests/api/acesso/rn-21-troca-fazenda.spec.js:82](../tests/api/acesso/rn-21-troca-fazenda.spec.js#L82)

### RN-04

- e-mail já usado em outra fazenda é recusado — [tests/api/acesso/rn-04-email-unico.spec.js:17](../tests/api/acesso/rn-04-email-unico.spec.js#L17)
- e-mail já usado na própria fazenda é recusado — [tests/api/acesso/rn-04-email-unico.spec.js:21](../tests/api/acesso/rn-04-email-unico.spec.js#L21)
- o mesmo e-mail com maiúsculas e espaços também é recusado — [tests/api/acesso/rn-04-email-unico.spec.js:25](../tests/api/acesso/rn-04-email-unico.spec.js#L25)
- duas criações simultâneas com o mesmo e-mail: só uma é aceita — [tests/api/acesso/rn-04-email-unico.spec.js:29](../tests/api/acesso/rn-04-email-unico.spec.js#L29)

### RN-05

- o seed traz a Ureia do exemplo oficial: 10.000 kg a R$ 3,00 — [tests/api/estoque/rn-05-custo-medio.spec.js:15](../tests/api/estoque/rn-05-custo-medio.spec.js#L15)
- exemplo oficial: 10.000 kg a R$ 3,00 + nota de 5.000 kg por R$ 17.500,00 = 15.000 kg a R$ 3,17 — [tests/api/estoque/rn-05-custo-medio.spec.js:21](../tests/api/estoque/rn-05-custo-medio.spec.js#L21)
- primeira nota num insumo zerado define o custo médio pelo valor unitário — [tests/api/estoque/rn-05-custo-medio.spec.js:32](../tests/api/estoque/rn-05-custo-medio.spec.js#L32)
- arredondamento do custo médio: 3 por R$ 10 → 3.33 (3,333... arredonda para baixo) — [tests/api/estoque/rn-05-custo-medio.spec.js:46](../tests/api/estoque/rn-05-custo-medio.spec.js#L46)
- arredondamento do custo médio: 3 por R$ 10.01 → 3.34 (3,3366... arredonda para cima) — [tests/api/estoque/rn-05-custo-medio.spec.js:46](../tests/api/estoque/rn-05-custo-medio.spec.js#L46)
- arredondamento do custo médio: 2 por R$ 0.25 → 0.13 (meio exato (0,125) sobe: ROUND_HALF_UP) — [tests/api/estoque/rn-05-custo-medio.spec.js:46](../tests/api/estoque/rn-05-custo-medio.spec.js#L46)
- quantidade fracionada com 3 casas é somada sem perda — [tests/api/estoque/rn-05-custo-medio.spec.js:53](../tests/api/estoque/rn-05-custo-medio.spec.js#L53)
- números enviados como texto são aceitos e dão o mesmo resultado — [tests/api/estoque/rn-05-custo-medio.spec.js:60](../tests/api/estoque/rn-05-custo-medio.spec.js#L60)
- a resposta traz a nota e o insumo atualizado, com decimais em texto de casas fixas — [tests/api/estoque/rn-05-custo-medio.spec.js:66](../tests/api/estoque/rn-05-custo-medio.spec.js#L66)
- a nota lançada aparece na lista de entradas da fazenda — [tests/api/estoque/rn-05-custo-medio.spec.js:85](../tests/api/estoque/rn-05-custo-medio.spec.js#L85)
- 10 notas simultâneas no mesmo insumo: nenhuma entrada se perde — [tests/api/estoque/rn-05-custo-medio.spec.js:92](../tests/api/estoque/rn-05-custo-medio.spec.js#L92)

### RN-06

- quantidade zero é recusada e o estoque não muda — [tests/api/estoque/rn-06-valores-positivos.spec.js:23](../tests/api/estoque/rn-06-valores-positivos.spec.js#L23)
- quantidade negativa é recusada e o estoque não muda — [tests/api/estoque/rn-06-valores-positivos.spec.js:23](../tests/api/estoque/rn-06-valores-positivos.spec.js#L23)
- valor zero é recusada e o estoque não muda — [tests/api/estoque/rn-06-valores-positivos.spec.js:23](../tests/api/estoque/rn-06-valores-positivos.spec.js#L23)
- valor negativo é recusada e o estoque não muda — [tests/api/estoque/rn-06-valores-positivos.spec.js:23](../tests/api/estoque/rn-06-valores-positivos.spec.js#L23)
- quantidade e valor zero é recusada e o estoque não muda — [tests/api/estoque/rn-06-valores-positivos.spec.js:23](../tests/api/estoque/rn-06-valores-positivos.spec.js#L23)
- o menor valor positivo aceito (0,001 e R$ 0,01) passa (limite) — [tests/api/estoque/rn-06-valores-positivos.spec.js:33](../tests/api/estoque/rn-06-valores-positivos.spec.js#L33)

### RN-07

- no seed, o Herbicida e a Semente de soja estão em alerta; Ureia e KCl não — [tests/api/estoque/rn-07-alerta-estoque.spec.js:17](../tests/api/estoque/rn-07-alerta-estoque.spec.js#L17)
- o filtro ?alerta=true devolve só insumos com emAlerta verdadeiro — [tests/api/estoque/rn-07-alerta-estoque.spec.js:24](../tests/api/estoque/rn-07-alerta-estoque.spec.js#L24)
- valores limite: abaixo do mínimo alerta; igual ou acima não alerta — [tests/api/estoque/rn-07-alerta-estoque.spec.js:30](../tests/api/estoque/rn-07-alerta-estoque.spec.js#L30)
- insumo sem estoque mínimo definido nunca entra em alerta — [tests/api/estoque/rn-07-alerta-estoque.spec.js:43](../tests/api/estoque/rn-07-alerta-estoque.spec.js#L43)

### RN-21

- o login da Juliana lista as duas fazendas e entra na primeira (Boa Safra) — [tests/api/acesso/rn-21-troca-fazenda.spec.js:17](../tests/api/acesso/rn-21-troca-fazenda.spec.js#L17)
- trocar para a Rio Verde devolve um token novo dessa fazenda, com o perfil do vínculo — [tests/api/acesso/rn-21-troca-fazenda.spec.js:26](../tests/api/acesso/rn-21-troca-fazenda.spec.js#L26)
- depois da troca, nenhum dado da fazenda anterior aparece — [tests/api/acesso/rn-21-troca-fazenda.spec.js:38](../tests/api/acesso/rn-21-troca-fazenda.spec.js#L38)
- é possível voltar para a fazenda anterior — [tests/api/acesso/rn-21-troca-fazenda.spec.js:50](../tests/api/acesso/rn-21-troca-fazenda.spec.js#L50)
- o perfil continua valendo na nova fazenda: AGRONOMO não gerencia usuários lá — [tests/api/acesso/rn-21-troca-fazenda.spec.js:58](../tests/api/acesso/rn-21-troca-fazenda.spec.js#L58)
- quem não tem vínculo com a fazenda recebe 404 — [tests/api/acesso/rn-21-troca-fazenda.spec.js:64](../tests/api/acesso/rn-21-troca-fazenda.spec.js#L64)
- fazenda sem vínculo e fazenda inexistente recebem a mesma resposta — [tests/api/acesso/rn-21-troca-fazenda.spec.js:69](../tests/api/acesso/rn-21-troca-fazenda.spec.js#L69)
- sem fazendaId no corpo, a troca é recusada — [tests/api/acesso/rn-21-troca-fazenda.spec.js:76](../tests/api/acesso/rn-21-troca-fazenda.spec.js#L76)
- sem token, a troca é recusada — [tests/api/acesso/rn-21-troca-fazenda.spec.js:82](../tests/api/acesso/rn-21-troca-fazenda.spec.js#L82)

### BUG-01

- depois da troca, nenhum dado da fazenda anterior aparece — [tests/api/acesso/rn-21-troca-fazenda.spec.js:38](../tests/api/acesso/rn-21-troca-fazenda.spec.js#L38)
- a lista de insumos da Boa Safra só traz insumos da Boa Safra — [tests/api/estoque/rn-01-isolamento-insumos.spec.js:23](../tests/api/estoque/rn-01-isolamento-insumos.spec.js#L23)
- o filtro de alerta também não traz insumo de outra fazenda — [tests/api/estoque/rn-01-isolamento-insumos.spec.js:30](../tests/api/estoque/rn-01-isolamento-insumos.spec.js#L30)

## Testes sem RN numerada

Cobrem comportamentos definidos nas personas, nas convenções da API ou em propostas das etapas (login, gestão de usuários, cadastro e validação).

**tests/api/acesso/gestao-usuarios.spec.js** (7)

- juliana (sem perfil ADMIN) não lista nem cria usuários
- carlos (sem perfil ADMIN) não lista nem cria usuários
- o ADMIN cria um usuário, que já consegue entrar na mesma fazenda com o perfil escolhido
- a resposta de usuários nunca expõe a senha nem o hash
- cadastro recusado: senha com menos de 8 caracteres
- cadastro recusado: perfil inexistente
- cadastro recusado: sem nome

**tests/api/acesso/login.spec.js** (5)

- credenciais corretas devolvem token, usuário e fazendas com vínculo
- o e-mail é aceito sem diferenciar maiúsculas e espaços
- senha errada e e-mail inexistente recebem exatamente a mesma resposta
- sem e-mail ou senha, o login responde 422
- corpo que não é JSON válido responde 400

**tests/api/estoque/cadastro-insumos.spec.js** (10)

- todos os perfis consultam o estoque, inclusive o AGRONOMO
- o AGRONOMO não cadastra insumo
- ADMIN e FINANCEIRO cadastram insumo com os dados opcionais
- os dados opcionais ausentes voltam como null
- saldo e custo médio enviados no cadastro são ignorados: nascem zerados
- cadastro recusado: sem nome
- cadastro recusado: categoria inexistente
- cadastro recusado: unidade inexistente
- cadastro recusado: estoque mínimo negativo
- cadastro recusado: validade fora do formato

**tests/api/estoque/entrada-nota-validacao.spec.js** (9)

- valor com 3 casas decimais é recusado com 422 e não altera o insumo
- quantidade com 4 casas decimais é recusado com 422 e não altera o insumo
- quantidade que não é número é recusado com 422 e não altera o insumo
- valor ausente é recusado com 422 e não altera o insumo
- data fora do formato AAAA-MM-DD é recusado com 422 e não altera o insumo
- data inexistente é recusado com 422 e não altera o insumo
- sem fornecedor é recusado com 422 e não altera o insumo
- sem número da nota é recusado com 422 e não altera o insumo
- número de parcelas não inteiro é recusado com 422 e não altera o insumo

**tests/api/fumaca.spec.js** (3)

- a API responde no /health
- o seed foi carregado: o Roberto consegue fazer login
- o contrato OpenAPI está publicado na versão testada
