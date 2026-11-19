<div align="center">
  <img src="frontend/public/assets/img/logo-site/logo_horizontal.svg" alt="Tenken" width="360" />

  <p><strong>Organização, inspeção e cuidado com equipamentos de laboratórios educacionais.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/JavaScript-ES6%2B-f7df1e?logo=javascript&logoColor=111111" alt="JavaScript" />
    <img src="https://img.shields.io/badge/React-UI-61dafb?logo=react&logoColor=111111" alt="React" />
    <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/Express-API-000000?logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MySQL-banco%20de%20dados-4479a1?logo=mysql&logoColor=white" alt="MySQL" />
  </p>
</div>

## Sobre o Tenken

Tenken (点検) é uma aplicação web para organizar o uso, a inspeção e a manutenção de equipamentos de laboratórios educacionais de robótica e automação. O sistema reúne inventário, turmas, agendamentos, check-ins, inspeções, chamados de manutenção, ordens de serviço e relatórios.

O fluxo operacional conecta **agendamento → inspeção pré-uso → utilização → inspeção pós-uso → manutenção, quando necessária**. As operações persistem em MySQL e são atendidas por uma API REST autenticada. A interface web é feita com Next.js e React.

## Funcionalidades disponíveis

### Acesso público e contas

- Página institucional, login por matrícula e senha e redirecionamento conforme o perfil da conta.
- Cadastro de alunos com geração de matrícula a partir de pré-matrícula.
- Fluxo de solicitação e redefinição de senha por e-mail, configurado via SMTP.
- Sessão autenticada com JWT; as senhas são armazenadas com bcrypt.
- Pré-cadastro e ativação de contas de professores e técnicos pela administração.

### Administrador

- Painel com totais e estados de equipamentos e chamados.
- Cadastro, edição, consulta e inativação de equipamentos; alteração de estado também pode ser feita por técnico.
- Gestão de usuários, perfis, ativação de contas e turmas.
- Consulta e gestão de chamados, atribuição de técnico e emissão/atualização de ordens de serviço.
- Relatórios por período e tipo de equipamento, incluindo ranking de uso, taxa de ocupação, ranking de falhas e tempo médio de reparo (MTTR).

### Professor

- Consulta de turmas e equipamentos disponíveis.
- Criação de agendamentos vinculados a turma e equipamento, com token de acesso, validação de conflito/estado do ativo e cancelamento de reservas confirmadas.
- Aprovação de check-ins solicitados pelos alunos.
- Inspeções pré e pós-uso com checklist correspondente ao tipo de equipamento, respostas por item e envio opcional de fotos de evidência.
- Consulta de inspeções realizadas e respostas, além de abertura e acompanhamento de chamados relacionados às turmas do professor.

### Aluno

- Solicitação de acesso à aula usando o token compartilhado pelo professor.
- Acompanhamento do check-in e dos agendamentos do dia na página Diagnóstico; o estado do check-in é consultado novamente a cada 15 segundos enquanto a página está aberta.
- Consulta dos equipamentos associados à turma após aprovação do check-in.
- A interface diferencia espera, aprovação, aula futura, aula encerrada, erro de carregamento e dia sem agendamento. A API atual não oferece um estado específico de acesso negado nem uma operação de revogação do check-in.

### Técnico

- Painel com chamados por estado e severidade, evolução diária e equipamentos em manutenção.
- Consulta e atendimento de chamados atribuídos, registro de histórico de manutenção, peças trocadas e custos.
- Consulta e conclusão de ordens de serviço.

### Regras operacionais implementadas

- O backend impede conflito de horário no mesmo equipamento e impede novos agendamentos de equipamentos inativos ou em manutenção.
- O checklist pré-uso só pode ser registrado em agendamento confirmado; o pós-uso, em agendamento em andamento. A conclusão de cada etapa atualiza o estado do agendamento e do equipamento.
- Uma falha crítica reprova a inspeção, bloqueia o equipamento para manutenção e cria chamado corretivo e ordem de serviço na mesma transação. Falhas não críticas permitem aprovação com ressalvas e geram chamado preventivo.
- As rotas da API verificam autenticação e perfil autorizado para cada operação.

## Perfis e páginas

| Perfil | Rotas principais |
| --- | --- |
| Público | `/`, `/login`, `/cadastro`, `/esqueci-senha`, `/redefinir-senha` |
| Administrador | `/admin`, `/admin/equipamentos`, `/admin/usuarios`, `/admin/turmas`, `/admin/relatorios` |
| Professor | `/professor`, `/professor/agendamentos`, `/professor/turmas`, `/professor/equipamentos`, `/professor/inspecoes`, `/professor/aprovacoes`, `/professor/chamados` |
| Aluno | `/aluno`, `/aluno/diagnostico`, `/aluno/equipamentos` |
| Técnico | `/tecnico`, `/tecnico/chamados` |

