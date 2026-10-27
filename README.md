<div align="center">
  <img src="frontend/public/assets/img/logo-site/logo_horizontal.svg" alt="Tenken" width="360" />

  <p><strong>Organização, inspeção e cuidado com equipamentos de laboratórios educacionais.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/JavaScript-ES6%2B-f7df1e?logo=javascript&logoColor=111111" alt="JavaScript" />
    <img src="https://img.shields.io/badge/React-UI-61dafb?logo=react&logoColor=111111" alt="React" />
    <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/CSS3-estilos-1572b6?logo=css3&logoColor=white" alt="CSS3" />
    <img src="https://img.shields.io/badge/Bootstrap-5.3-7952b3?logo=bootstrap&logoColor=white" alt="Bootstrap 5.3" />
  </p>
</div>

## Sobre o projeto

Tenken (点検) é uma plataforma web, em desenvolvimento, para apoiar a organização de bancadas didáticas, robôs, componentes e ferramentas em laboratórios educacionais de robótica e automação. O nome significa inspeção, checagem ou verificação.

O projeto busca substituir controles dispersos por um fluxo rastreável que ajude a prevenir falhas, preservar equipamentos e registrar seu histórico de uso. Seu público inclui estudantes, professores, orientadores, técnicos de laboratório e administradores.

> Este repositório contém atualmente a interface institucional de apresentação do Tenken. Os módulos de gestão descritos neste README fazem parte do escopo planejado e ainda não estão implementados nesta aplicação.

## Tecnologias da interface

<table>
  <tr>
    <td align="center" width="20%"><img src="https://img.shields.io/badge/JavaScript-ES6%2B-f7df1e?logo=javascript&logoColor=111111" alt="JavaScript" /><br /><sub>Linguagem da aplicação</sub></td>
    <td align="center" width="20%"><img src="https://img.shields.io/badge/React-UI-61dafb?logo=react&logoColor=111111" alt="React" /><br /><sub>Componentes de interface</sub></td>
    <td align="center" width="20%"><img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" alt="Next.js" /><br /><sub>Framework web</sub></td>
    <td align="center" width="20%"><img src="https://img.shields.io/badge/CSS3-estilos-1572b6?logo=css3&logoColor=white" alt="CSS3" /><br /><sub>Estilos e responsividade</sub></td>
    <td align="center" width="20%"><img src="https://img.shields.io/badge/Bootstrap-5.3-7952b3?logo=bootstrap&logoColor=white" alt="Bootstrap" /><br /><sub>Grid e utilitários</sub></td>
  </tr>
</table>

O Bootstrap 5.3 é importado pelo layout da aplicação. Os estilos próprios, incluindo a identidade visual e os comportamentos responsivos, ficam em `src/app/globals.css`.

## O que está disponível

- Página institucional de uma página, com hero em vídeo e navegação por âncoras.
- Apresentação do propósito do Tenken, do ciclo de uso dos equipamentos e chamada para acesso.
- Faixa horizontal de logos parceiras, com movimento contínuo no desktop, pausa ao passar o mouse, navegação por toque em celular e respeito a `prefers-reduced-motion`.
- Header que aparece conforme a rolagem da página.
- Layout responsivo e identidade industrial baseada em tons escuros, vermelho, branco e cinza.
- Link de acesso apontando para `/login`. A tela de login ainda não está implementada neste repositório.

## Ciclo de uso proposto

**Agendamento → inspeção prévia → utilização → inspeção posterior → manutenção, quando necessária.**

## Escopo funcional planejado

Os módulos abaixo descrevem a visão do produto e não devem ser tratados como funcionalidades já disponíveis na interface atual:

- **Inventário:** cadastrar equipamentos, componentes e ferramentas, identificando patrimônio e localização.
- **Agendamentos:** consultar disponibilidade, reservar e cancelar horários, evitando conflitos e reservas de equipamentos inativos ou em manutenção.
- **Inspeções:** realizar checklists antes e depois do uso, validar o acesso associado à reserva e registrar condições e evidências de avarias.
- **Ocorrências e manutenção:** registrar falhas, abrir chamados e acompanhar reparos, peças, custos e histórico.
- **Usuários e gestão acadêmica:** trabalhar com perfis de aluno, professor, técnico e administrador, turmas e projetos, com permissões adequadas.
- **Painel e relatórios:** acompanhar disponibilidade, utilização, falhas, ocupação e manutenção.

### Princípios operacionais previstos

- Inspeções pré e pós-uso obrigatórias.
- Rastreabilidade das reservas, inspeções e ocorrências até os usuários responsáveis.
- Falhas críticas bloqueiam o equipamento e exigem encaminhamento urgente para manutenção.
- Falhas não críticas podem gerar manutenção preventiva quando o uso continuar seguro.
- Permissões e disponibilidade precisam ser validadas no back-end, além da interface.
- A segurança operacional tem prioridade sobre a disponibilidade do equipamento.

## Executar localmente

### Requisitos

- Node.js compatível com a versão do Next.js usada pelo projeto.
- npm.

### Instalação e desenvolvimento

```bash
npm install
npm run dev
```

Abra `http://localhost:3000` no navegador.

### Comandos disponíveis

| Comando | Ação |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Gera a versão de produção. |
| `npm run start` | Inicia a versão de produção após o build. |

## Estrutura do repositório

```text
src/app/
├── globals.css          # Identidade visual e estilos responsivos
├── header.jsx           # Header com revelação durante a rolagem
├── layout.jsx           # Layout raiz, metadados e importação do Bootstrap
├── page.jsx             # Página institucional
└── patrocinadores.jsx   # Faixa de logos parceiras

public/assets/
├── img/logo-site/       # Logos Tenken usadas na interface e neste README
├── img/logo-patrocinadores/ # Logos exibidas na faixa de parceiros
└── videos/              # Vídeo de fundo do hero
```

## Identidade visual

| Variável | Cor | Aplicação |
| --- | --- | --- |
| `--onyx` | `#0b090a` | Fundo principal |
| `--carbon-black` | `#161a1d` | Painéis e superfícies escuras |
| `--dark-garnet` | `#660708` | Ações secundárias e bordas |
| `--mahogany-red` | `#a4161a` | Cor principal da marca |
| `--mahogany-red-2` | `#ba181b` | Destaques e estados de interação |
| `--silver` | `#b1a7a6` | Texto secundário |
| `--dust-grey` | `#d3d3d3` | Divisores e linhas |
| `--white-smoke` | `#f5f3f4` | Superfícies claras |
| `--white` | `#ffffff` | Texto sobre fundos escuros |

## Arquitetura futura

O contexto do projeto prevê uma API REST em JSON, banco de dados relacional e autenticação com perfis e tokens JWT. PostgreSQL aparece como opção na arquitetura documentada, enquanto o planejamento inicial também cita MySQL; a definição deve ser confirmada pela equipe antes de implementar a persistência. O armazenamento de evidências fotográficas também deverá ser definido junto à implementação do back-end.

## Equipe

- **Felipe Stevanato:** banco de dados, modelagem e suporte.
- **Guilherme Silva:** interface, arquitetura visual e integração.
- **Samuel Sousa:** documentação, requisitos e apoio ao front-end.
- **Miguel Cantarino:** back-end, API e validação dos fluxos.

