# Briefing para análise de pendências do projeto Tenken

## Objetivo

Analise este repositório e produza um diagnóstico do que ainda precisa ser feito para o projeto Tenken atender à documentação disponível. Compare requisitos documentados com o código, a estrutura do banco, a configuração de execução e os fluxos implementados. O resultado deve servir para planejar o trabalho restante.

Não implemente mudanças. Não trate uma funcionalidade como concluída só porque há uma tela, rota ou tabela com nome semelhante: verifique o fluxo ponta a ponta e suas regras. Não invente requisitos. Quando faltar evidência ou houver conflito entre fontes, marque como inconclusivo e explique.

## Contexto do projeto

Tenken é uma aplicação web para organizar o uso, inspeção e manutenção de equipamentos em laboratórios educacionais de robótica e automação. A arquitetura documentada usa Next.js no frontend, Express na API e MySQL no banco. Os perfis previstos são aluno, professor, técnico e administrador.

O ciclo operacional central é: agendamento → inspeção pré-uso → utilização → inspeção pós-uso → manutenção, quando necessária. As regras dão destaque a inspeções obrigatórias, rastreabilidade por usuário, bloqueio de equipamento com falha crítica, chamados de manutenção, controle de acesso por perfil e prevenção de conflitos de agenda.

O README informa que a área do aluno ainda usa dados de exemplo enquanto a integração completa com o backend está em andamento. Trate isso como uma pista documentada a confirmar no código atual, não como conclusão automática.

## Fontes prioritárias

Leia e compare, nesta ordem:

1. `docs/tenken_documentacao_projeto_integrador (1).md` — escopo, público, regras RN, requisitos RF/RNF, API planejada, fases e telas por perfil.
2. `README.md` — estado declarado do produto, execução, estrutura e observações de integração.
3. `docs/chamados-professor.md` — fluxo específico de inspeções reprovadas e chamados.
4. `AGENTS.md` — organização do repositório e comandos disponíveis.
5. Implementação vigente: `frontend/src/app/`, `frontend/src/components/`, `frontend/src/lib/`, `backend/src/` e `database/` (schema, migrations e seeds).
6. `referencias/` — materiais de aula e referências adicionais. Use-os como contexto técnico secundário, não como substitutos dos requisitos do projeto.

Há links externos para Trello, Miro e Figma na documentação. Se não estiverem acessíveis, registre essa limitação; não suponha o conteúdo desses quadros. Verifique também se as fases e o escopo inicial ainda são aplicáveis ao estado atual do projeto.

## Como fazer a análise

1. Faça inventário das rotas/telas, endpoints, serviços/modelos e entidades do banco que atendem cada perfil e módulo.
2. Para cada RN, RF e RNF identificado na documentação, procure evidências na implementação. Siga a operação da interface à API e ao banco quando aplicável.
3. Confira validação de autenticação e autorização no backend, validações de entrada, estados de erro, persistência, consistência transacional e comportamento de sucesso. A existência de um controle apenas visual não comprova uma regra de segurança.
4. Compare contratos e nomes documentados com rotas e payloads efetivamente implementados. Registre incompatibilidades e ambiguidades sem presumir qual lado deve mudar.
5. Considere execução e entrega: configuração por ambiente, Docker, schema/seeds, documentação de inicialização, build e lacunas de validação manual/testes já previstos.
6. Não execute ações destrutivas, não altere arquivos e não exponha valores secretos de arquivos `.env`.

## Classificação obrigatória

Use uma das categorias abaixo para cada requisito ou achado:

- **Atendido:** há evidência suficiente de implementação funcional no escopo documentado.
- **Parcial:** existe implementação, mas falta parte do requisito, integração, regra ou cobertura de fluxo.
- **Pendente:** não foi encontrada implementação correspondente.
- **Inconclusivo:** não há evidência suficiente para decidir; diga o que precisa ser inspecionado ou esclarecido.
- **Divergente:** documentação e implementação discordam, ou fontes documentais discordam entre si.
- **Fora de escopo confirmado:** só use quando uma fonte do projeto justificar explicitamente a exclusão. Não infira exclusões.

Separe pendências confirmadas de recomendações técnicas. Recomendações que não são exigidas pelas fontes devem ser identificadas como sugestões, nunca como requisito faltante.

## Formato do resultado

Entregue em português, em Markdown, com estas seções:

1. **Resumo executivo** — estado geral, áreas mais completas e maiores lacunas, com cautela sobre o que não foi possível verificar.
2. **Matriz de requisitos** — uma linha por RN/RF/RNF ou requisito agrupado de forma explícita, com colunas: código/nome, descrição resumida, status, evidência da documentação, evidência no código (caminhos e linhas quando possível), lacuna concreta e próximo passo verificável.
3. **Pendências priorizadas** — ordene por impacto operacional e dependências. Para cada item, descreva o resultado esperado e critérios objetivos de conclusão. Não atribua prazos ou responsáveis sem fonte.
4. **Divergências e decisões necessárias** — liste conflitos entre documentos, contrato API e implementação; inclua referência a cada lado e pergunta/decisão necessária.
5. **Riscos e validações** — fluxos que precisam de validação manual ou técnica, especialmente regras críticas de permissão, segurança, integridade e ciclo operacional. Diferencie risco observado de risco apenas não verificado.
6. **Limitações da análise** — páginas, serviços, ambientes ou fontes que não puderam ser examinados.

Use caminhos relativos do repositório e, se possível, números de linha. Cite trechos documentais pelo título/seção e o código por arquivo. Seja específico: substitua frases vagas como “melhorar o sistema” por uma ação e uma condição de aceite observáveis.

## Fluxos mínimos a rastrear

- Login, sessão/token e redirecionamento por perfil.
- Cadastro e gestão de usuários, turmas e equipamentos.
- Agendamento, validação de disponibilidade/conflitos e cancelamento.
- Token de turma e check-in do aluno com aprovação do professor.
- Inspeções pré e pós-uso, anexos/evidências e falhas críticas/não críticas.
- Criação e acompanhamento de chamados; ordem de serviço e histórico de manutenção.
- Dashboards e relatórios em relação aos dados persistidos.
- Tratamento de erros e bloqueios de autorização tanto na interface quanto na API.

## Observações importantes

- A documentação de projeto é intitulada “Primeira Entrega (Planejamento e Arquitetura)”; diferencie metas planejadas de funcionalidades descritas como já disponíveis no README.
- Não conclua que todo endpoint listado na especificação precisa ter exatamente o mesmo caminho ou método sem comparar contratos atuais e registrar a divergência.
- Não marque RNF como atendido sem evidência mensurável ou inspeção adequada (por exemplo, limite de 2 segundos, disponibilidade de 99%, responsividade móvel e segurança).
- Não considere contas ou senhas de seed apropriadas para produção; não reproduza credenciais no relatório.
- Não faça commit nem edite o projeto. O único entregável solicitado é o diagnóstico descrito acima.
