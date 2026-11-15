# **1\. TENKEN (点検)**

## **Documentação de Projeto Integrador — Primeira Entrega (Planejamento e Arquitetura)**

### _**1.1. Identidade Visual e Conceito da Empresa**_

- **Nome da Empresa / Projeto:** Tenken (点検)
- **Origem e Significado:** No idioma japonês, _Tenken_ significa inspeção, checagem, exame minucioso e verificação preventiva.
- **Justificativa do Conceito:**
  - O cerne da plataforma é a realização de inspeções pré e pós-uso (checklists), controle preventivo de bancadas e robôs, histórico de ocorrências e gestão de manutenções laboratoriais.
  - O Japão é a principal referência mundial no desenvolvimento da robótica industrial e em filosofias consagradas de controle de qualidade e manutenção (como Mitsubishi, Kaizen e 5S). Dessa forma, o nome reflete o rigor técnico, organização e a precisão operacional esperados na gestão do laboratório didático.

    **Equipe de desenvolvedores:** Felipe Stevanato, Guilherme Silva, Samuel Sousa e Miguel Cantarino.

#### _**1.1. História da Empresa**_

A Tenken nasceu da necessidade observada em ambientes educacionais e de pesquisa tecnológica de estruturar a gestão e a manutenção de laboratórios de robótica e automação. Percebendo a ausência de um fluxo padronizado para checagem e controle do estado de conservação das bancadas didáticas, o projeto foi concebido para introduzir práticas consolidadas de inspeção e qualidade no cotidiano acadêmico, assegurando maior disponibilidade e segurança para estudantes e professores.

#### _**1.2. Missão, Visão e Valores**_

- **Missão:** Transformar a gestão de laboratórios didáticos por meio de processos digitais de inspeção, promovendo a conservação do patrimônio técnico e a segurança operacional.
- **Visão:** Ser a plataforma de referência em controle preventivo e rastreabilidade para ambientes educacionais de robótica e engenharia.
- **Valores:**
  - **Rigor e Precisão:** Compromisso com o padrão técnico e detalhamento das inspeções.
  - **Prevenção e Segurança:** Foco na identificação antecipada de falhas para proteção do patrimônio e dos usuários.
  - **Organização e Transparência:** Histórico acessível e clareza nos processos de manutenção.

#### _**1.3. Paleta de Cores do Sistema**_

A identidade visual adota uma estética industrial e tecnológica, combinando fundos escuros de alta legibilidade com acentos de alerta e ação operacional:

- \--onyx: \#0b090aff; (Fundo primário / modo escuro profundo)
- \--carbon-black: \#161a1dff; (Superfícies, painéis e cards do dashboard)
- \--dark-garnet: \#660708ff; (Bordas de destaque, botões secundários)
- \--mahogany-red: \#a4161aff; (Cor primária da marca / ações principais)
- \--mahogany-red-2: \#ba181bff; (Hover de botões, tags de alerta e status de falhas)
- \--silver: \#b1a7a6ff; (Textos secundários, legendas e bordas neutras)
- \--dust-grey: \#d3d3d3ff; (Divisores de seção e linhas de tabelas)
- \--white-smoke: \#f5f3f4ff; (Fundo de inputs / modo claro secundário)
- \--white: \#ffffffff; (Tipografia principal em contraste escuro)

#### _**1.4. Kanban do Projeto**_