## Tecnologias e estrutura

- **Frontend:** Next.js App Router, React e CSS Modules.
- **API:** Node.js 24 e Express 5, com controllers, services, models, rotas e middlewares.
- **Banco de dados:** MySQL 8.4, com chaves estrangeiras, restrições e transações para operações do fluxo de inspeção.
- **Arquivos:** evidências de inspeção são recebidas por Multer e servidas pelo caminho `/uploads`.
- **Infraestrutura local:** Docker Compose com serviços de frontend, backend e banco. O schema inicial é executado pelo container MySQL quando o volume de dados é criado pela primeira vez.

```text
backend/src/                 API, regras de negócio e acesso ao banco
frontend/src/app/            Rotas e páginas da aplicação
frontend/src/components/     Componentes compartilhados
frontend/src/lib/            Cliente da API e sessão
database/init/               Schema inicial e checklists
database/seed/               Contas e dados de desenvolvimento
docs/                        Documentação funcional e técnica
```

O modelo de dados inclui usuários, turmas e vínculos com alunos, equipamentos, agendamentos, check-ins, modelos/itens de checklist, inspeções e respostas, chamados, ordens de serviço, histórico de manutenção, pré-matrículas e tokens de redefinição de senha.

## Executar com Docker

Na raiz do repositório, crie o arquivo `.env` a partir do exemplo e ajuste os valores conforme seu ambiente.

PowerShell:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Linux/macOS:

```bash
cp .env.example .env
docker compose up --build
```

Com as portas padrão, a aplicação fica em `http://localhost:3000`, a API em `http://localhost:8080` e o endpoint de saúde em `http://localhost:8080/api/health`. O `docker-compose.override.yml` publica as portas para desenvolvimento local. Para ambientes com proxy, as portas também podem ser configuradas pelas variáveis descritas em `.env.example`.

Os valores de `.env.example` são somente conveniências de desenvolvimento. Defina senhas fortes, um `JWT_SECRET` próprio e os dados SMTP do ambiente antes de qualquer implantação. Mantenha o `.env` fora do controle de versão.

## Executar sem Docker

Use Node.js 24 e uma instância MySQL 8.4 acessível. Crie o banco com o schema inicial:

```bash
mysql -u root -p < database/init/02-schema.sql
```

Opcionalmente, carregue dados de desenvolvimento na ordem indicada nos comentários dos arquivos de seed. `usuarios_teste.sql` cria contas de teste; `20261108_1020_seed_completa_laboratorio.sql` fornece dados relacionais de laboratório; `equipamentos_patrocinadores.sql` acrescenta equipamentos de exemplo; `tenken_seed.sql` depende do schema e do seed completo de laboratório. Use esses dados apenas em ambientes locais.

Configure `backend/.env` com `PORT`, `FRONTEND_URL`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET` e `JWT_EXPIRES_IN`. Para redefinição de senha por e-mail, configure também `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` e, se necessário, `SMTP_FROM`.

Inicie a API:

```bash
cd backend
npm install
npm run dev
```

Configure `frontend/.env` com `NEXT_PUBLIC_API_URL` apontando para a API (por exemplo, `http://localhost:8080/api`) e inicie a interface:

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Comandos

| Diretório | Comando | Ação |
| --- | --- | --- |
| `frontend/` | `npm run dev` | Servidor de desenvolvimento Next.js. |
| `frontend/` | `npm run build` | Build de produção. |
| `frontend/` | `npm run start` | Servidor de produção após o build. |
| `backend/` | `npm run dev` | API com reinício automático via Node watch. |
| `backend/` | `npm start` | API em modo de produção. |
| raiz | `docker compose up --build` | Inicializa e constrói banco, API e frontend. |

O repositório não configura um script de testes automatizados. Valide fluxos funcionais em ambiente local e execute `npm run build` no frontend após mudanças de interface.

## Documentação

- [Documentação do Projeto Integrador](docs/tenken_documentacao_projeto_integrador%20%281%29.md): visão do projeto, regras e requisitos, funcionalidades implementadas, endpoints e pendências conhecidas.
- [Fluxo de chamados do professor](docs/chamados-professor.md): relação entre inspeções reprovadas e chamados corretivos/preventivos.

## Equipe

- **Felipe Stevanato:** banco de dados, modelagem e suporte.
- **Guilherme Silva:** interface, arquitetura visual e integração.
- **Samuel Sousa:** documentação, requisitos e apoio ao frontend.
- **Miguel Cantarino:** backend, API e validação dos fluxos.
