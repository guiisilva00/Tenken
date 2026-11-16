# Acesso do aluno e aprovações

## Regras preservadas

- O token continua no formato `TNK-XXXX`, gerado por reserva. A exibição e a cópia na agenda do professor permanecem no fluxo existente.
- `POST /api/alunos/solicitar-acesso` mantém seu contrato e exige vínculo à turma e token de reserva ativa.
- `GET /api/checkins/atual` usa o aluno autenticado. Retorna a solicitação mais recente dentre reservas com `inicio <= NOW()`, `fim >= NOW()` e status `CONFIRMADO` ou `EM_ANDAMENTO`, exigindo vínculo atual em `turma_alunos`. Sem uma solicitação relevante, responde 404.
- A resposta mantém `aprovado`, `turma` e `equipamentos` e acrescenta `agendamento` (id, atividade, início, fim, token e nome do professor), tipo/status do equipamento e `segundos_restantes`, calculados pelo relógio do banco.
- `GET /api/checkins/pendentes` mantém o filtro por `turmas_projetos.professor_id`. Só lista pendências com reserva e vínculo ativos. `criado_em` continua sendo o momento do pedido; os horários da aula vêm do agendamento.
- A aprovação verifica o professor no serviço e novamente na escrita SQL, junto ao vínculo e à validade da reserva. Uma solicitação expirada, cancelada, concluída ou sem vínculo não pode ser aprovada.
- O token só é retornado ao próprio aluno vinculado ou ao professor autorizado. Não são enviados e-mails, senhas ou dados de outros alunos no endpoint atual.

## Frontend

- A tela `/aluno` começa em carregamento, restaura pendência/aprovação e permite repetir consultas após falha temporária. Um 409 no envio recupera o pedido existente. Ao terminar a validade, consulta novamente sem continuar exibindo a aprovação antiga.
- As rotas internas consultam o backend antes de renderizar. Acesso direto aprovado mantém a URL; pendência/ausência de acesso redireciona com explicação. Falhas temporárias mantêm a URL com opção de tentar novamente. Ao fim da reserva, o acesso à página é encerrado.
- Equipamentos e diagnóstico consomem os dados da reserva pelo contexto do layout, sem depender do sessionStorage. Status do equipamento não equivale a resultado de inspeção.
- Aprovações atualizam a cada 10 segundos enquanto a aba está visível e ao voltar à aba. O botão Atualizar permanece. Consultas simultâneas são bloqueadas, respostas anteriores à aprovação são descartadas e a lista permanece visível em caso de erro. Timers, listener e consulta pendente são limpos ao sair.

## Validação

Na pasta `backend`, com `.env` apontando para o MySQL de desenvolvimento e esquema aplicado:

```sh
node --test tests/checkins.integration.test.js
```

Os testes criam fixtures dentro de uma transação e fazem rollback ao terminar. Cobrem reservas antigas/futuras/canceladas/concluídas, restauração de pendência e aprovação, contexto/token/equipamento, professor diferente, vínculo ausente/removido/duplicado, aprovação duplicada e expiração. Não exigem alterações no esquema.

Na pasta `frontend`: `npm run build`.

Roteiro manual para validação em navegador (não automatizado neste trabalho):

1. Abrir `/aluno` com consulta lenta: conferir carregamento sem formulário antecipado; simular falha e usar Tentar novamente.
2. Enviar o token de uma reserva ativa e recarregar: conferir turma, atividade, equipamento, horários e token na pendência.
3. Manter as aprovações abertas e criar outro pedido: conferir aparecimento automático e distinção entre horário do pedido e da aula.
4. Aprovar e verificar o pedido no aluno; abrir equipamentos/diagnóstico diretamente, inclusive após limpar sessionStorage.
5. Simular erro na atualização do professor: conferir manutenção da lista; sair da página e conferir ausência de novas consultas.
6. Encerrar/cancelar a reserva e recarregar uma rota do aluno: conferir bloqueio; tentar usar um pedido de outro professor: conferir autorização negada.

## Decisão de produto pendente

Não há dados estruturados de plano de aula, procedimentos de segurança ou EPIs por reserva disponíveis para o aluno no fluxo consultado. O diagnóstico mostra atividade, professor, horários, tempo e equipamentos reais e orienta consultar o professor. É necessário definir a origem/autoria desses conteúdos antes de apresentar instruções específicas. Inspeções e abertura de chamados a partir delas continuam restritas ao professor; não foram criadas ações para o aluno.
