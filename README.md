<div align="center">
  <img src="frontend/public/assets/img/logo-site/logo_horizontal.svg" alt="Tenken" width="360" />

  <p><strong>Organização, inspeção e cuidado com equipamentos de laboratórios educacionais.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/JavaScript-ES6%2B-f7df1e?logo=javascript&logoColor=111111" alt="JavaScript" />
    <img src="https://img.shields.io/badge/React-UI-61dafb?logo=react&logoColor=111111" alt="React" />
    <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/Express-API-000000?logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MySQL-banco%20de%20dados-4479a1?logo=mysql&logoColor=white" alt="MySQL" />
    <img src="https://img.shields.io/badge/CSS3-estilos-1572b6?logo=css3&logoColor=white" alt="CSS3" />
  </p>
</div>

Plataforma web para organizar o uso, a inspeção e a manutenção de equipamentos em laboratórios educacionais de robótica e automação.

Tenken conecta alunos, professores, técnicos e administradores em um fluxo rastreável de agendamento, check-in, inspeção pré e pós-uso e manutenção. O sistema valida permissões e regras de negócio na API, registra ocorrências por equipamento e ajuda a preservar o patrimônio do laboratório.

## Funcionalidades

- **Administrador:** painéis e relatórios, gestão de equipamentos, usuários, turmas, chamados e pré-cadastros de equipe.
- **Professor:** gestão de turmas, agendamento de equipamentos, aprovação de check-ins, inspeções com checklist e acompanhamento de chamados.
- **Aluno:** cadastro e acesso, solicitação de vínculo/acesso por token de turma ou reserva, consulta de check-in e visualização dos equipamentos da aula.
- **Técnico:** painel operacional, atendimento de chamados, ordens de serviço e histórico de manutenção.
- **Fluxo de manutenção:** inspeções registram respostas e evidências; reprovações podem abrir chamados e colocar o equipamento em manutenção conforme as regras do sistema.
- **Acesso seguro:** autenticação JWT, senhas com hash bcrypt, autorização por perfil, validação de disponibilidade e proteção de rotas.
## Tecnologias

- Front-end: Next.js 16, React, JavaScript e CSS Modules.
- API: Node.js, Express 5 e JavaScript ES modules.
- Persistência: MySQL com `mysql2`.
- Infraestrutura local: Docker Compose.

## Requisitos

- Node.js compatível com as versões usadas pelas dependências do projeto.
- MySQL 8 ou Docker para executar o banco.
- npm.

## Configuração e execução local

### 1. Banco de dados

Crie o banco `tenken_db` e aplique o schema completo:

```bash
mysql -u SEU_USUARIO -p -e "CREATE DATABASE tenken_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u SEU_USUARIO -p tenken_db < database/init/02-schema.sql
```

Opcionalmente, carregue dados de demonstração:

```bash
mysql -u SEU_USUARIO -p tenken_db < database/seed/20261108_1020_seed_completa_laboratorio.sql
```

`database/seed/usuarios_teste.sql` contém credenciais destinadas apenas a desenvolvimento local. Não use essas contas em produção.

### 2. API

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Configure no `backend/.env` as variáveis `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET` e `FRONTEND_URL`. Para redefinição de senha por e-mail, configure também as variáveis SMTP do exemplo. A API usa a porta `8080` por padrão; o health check fica em `/api/health`.

### 3. Front-end

Em outro terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Defina `NEXT_PUBLIC_API_URL` como a URL base da API, incluindo `/api` (por exemplo, `http://localhost:8080/api`). O front-end fica em `http://localhost:3000`.

### Docker Compose

O `docker-compose.yml` configura MySQL, API e front-end. Copie os valores de configuração para um `.env` na raiz e inicie os serviços:

```bash
docker compose up --build
```

Revise as portas e credenciais no compose e use segredos próprios antes de expor o ambiente fora da máquina local.

## Comandos

Na pasta `frontend/`:

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Gera o build de produção. |
| `npm run start` | Serve o build de produção. |

Na pasta `backend/`:

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia a API com reinício automático. |
| `npm start` | Inicia a API em modo normal. |

## Estrutura

```text
frontend/src/app/       Rotas e páginas por perfil (Next.js App Router)
frontend/src/components Componentes compartilhados
backend/src/routes/     Rotas HTTP da API
backend/src/controllers Controladores HTTP
backend/src/services/   Regras de negócio
backend/src/models/     Acesso a dados
backend/src/middlewares/Autenticação, upload e tratamento de erros
database/init/          Schema para novas instalações
database/seed/          Dados de demonstração e contas locais
docs/                   Documentação funcional e técnica
```

## Documentação

- [Documentação oficial do projeto](docs/tenken_documentacao_oficial.md)
- [Fluxo de acesso e aprovação do aluno](docs/fluxo-acesso-aluno.md)
- [Chamados de manutenção originados por inspeções](docs/chamados-professor.md)
- [Quadro Kanban Tenken](https://trello.com/b/ALSjCOok/tenken)

## Observações para entrega

- O projeto não declara uma suíte geral de testes automatizados ou um comando `npm test` nos pacotes. Os scripts disponíveis estão listados acima.
- O schema em `database/init/02-schema.sql` é a referência disponível para inicializar o banco. Faça backup antes de substituir ou alterar um banco com dados reais.
- Use senhas, `JWT_SECRET` e credenciais SMTP próprios. Não publique arquivos `.env`, dumps com dados pessoais ou credenciais de demonstração.

## Equipe

- Felipe Stevanato — banco de dados e modelagem.
- Guilherme Silva — interface e integração.
- Samuel Sousa — documentação e requisitos.
- Miguel Cantarino — API e regras de negócio.
