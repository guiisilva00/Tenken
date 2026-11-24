# Tenken — documentação oficial do projeto

## 1. Apresentação

Tenken (点検) é uma aplicação web para gestão de equipamentos e rotinas de laboratórios educacionais de robótica e automação. O projeto centraliza cadastros, agendamentos, inspeções, check-ins e manutenção, com histórico associado aos usuários e equipamentos.

O sistema foi pensado para reduzir controles manuais dispersos, facilitar a identificação de avarias e apoiar o uso seguro e organizado do patrimônio técnico.

## 2. Público e perfis

| Perfil | Responsabilidades no sistema |
| --- | --- |
| Administrador | Gerencia usuários, equipamentos, turmas, chamados e visualiza painéis e relatórios. |
| Professor | Gerencia turmas, agenda equipamentos, aprova solicitações de acesso, executa inspeções e acompanha chamados da turma. |
| Aluno | Solicita acesso com token, consulta o estado do check-in e visualiza o contexto e os equipamentos da aula autorizada. |
| Técnico | Acompanha chamados e ordens de serviço, registra manutenção e atualiza o atendimento. |

## 3. Fluxo operacional

1. O professor agenda um ou mais equipamentos para uma turma.
2. O aluno solicita acesso usando o token associado ao fluxo de reserva.
3. O professor analisa e aprova o check-in.
4. O professor registra a inspeção aplicável ao início ou ao fim do uso, com checklist e observações.
5. Se houver falha, o sistema pode abrir um chamado vinculado à inspeção e alterar a disponibilidade do equipamento conforme a severidade e as regras implementadas.
6. A equipe técnica acompanha o chamado, emite ou atualiza uma ordem de serviço e registra o histórico de manutenção.

As validações são feitas também na API: autorização por perfil, associação do professor à turma, vínculo do aluno, validade da reserva e disponibilidade do equipamento. A interface não é a única camada de controle.

## 4. Funcionalidades entregues

### Acesso e usuários

- Login por matrícula e senha, sessão baseada em JWT e proteção de rotas por perfil.
- Cadastro de aluno, geração de matrícula, solicitação de acesso e fluxo de redefinição de senha por e-mail quando SMTP está configurado.
- Administração de usuários e pré-cadastro/ativação de membros da equipe.

### Equipamentos e turmas

- Cadastro, consulta, edição, alteração de status e remoção de equipamentos, com filtros e paginação.
- Administração de turmas e vínculo entre alunos e projetos/turmas.
- Validação de conflito de horário e bloqueio de agendamento para equipamento inativo ou em manutenção.

### Agenda, check-in e área do aluno

- Agendamento de equipamentos pelo professor e geração/validação de token associado à reserva.
- Solicitação de acesso pelo aluno e aprovação pelo professor responsável.
- Consulta de acesso atual, turma, professor, atividade, horário e equipamentos autorizados.
- Páginas do aluno para equipamentos e diagnóstico contextual da reserva.

### Inspeções e manutenção

- Inspeções registradas com checklist configurável, respostas, observações e suporte a anexos.
- Abertura de chamado a partir de inspeção reprovada, com vínculo à inspeção e ao equipamento.
- Gestão de chamados e ordens de serviço por administrador e técnico, além de histórico de manutenção.
- Interfaces de inspeção com regras responsivas para telas menores.

### Painéis e relatórios

- Dashboard administrativo com indicadores de equipamentos e chamados.
- Relatórios administrativos de uso e estado do inventário.
- Dashboard operacional do técnico.
- Interfaces distintas para administração, professor, aluno e técnico.

## 5. Regras de negócio relevantes

- Reservas simultâneas conflitantes não são aceitas.
- Equipamentos inativos ou em manutenção não podem ser reservados.
- O acesso do aluno depende de solicitação válida, vínculo com a turma e aprovação do professor responsável.
- A aprovação é revalidada no servidor e na operação de persistência para evitar aprovações expiradas ou fora do escopo do professor.
- Inspeções e chamados registram responsáveis e referências ao equipamento; chamados originados por inspeção mantêm a referência à vistoria.
- Chamados ativos podem manter o equipamento em manutenção até a resolução conforme as regras do serviço.
- Respostas e estados HTTP distinguem dados inválidos, falta de autenticação, falta de permissão, recurso ausente e conflito de regra de negócio.

