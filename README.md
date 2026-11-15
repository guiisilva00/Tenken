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

## Sobre o projeto

Tenken (点検) é uma plataforma web para apoiar a organização de bancadas didáticas, robôs, componentes e ferramentas em laboratórios educacionais de robótica e automação. O nome significa inspeção, checagem ou verificação.

O projeto substitui controles dispersos por um fluxo rastreável que ajuda a prevenir falhas, preservar equipamentos e registrar seu histórico de uso. Tem front-end em Next.js, back-end em Express e banco de dados MySQL, com autenticação por matrícula/senha e tokens JWT.

## O que já está disponível

- Página institucional pública, login e cadastro de alunos.
- Painel do administrador: gestão de equipamentos, usuários, turmas e chamados, além de relatórios.
- Painel do professor: turmas, agendamentos de equipamentos, inspeções (checklist pré e pós-uso) e chamados de manutenção.
- Painel do técnico: acompanhamento e atendimento de chamados de manutenção.
- Área do aluno: solicitação de acesso à bancada por token de turma (a tela atual ainda usa dados de exemplo enquanto a integração completa com o back-end está em andamento).
- API REST em Express, com autenticação JWT e senhas protegidas com bcrypt.

## Ciclo de uso

**Agendamento → inspeção prévia → utilização → inspeção posterior → manutenção, quando necessária.**

### Regras principais

- Inspeções pré e pós-uso são obrigatórias.
- Reservas, inspeções e chamados ficam vinculados ao usuário responsável.
- Falhas críticas bloqueiam o equipamento e abrem chamado corretivo com prioridade alta.
- Permissões e disponibilidade são validadas no back-end, além da interface.

## Executar localmente com Docker

```bash
cp .env.example .env
docker compose up --build
```

O front-end fica disponível em `http://localhost:3000` e a API em `http://localhost:8080/api`.

## Executar localmente sem Docker

### Banco de dados

Crie o banco e aplique `database/init/02-schema.sql`. Esse arquivo contém o schema atual completo e os checklists iniciais; uma instalação nova não precisa executar migrations. Em seguida, execute o seed de usuários de teste:

```bash
mysql tenken_db < database/seed/usuarios_teste.sql
```

As migrations em `database/migrations/` servem apenas para atualizar bancos existentes. A migration `20261113_remove_unused_tables.sql` remove tabelas legadas e pode apagar dados; revise-as antes de executá-la.

Isso cria três contas de teste (uso restrito a ambiente local):

```text
Administrador — Matrícula: ADMIN001 — Senha: TenkenAdmin123!
Professor     — Matrícula: PROF001  — Senha: TenkenProf123!
Técnico       — Matrícula: TEC001   — Senha: TenkenTec123!
```

Para um ambiente de desenvolvimento com mais dados (turmas, equipamentos, agendamentos), use também `database/seed/20261108_1020_seed_completa_laboratorio.sql`.

### Back-end

```bash
cd backend
cp .env.example .env   # defina DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
npm install
npm run dev
```

### Front-end

```bash
cd frontend
cp .env.example .env   # defina NEXT_PUBLIC_API_URL
npm install
npm run dev
```

Abra `http://localhost:3000` no navegador.

### Comandos disponíveis (front-end)

| Comando         | Ação                                      |
| --------------- | ----------------------------------------- |
| `npm run dev`   | Inicia o servidor de desenvolvimento.     |
| `npm run build` | Gera a versão de produção.                |
| `npm run start` | Inicia a versão de produção após o build. |

### Comandos disponíveis (back-end)

| Comando         | Ação                                        |
| --------------- | ------------------------------------------- |
| `npm run dev`   | Inicia a API com recarregamento automático. |
| `npm run start` | Inicia a API em modo produção.              |

## Estrutura do repositório

```text
backend/src/
├── controllers/   # Recebe a requisição e devolve a resposta
├── services/      # Regras de negócio
├── models/        # Acesso ao banco de dados (mysql2)
├── routes/        # Definição das rotas por recurso
└── middlewares/   # Autenticação e tratamento de erros

frontend/src/
├── app/           # Rotas do Next.js (App Router), uma pasta por perfil
├── components/    # Componentes compartilhados entre os perfis
└── lib/           # Cliente de API e sessão do usuário

database/
├── init/          # Schema completo para bancos novos (MySQL)
├── migrations/    # Atualizações para bancos existentes
└── seed/          # Dados de exemplo e contas de teste
```

## Identidade visual

| Variável           | Cor       | Aplicação                        |
| ------------------ | --------- | -------------------------------- |
| `--onyx`           | `#0b090a` | Fundo principal                  |
| `--carbon-black`   | `#161a1d` | Painéis e superfícies escuras    |
| `--dark-garnet`    | `#660708` | Ações secundárias e bordas       |
| `--mahogany-red`   | `#a4161a` | Cor principal da marca           |
| `--mahogany-red-2` | `#ba181b` | Destaques e estados de interação |
| `--silver`         | `#b1a7a6` | Texto secundário                 |
| `--dust-grey`      | `#d3d3d3` | Divisores e linhas               |
| `--white-smoke`    | `#f5f3f4` | Superfícies claras               |
| `--white`          | `#ffffff` | Texto sobre fundos escuros       |

## Equipe

- **Felipe Stevanato:** banco de dados, modelagem e suporte.
- **Guilherme Silva:** interface, arquitetura visual e integração.
- **Samuel Sousa:** documentação, requisitos e apoio ao front-end.
- **Miguel Cantarino:** back-end, API e validação dos fluxos.
