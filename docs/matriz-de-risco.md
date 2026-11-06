# Matriz de risco — AgroGest API v0.1

A matriz decide **onde testar primeiro e com que profundidade**. Ela parte do histórico da AgroGest descrito na especificação: os incidentes recorrentes em produção eram de **cálculo financeiro** e **vazamento de dados entre fazendas**. Por isso esses dois temas pesam mais na probabilidade e no impacto.

## Escala

| Nota | Probabilidade | Impacto |
| --- | --- | --- |
| 3 | Já aconteceu ou o código é complexo/concorrente | Dinheiro errado, dado de outro cliente exposto ou risco jurídico |
| 2 | Pode acontecer com uso normal | Operação errada que o usuário percebe e corrige |
| 1 | Improvável | Incômodo, sem perda de dado ou dinheiro |

**Nível** = probabilidade × impacto: 9 ou 6 é **crítico**, 4 ou 3 é **alto**, 2 ou 1 é **moderado**.

## Riscos da v0.1

| ID | Risco | Regras | P | I | Nível | Como a suíte mitiga | Testes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-01 | Usuário vê ou altera dados de outra fazenda | RN-01, RN-21, BUG-01 | 3 | 3 | **Crítico (9)** | Lista, busca por id, nota e cadastro testados entre fazendas; 404 idêntico ao de recurso inexistente; troca de fazenda sem mistura de dados; tentativa de enviar `fazendaId` no corpo; prova automática do BUG-01 no CI | 14 (RN-01) + 9 (RN-21) |
| R-02 | Custo médio ou saldo calculado errado | RN-05 | 3 | 3 | **Crítico (9)** | Exemplo oficial (R$ 3,17), primeira entrada, três casos de arredondamento (inclusive o meio exato), 3 casas fracionadas, números em texto | 11 |
| R-03 | Notas simultâneas perdem entrada de estoque | RN-05 | 2 | 3 | **Crítico (6)** | 10 notas em paralelo no mesmo insumo: saldo e quantidade de notas conferidos | 1 |
| R-04 | Acesso sem autenticação válida | RN-03 | 2 | 3 | **Crítico (6)** | Sem token, esquema errado, token expirado (sem espera fixa), assinatura falsa, `alg: none` e perfil adulterado no token | 9 |
| R-05 | Perfil acessa o que não deve | RN-02, gestão de usuários | 2 | 3 | **Crítico (6)** | AGRONOMO fora das notas; só ADMIN gerencia usuários; perfil mantido depois da troca de fazenda | 3 + 7 |
| R-06 | Nota inválida grava ou altera estoque | RN-06, validação da nota | 2 | 2 | Alto (4) | Zero, negativo, casas decimais a mais, datas e campos inválidos; **cada recusa confere que o saldo não mudou** | 6 + 9 |
| R-07 | Alerta de estoque mínimo errado | RN-07 | 1 | 2 | Moderado (2) | Valor limite (99,999 em alerta; 100,000 fora), filtro `?alerta=true` | 4 |
| R-08 | E-mail duplicado entre usuários | RN-04 | 1 | 2 | Moderado (2) | Outra fazenda, mesma fazenda, maiúsculas e criação simultânea | 4 |
| R-09 | Contrato da API muda sem aviso (formato dos campos) | Convenções da API | 2 | 2 | Alto (4) | Formato exato das respostas (decimais em texto com casas fixas, campos de usuário sem senha) | vários |

Os números de testes vêm de [rastreabilidade.md](rastreabilidade.md), que é gerado a partir do código.

## Riscos aceitos

Riscos que a AgroGest decidiu **aceitar** em vez de eliminar. Aceitar um risco é uma decisão de negócio registrada, não um esquecimento.

| Código | Risco | Situação | Justificativa e mitigação |
| --- | --- | --- | --- |
| RA-01 | Vínculo ou usuário desativado continua com acesso até o token expirar | **Aceito** (especificação) | Conferir a cada requisição custa uma consulta em todas as rotas. Mitigação: token de 1 h; login e troca de fazenda recusam vínculo e usuário inativos. **Teste automatizado adiado**: o seed não tem vínculo inativo e não existe rota para desativar (ver Lacunas). |
| RA-02 | O `409` do RN-04 permite a um ADMIN descobrir se um e-mail existe em outra fazenda | **Candidato (proposta)** | O comportamento é o que a especificação pede. O login não tem esse problema: senha errada e e-mail inexistente recebem a mesma resposta (testado). Registrar na especificação se aprovado. |
| RA-03 | Custo médio guardado com 2 casas se afasta alguns centavos do valor real do estoque depois de muitas entradas | **Candidato (proposta)** | Segue a especificação (`NUMERIC(14,2)`). A alternativa é guardar 4 casas e arredondar só na exibição, o que muda a especificação. Registrar se aprovado. |

## Lacunas conhecidas

Ficam registradas para a revisão de cobertura no fim do projeto:

- **RA-01 sem teste automatizado:** falta no seed da API um vínculo e um usuário inativos (ou uma rota para desativar).
- **RN-02, parte "FINANCEIRO não registra aplicação":** depende das aplicações da v0.3 (o teste já existe como pendente).
- **Testes de contrato formais** contra o `openapi.json`: planejados para a v0.2.
- **Desempenho e carga:** fora do escopo da v0.1; o teste de concorrência cobre só a integridade, não o tempo de resposta.