Detalhes do acesso do aluno estão em [fluxo-acesso-aluno.md](fluxo-acesso-aluno.md); detalhes de inspeções reprovadas e chamados estão em [chamados-professor.md](chamados-professor.md).

## 6. Arquitetura e tecnologias

```text
Navegador
  └── Next.js 16 / React — frontend/src/app e frontend/src/components
        └── API REST Express 5 — backend/src
              └── MySQL — schema em database/init/02-schema.sql
```

- **Front-end:** Next.js App Router, React, JavaScript e CSS Modules.
- **Back-end:** Node.js, Express, ES modules e API REST.
- **Banco:** MySQL acessado com `mysql2`.
- **Segurança e integração:** JWT, bcrypt, Helmet, CORS configurável, middleware de autorização, limitação de requisições em fluxos sensíveis e upload via Multer.
- **Execução local:** serviços descritos em `docker-compose.yml`; os pacotes também podem ser executados separadamente.

O backend organiza os recursos em rotas, controladores, serviços e modelos. O front-end agrupa páginas pela rota e perfil de acesso. O schema de `database/init/02-schema.sql` é a referência para uma instalação nova; scripts em `database/seed/` fornecem dados locais/demonstração.

## 7. Recursos da API

Prefixos registrados em `backend/src/App.js`:

| Prefixo | Recursos |
| --- | --- |
| `/api/health` | Verificação de disponibilidade da API. |
| `/api/usuarios` | Login, sessão, recuperação de senha e administração de usuários. |
| `/api/alunos` | Cadastro, geração de matrícula, solicitação de acesso e área do aluno. |
| `/api/turmas` | Consulta e administração de turmas. |
| `/api/equipamentos` | Consulta e CRUD de equipamentos e status. |
| `/api/agendamentos` | Consulta e criação/atualização de reservas. |
| `/api/checkins` | Check-in atual, solicitações pendentes e aprovação. |
| `/api/inspecoes` | Registro, consulta e fluxo de inspeções/chamados relacionados. |
| `/api/chamados` | Gestão de chamados de manutenção. |
| `/api/ordens-servico` | Atendimento de ordens de serviço. |
| `/api/pre-cadastros` | Pré-cadastro e ativação de equipe. |
| `/api/admin/dashboard`, `/api/admin/relatorios` | Indicadores e relatórios administrativos. |
| `/api/tecnico/dashboard` | Indicadores do painel técnico. |

Os métodos, parâmetros, validações e permissões estão definidos nos arquivos correspondentes em `backend/src/routes/` e `backend/src/controllers/`.

## 8. Banco de dados e instalação

O schema completo para novas instalações está em `database/init/02-schema.sql`. Para ambiente local, configure o banco, aplique esse arquivo e use os seeds somente se precisar de dados de demonstração. Migrations são incrementais, destinadas a bancos já existentes; revise cada arquivo e faça backup antes de executá-las sobre dados que deseja manter.

Passo a passo de instalação, variáveis de ambiente e comandos de execução estão no [README principal](../README.md). Não use credenciais de exemplo nem segredos de desenvolvimento em produção. Configure `JWT_SECRET`, credenciais do banco, origem permitida do front-end e SMTP com valores próprios.

## 9. Limites conhecidos e escopo

- Não existe CRUD independente de componentes no schema/API atual; o inventário gerenciado é o de equipamentos. O conceito de componentes aparece nos objetivos do projeto, mas não deve ser entendido como módulo de cadastro entregue.
- O conteúdo do diagnóstico do aluno reflete os dados existentes de reserva e equipamento. Instruções específicas de segurança, plano de aula e EPIs exigem uma fonte de dados própria ainda não modelada no fluxo.
- Não há scripts gerais de testes automatizados (`npm test`) configurados nos pacotes. A validação de release deve incluir build do front-end, conferência de configuração, inicialização dos serviços e verificação manual dos fluxos por perfil.
- A publicação em produção exige configuração de infraestrutura, HTTPS, credenciais próprias, política de backup e revisão de acesso aos arquivos enviados.

## 10. Documentos e referências

- [README: instalação, configuração e comandos](../README.md)
- [Fluxo de acesso do aluno](fluxo-acesso-aluno.md)
- [Chamados abertos pelo professor](chamados-professor.md)
- [Quadro Kanban Tenken](https://trello.com/b/ALSjCOok/tenken)
- Equipe: Felipe Stevanato, Guilherme Silva, Samuel Sousa e Miguel Cantarino.