Acompanhe o desenvolvimento e a gestão das tarefas do projeto por meio do nosso quadro Kanban no Trello: [**Kanban do Projeto (Trello)**](https://trello.com/invite/b/6ad906a94e771702d28b2eef/ATTI6fef8cc353d90d8f3bf823f6e3f442f7CE867653/tenken)**.**

#### _**1.5. Board do Banco de Dados**_

Acompanhe a modelagem e o diagrama do banco de dados do projeto por meio do nosso board no Miro: [**Board do Banco de Dados (Miro)**](https://miro.com/app/board/uXjVEWQphD4=/?share_link_id=98701656045)**.**

#### _**1.6. Modelagem principal do projeto**_

Acesse os protótipos de alta fidelidade e o design system do projeto no Figma: [**Modelação do site**](https://www.figma.com/make/bJERDgxPINDnzKwRT5uikP/Tenken-Laboratory-Dashboard?t=kyc6XmAxyS3TEYHN-1).

### _**2\. Divisão de Funções da Equipe**_

A equipe é composta por 4 integrantes, com papéis distribuídos para garantir agilidade e cobertura integral das camadas do projeto:

- **Felipe Stevanato — Modelagem, Banco de Dados e Suporte Ágil**
  - **Atribuições:** Arquitetura do banco de dados.
  - **Papel colaborativo:** Suporte geral entre todas as áreas do projeto, atuando na resolução ágil de problemas que encontraremos no futuro.
- **Guilherme Silva — Full-Stack, Arquitetura de Interface e Integração**
  - **Atribuições:** Concepção e estruturação das páginas (Wireframes e layout responsivo), visão integrada de ponta a ponta do sistema e apoio na definição de contratos de integração.
  - **Papel colaborativo:** Suporte a todos os integrantes, garantindo coerência visual e comunicação entre interface e regras de negócio.
- **Samuel Sousa — Documentação Inicial, Organização e Auxílio Front-end**
  - **Atribuições:** Estruturação da documentação técnica e funcional oficial, levantamento de requisitos, detalhamento do escopo e organização de ideias.
  - **Papel colaborativo:** Auxílio na construção dos layouts das telas no Front-end.
- **Miguel Cantarino — Back-end Geral e Validação de Fluxos**
  - **Atribuições:** Desenvolvimento e estruturação da API e da lógica de negócio central do sistema (autenticação, rotas CRUD, permissões e regras).
  - **Papel colaborativo:** Trabalho direto com Guilherme Silva para assegurar que a API atenda às necessidades das páginas e que as regras de negócio funcionem perfeitamente.

### _**3\. Problema, Público-Alvo, Objetivos e Proposta de Valor**_

- **Problema:** A falta de controle centralizado no uso de bancadas didáticas e robôs gere perda de componentes, ausência de histórico sobre quem utilizou o equipamento, falta de inspeções preventivas e atraso na notificação de falhas técnicas.
- **Público-Alvo:**
  - Alunos de cursos técnicos e engenharias;
  - Professores e orientadores de laboratório;
  - Técnicos de laboratório e administradores responsáveis por manutenção e patrimônio.
- **Objetivo Geral:** Desenvolver um sistema web integrado para gerenciar o ciclo de vida, agendamentos, inspeções pré e pós-uso e manutenção de bancadas didáticas, robôs e componentes em laboratórios educacionais.
- **Proposta de Valor:** Proporcionar rastreabilidade completa e conservação do patrimônio técnico por meio de checklists digitais padronizados, dashboards em tempo real e agendamentos inteligentes, reduzindo quebras inesperadas e aumentando a segurança operacional.

### _**4\. Escopo Funcional Preliminar (Módulos do Sistema)**_

1. **Gestão de Cadastros (CRUDs):** Robôs, bancadas, componentes/ferramentas, usuários e projetos laboratoriais.
2. **Agendamento e Controle de Utilização:** Reserva prévia de equipamentos por data, horário e turma com validação de disponibilidade.
3. **Módulo de Checklist (Inspeção Tenken):** Verificação obrigatória antes da liberação e após a conclusão do uso da bancada.
4. **Histórico e Registro de Falhas:** Abertura de chamados de manutenção, registro de testes, programas e falhas por equipamento.
5. **Dashboard e Relatórios:** Indicadores de disponibilidade, ocorrências e relatórios detalhados de utilização.
6. **Espaço Criativo / Recurso Avançado:** Mecanismo facilitador de aprendizagem/manutenção (ex.: liberação rápida via Token de Acesso por Turma ou monitoramento em tempo real do status das bancadas).

### _**Regras de Negócio (RN) — Ordenadas por Necessidade/Criticidade**_

| Código   | Categoria                                             | Descrição                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| :------- | :---------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RN01** | **Segurança Operacional e Gestão de Severidade**      | **Item Crítico (Impeditivo):** Falhas em itens críticos bloqueiam o equipamento e geram chamado de manutenção urgente. **Item Não Crítico (Alerta):** Falhas não impeditivas mantêm o uso liberado e abrem chamado preventivo automático. **Item Não Crítico (Alerta):** Se falhar um item não impeditivo (ex.: avarias estéticas ou falhas secundárias), a bancada permanece liberada para uso, mas o sistema gera automaticamente um chamado de manutenção preventiva. |
| **RN02** | **Inspeção e Qualidade**                              | **Vistoria Obrigatória Pré e Pós-Uso:** Exige inspeção completa antes da liberação e após a devolução do equipamento.                                                                                                                                                                                                                                                                                                                                                    |
| **RN03** | **Proteção Patrimonial**                              | **Responsabilidade Patrimonial e Rastreabilidade:** Associa avarias ou perdas de componentes ao usuário responsável pela reserva.                                                                                                                                                                                                                                                                                                                                        |
| **RN04** | **Controle de Acesso e Liberação via Token de Turma** | Check-in via Token de Acesso Único pelo aluno; vistoria e liberação restritas ao professor.                                                                                                                                                                                                                                                                                                                                                                              |
| **RN05** | **Agendamentos**                                      | **Proteção contra Conflito e Uso de Ativos Danificados:** Impede reservas simultâneas ou de equipamentos inativos/em manutenção.                                                                                                                                                                                                                                                                                                                                         |
| **RN06** | **Governança e Acesso**                               | **Restrição de Alçada Técnica sobre Ativos:** Alteração de status e gestão do Tenken restritas a técnicos e administradores.                                                                                                                                                                                                                                                                                                                                             |

### _**Requisitos Funcionais (RF) — Ordenados por Necessidade/Criticidade**_

| Código   | Categoria                           | Descrição                                                                                                                       |
| :------- | :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| **RF01** | **Gestão de Inventário**            | Cadastro de ativos com patrimônio, localização e ID exclusivo no sistema.                                                       |
| **RF02** | **Gestão de Inventário**            | **Composição Física e Controle de Peças:** Mapeia e controla as quantidades de peças acopladas a cada equipamento.              |
| **RF03** | **Inspeção e Qualidade**            | Permite ao aluno validar a presença via Token e ao professor carregar o checklist para liberação.                               |
| **RF04** | **Registro de Vistoria**            | **Registro de Vistoria com Evidências Fotográficas:** Anexa fotos das avarias ao checklist no momento da inspeção.              |
| **RF05** | **Manutenção e Suporte**            | **Geração Automática de Chamado de Manutenção:** Abre ordem de reparo imediatamente após reprovação no Tenken.                  |
| **RF06** | **Agendamentos e Geração do Token** | **Validação de Disponibilidade do Ativo:** Valida horários vagos e gera Token de Acesso único ao confirmar o agendamento.       |
| **RF07** | **Manutenção e Suporte**            | **Abertura Manual de Chamados do Ativo:** Permite relatar falhas identificadas fora do processo de checklist.                   |
| **RF08** | **Manutenção e Suporte**            | **Gestão de Reparos e Ciclo de Vida do Ativo:** Registra ações corretivas, peças trocadas e custos no histórico do equipamento. |
| **RF09** | **Agendamentos**                    | **Calendário de Agendamento do Ativo:** Exibe visualmente os horários vagos e ocupados por equipamento.                         |
| **RF10** | **Controle de Acesso**              | **Controle de Acesso ao Sistema de Ativos:** Gerencia usuários e perfis de permissão (Aluno, Professor, Técnico, Admin).        |
| **RF11** | **Gestão Acadêmica**                | **Vínculo Acadêmico aos Ativos:** Associa turmas, projetos, alunos e professores às reservas de equipamentos.                   |
| **RF12** | **Agendamentos**                    | **Cancelamento de Reservas do Ativo:** Permite o cancelamento e a liberação imediata de horários agendados.                     |
| **RF13** | **Monitoramento e Analytics**       | **Monitoramento em Tempo Real dos Ativos:** Exibe dashboard do status atual dos equipamentos (Disponível, Em Uso, Manutenção).  |
| **RF14** | **Monitoramento e Analytics**       | **Relatórios de Desempenho e Utilização do Ativo:** Gera indicadores de taxa de ocupação, ranking de falhas e MTTR.             |

| RF15     | Gestão Acadêmica / Testes | Apontamento de Testes e Resultados: Registra relatórios e resultados das práticas realizadas no equipamento.       |
| :------- | :------------------------ | :----------------------------------------------------------------------------------------------------------------- |
| **RF16** | **Manutenção e Suporte**  | **Sistema de Notificações e Alertas:** Notifica automaticamente professores e técnicos ao abrir chamados urgentes. |

###

### _**Requisitos Não Funcionais (RNF) — Ordenados por Necessidade/Criticidade**_

| Código    | Categoria                | Descrição                                                                                                                                 |
| :-------- | :----------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **RNF01** | **Desempenho**           | **Desempenho no Acesso ao Ativo:** Validação de Token e carregamento de vistorias/check-in em no máximo 2 segundos.                       |
| **RNF02** | **Disponibilidade**      | **Disponibilidade do Sistema de Gestão dos Ativos:** Garante 99% de disponibilidade durante o funcionamento do laboratório.               |
| **RNF03** | **Segurança**            | **Segurança no Acesso aos Ativos:** Armazenamento de senhas criptografadas via bcrypt.                                                    |
| **RNF04** | **Usabilidade**          | **Interface Móvel para Inspeção do Ativo:** Layout responsivo otimizado para dispositivos móveis.                                         |
| **RNF05** | **Armazenamento**        | **Armazenamento de Evidências Fotográficas:** Salva arquivos de imagem no servidor local (Multer) e apenas os caminhos no banco de dados. |
| **RNF06** | **Segurança**            | **Autenticação Segura de Requisições:** Uso de tokens JWT para autenticar e validar chamadas de API.                                      |
| **RNF07** | **Arquitetura de Dados** | **Integridade de Dados dos Ativos:** Uso de SGBD relacional para assegurar a consistência dos dados.                                      |

### _**5\. Definição da API**_

A comunicação entre o cliente (web/mobile) e o servidor Back-end do sistema Tenken é realizada via API padronizada, utilizando formato JSON para envio e recebimento de dados.

####

####

#### _**5.1. Recursos e Endpoints Principais**_

| Recurso           | Método     | Rota / Endpoint                  | Descrição da Operação                                                                                           | Códigos de Status Esperados                                                                       |
| :---------------- | :--------- | :------------------------------- | :-------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| Equipamentos      | **GET**    | /api/equipamentos                | Lista todos os robôs e bancadas cadastrados.                                                                    | 200 OK, 401 Unauthorized                                                                          |
| Equipamentos      | **POST**   | /api/equipamentos                | Cadastra um novo equipamento no inventário.                                                                     | 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden                                     |
| Equipamentos      | **PUT**    | /api/equipamentos/{id}           | Atualiza integralmente os dados do equipamento.                                                                 | 200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found                           |
| Equipamentos      | **PATCH**  | /api/equipamentos/{id}/status    | Atualiza parcialmente o status (Disponível, Em Uso, Manutenção).                                                | 200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity |
| Equipamentos      | **DELETE** | /api/equipamentos/{id}           | Remove ou inativa um equipamento do patrimônio.                                                                 | 204 No Content, 401 Unauthorized, 403 Forbidden, 404 Not Found                                    |
| Agendamentos      | **GET**    | /api/agendamentos                | Lista as reservas e horários ocupados.                                                                          | 200 OK, 401 Unauthorized                                                                          |
| Agendamentos      | **POST**   | /api/agendamentos                | Cria uma nova reserva e gera o Token de Turma.                                                                  | 201 Created, 400 Bad Request, 401 Unauthorized, 409 Conflict, 422 Unprocessable Entity            |
| Alunos            | **POST**   | /api/alunos/solicitar-acesso     | Valida o Token de Turma e registra o check-in do aluno, aguardando aprovação do professor. (Acesso: ALUNO) | 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable Entity |
| Inspeções         | **POST**   | /api/inspecoes                   | Registra uma nova vistoria (Tenken) pré ou pós-uso.                                                             | 201 Created, 400 Bad Request, 401 Unauthorized, 422 Unprocessable Entity                          |
| Inspeções         | **GET**    | /api/inspecoes/{id}/respostas    | Obtém as respostas do checklist de uma inspeção específica.                                                     | 200 OK, 401 Unauthorized, 404 Not Found                                                           |
| Chamados          | **POST**   | /api/chamados                    | Abre um novo chamado manual de falha/avaria.                                                                    | 201 Created, 400 Bad Request, 401 Unauthorized                                                    |
| Chamados          | **GET**    | /api/chamados                    | Lista os chamados de manutenção.                                                                                | 200 OK, 401 Unauthorized                                                                          |
| Chamados          | **PATCH**  | /api/chamados/{id}/status        | Atualiza o status do chamado.                                                                                   | 200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found                           |
| Ordens de Serviço | **POST**   | /api/chamados/{id}/ordem-servico | Emite a ordem de serviço a partir de um chamado.                                                                | 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found                      |
| Ordens de Serviço | **PATCH**  | /api/ordens-servico/{id}         | Atualiza status da ordem de serviço (Concluída, Em Andamento).                                                  | 200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found                           |
| Usuários          | **POST**   | /api/usuarios/login              | Autentica usuário e retorna token JWT.                                                                          | 200 OK, 400 Bad Request, 401 Unauthorized                                                         |
| Usuários          | **GET**    | /api/usuarios                    | Lista usuários do sistema (Alunos, Professores, Admins).                                                        | 200 OK, 401 Unauthorized, 403 Forbidden                                                           |
| Check-ins         | **GET**    | /api/checkins/atual              | Retorna o check-in atual do aluno autenticado e os equipamentos da aula. (Acesso: ALUNO)                       | 200 OK, 401 Unauthorized, 404 Not Found                                                           |
| Check-ins         | **GET**    | /api/checkins/pendentes          | Lista check-ins aguardando aprovação nas turmas do professor. (Acesso: PROFESSOR)                              | 200 OK, 401 Unauthorized, 403 Forbidden                                                           |
| Check-ins         | **PATCH**  | /api/checkins/:id/aprovar        | Aprova o check-in de um aluno. (Acesso: PROFESSOR)                                                               | 200 OK, 401 Unauthorized, 403 Forbidden, 404 Not Found                                           |

A lista completa de rotas (turmas, inspeções, pré-cadastro de staff e dashboards de admin/técnico) está em `backend/src/App.js`. O fluxo de chamados aberto a partir de inspeções está detalhado em `docs/chamados-professor.md`.

#### _**5.2. Códigos de Status HTTP**_

- **200 OK:** Requisição processada com sucesso (consultas GET e atualizações PUT/PATCH com retorno).
- **201 Created:** Recurso criado com sucesso (cadastros efetuados via POST).
- **204 No Content:** Requisição processada com sucesso, sem conteúdo de retorno (ex.: remoção de um equipamento via DELETE).
- **400 Bad Request:** Dados obrigatórios ausentes ou em formato inválido (ex.: campo `nome` não informado).
- **401 Unauthorized:** Falha na autenticação, como credenciais incorretas no login ou token JWT ausente, inválido ou expirado.
- **403 Forbidden:** Usuário autenticado, mas sem permissão para a operação (ex.: perfil sem alçada técnica tentando alterar o status de um equipamento).
- **404 Not Found:** Recurso não localizado (ex.: equipamento, usuário ou Token de Turma inexistente).
- **409 Conflict:** Conflito com o estado atual do recurso (ex.: tentativa de agendar um ativo em horário já reservado).
- **422 Unprocessable Entity:** Dados válidos que violam uma regra de negócio (ex.: reserva de equipamento em manutenção ou uso de Token expirado).
- **500 Internal Server Error:** Erro não tratado ou falha inesperada no servidor.

###

### _**6\. Cronograma de Desenvolvimento do Projeto Tenken**_

#### _**6.1. Fase 1: Planejamento, Arquitetura e Modelagem de Dados**_

| Atividades / Tarefas                                                   | Responsáveis     | Entregável                                         |
| :--------------------------------------------------------------------- | :--------------- | :------------------------------------------------- |
| Definição do Escopo, Identidade Visual e Regras de Negócio (RN/RF/RNF) | Samuel Sousa     | Documentação Inicial e Especificação de Requisitos |
| Modelagem do Banco de Dados Relacional (MySQL)                         | Felipe Stevanato | Diagrama e Script Inicial                          |
| Prototipagem de Wireframes, Layout Responsivo e Design System          | Guilherme Silva  | Protótipos Interativos e Guia de Estilo Visual     |
| Especificação da Arquitetura da API REST e Contratos de Dados (JSON)   | Miguel Cantarino | Documentação de Endpoints                          |

####

#### _**6.2. Fase 2: Desenvolvimento do Back-end e Infraestrutura da API**_

| Atividades / Tarefas                                                  | Responsáveis                        | Entregável                                             |
| :-------------------------------------------------------------------- | :---------------------------------- | :----------------------------------------------------- |
| Configuração de Servidor, Estrutura de Rotas Express e Middleware JWT | Miguel Cantarino                    | API Base Funcional com Autenticação e Segurança        |
| Implementação dos CRUDs de Equipamentos, Componentes e Usuários       | Miguel Cantarino e Felipe Stevanato | Endpoints de Gestão de Inventário e Usuários           |
| Módulo de Agendamento, Geração e Validação de Token de Turma          | Miguel Cantarino                    | Regra de Negócio de Reservas e Validação de Tokens     |
| Lógica do Checklist (Tenken), Multer e Chamados de Manutenção         | Miguel Cantarino e Felipe Stevanato | Endpoints de Vistoria, Upload de Evidências e Chamados |

####

#### _**6.3. Fase 3: Desenvolvimento do Front-end e Integração de Telas**_

| Atividades / Tarefas                                                    | Responsáveis                       | Entregável                                          |
| :---------------------------------------------------------------------- | :--------------------------------- | :-------------------------------------------------- |
| Construção de Páginas de Login, Cadastro e Painel de Gestão (Dashboard) | Guilherme Silva e Samuel Sousa     | Interface do Dashboard e Autenticação Visual        |
| Desenvolvimento da Interface Mobile-First de Inspeção (Tenken)          | Guilherme Silva e Samuel Sousa     | Tela Responsiva de Checklist com Validação de Token |
| Integração do Front-end com a APIl e Tratamento de Erros                | Guilherme Silva e Miguel Cantarino | Sistema Conectado Ponta a Ponta                     |
| Implementação de Feedback de Erros e Mensagens HTTP na Interface        | Guilherme Silva e Samuel Sousa     | Interface com Validação e Feedback ao Usuário       |

####

####

####

####

#### _**6.4. Fase 4: Testes, Validação, Ajustes e Entrega Final**_

| Atividades / Tarefas                                                        | Responsáveis                        | Entregável                                             |
| :-------------------------------------------------------------------------- | :---------------------------------- | :----------------------------------------------------- |
| Testes Integrados de Fluxo Operacional (Agendamento \- Vistoria \- Chamado) | Toda a Equipe                       | Relatório de Testes e Homologação dos Fluxos           |
| Testes de Segurança, Validação de Permissões e Resposta de Erros da API     | Miguel Cantarino e Felipe Stevanato | Aplicação Homologada contra Falhas e Acessos Indevidos |
| Revisão Geral e Consolidação Final da Documentação Técnica do Projeto       | Samuel Sousa                        | Revisão Completa da Documentação do Projeto            |
| Apresentação do Projeto e Implantação Final                                 | Toda a Equipe                       | Projeto Integrador Finalizado e Entregue               |

###

### _**7\. WireFrame & UI**_

### _**7.1. Mapeamento de Requisitos e Estrutura de Telas por Perfil**_

- **1\. Telas Públicas (Acesso Geral)**
  - Home Page
  - Autenticação (Login)
  - Cadastro de Usuários
- **2\. Perfil: Administrador**
  - Dashboard Administrativo
  - Gestão e Controle de Acesso
  - Gestão de Equipamentos (CRUD)
  - Visualização de Relatórios de Uso
  - Gestão de Chamados e Emissão de Ordem de Serviço (OS)
- **3\. Perfil: Professor**
  - Módulo de Agendamento Dinâmico
  - Gestão de Turmas e Alunos
  - Módulo de Checklist (Pré e Pós-Uso)
  - Envio de Relatório de Uso
- **4\. Perfil: Aluno**
  - Acesso à Turma
  - Relatório do Aluno Representante
- **5\. Perfil: Técnico**
  - Dashboard Operacional por Categoria
  - Gestão e Atendimento de Chamados
