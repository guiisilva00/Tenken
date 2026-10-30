-- ESQUEMA INICIAL DO BANCO DE DADOS 


CREATE DATABASE IF NOT EXISTS tenken_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE tenken_db;

-- TABELA: usuarios
-- RF10: cadastro e perfil de acesso (Aluno, Professor, Técnico e Admin).
-- RN06: a API deve permitir gestão do Tenken e alteração de status apenas a
-- Técnico/Admin. RNF03: senha_hash deve receber somente hash bcrypt gerado na API.
-- RNF06: JWT é emitido/validado pela API; não é armazenado nesta tabela.
CREATE TABLE usuarios (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil ENUM('ALUNO', 'PROFESSOR', 'TECNICO', 'ADMIN') NOT NULL,
    matricula VARCHAR(50) UNIQUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- TABELA: turmas_projetos
-- RF11: associa uma turma/projeto ao professor responsável.
CREATE TABLE turmas_projetos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    professor_id BIGINT UNSIGNED NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professor_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- TABELA: turma_alunos
-- RF11: vínculo N:N entre alunos e turmas/projetos.
-- A API valida que aluno_id tem perfil ALUNO e professor_id tem perfil PROFESSOR.
CREATE TABLE turma_alunos (
    turma_id BIGINT UNSIGNED NOT NULL,
    aluno_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (turma_id, aluno_id),
    FOREIGN KEY (turma_id) REFERENCES turmas_projetos(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- TABELA: equipamentos
-- RF01: cadastro do ativo, patrimônio exclusivo, localização e ID interno.
-- RN05/RF13: status informa disponibilidade; a API bloqueia reserva de ativos
-- INATIVO/EM_MANUTENCAO e mantém o estado atualizado durante o uso.
-- RN06: mudanças de status são restritas à API para Técnico/Admin.
CREATE TABLE equipamentos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo_patrimonio VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    tipo ENUM('BANCADA', 'ROBO') NOT NULL,
    localizacao VARCHAR(100) NOT NULL,
    status ENUM('DISPONIVEL', 'RESERVADO', 'EM_USO', 'EM_MANUTENCAO', 'INATIVO') NOT NULL DEFAULT 'DISPONIVEL',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- TABELA: componentes
-- RF02: catálogo de peças e quantidade total controlada.
CREATE TABLE componentes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    quantidade_total INT UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- TABELA: equipamento_componentes
-- RF02: composição física de cada equipamento e quantidade de cada componente.
CREATE TABLE equipamento_componentes (
    equipamento_id BIGINT UNSIGNED NOT NULL,
    componente_id BIGINT UNSIGNED NOT NULL,
    quantidade INT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (equipamento_id, componente_id),
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (componente_id) REFERENCES componentes(id)
) ENGINE=InnoDB;

-- TABELA: agendamentos
-- RN03: responsavel_id identifica o responsável patrimonial da reserva.
-- RN05/RF06: período, ativo, estado e token único da reserva. CHECK valida a
-- ordem das datas; a API deve impedir sobreposição e verificar o estado do ativo.
-- RF09: índice por equipamento e período apoia calendário e busca de horários.
-- RF11: associa a reserva à turma/projeto.
-- RF12: cancelamento atualiza status para CANCELADO e libera o horário via API.
CREATE TABLE agendamentos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    responsavel_id BIGINT UNSIGNED NOT NULL,
    equipamento_id BIGINT UNSIGNED NOT NULL,
    turma_id BIGINT UNSIGNED NOT NULL,
    inicio DATETIME NOT NULL,
    fim DATETIME NOT NULL,
    token_acesso VARCHAR(20) NOT NULL UNIQUE,
    status ENUM('CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO') NOT NULL DEFAULT 'CONFIRMADO',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (fim > inicio),
    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id),
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id),
    FOREIGN KEY (turma_id) REFERENCES turmas_projetos(id),
    INDEX idx_agendamento_equipamento_horario (equipamento_id, inicio, fim)
) ENGINE=InnoDB;

-- TABELA: checkins
-- RN04/RF03: registra a presença de cada aluno na reserva validada pelo token.
-- A chave composta impede mais de um check-in do mesmo aluno na mesma reserva;
-- a API valida token, turma e perfil do aluno.
CREATE TABLE checkins (
    agendamento_id BIGINT UNSIGNED NOT NULL,
    aluno_id BIGINT UNSIGNED NOT NULL,
    realizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (agendamento_id, aluno_id),
    FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- TABELA: checklist_modelos
-- RN02/RF03: modelos de checklist por tipo de equipamento e etapa pré/pós-uso.
CREATE TABLE checklist_modelos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    tipo_equipamento ENUM('BANCADA', 'ROBO') NOT NULL,
    etapa ENUM('PRE_USO', 'POS_USO') NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- TABELA: checklist_itens
-- RN01/RF03: itens verificáveis; critico distingue falha impeditiva de alerta.
CREATE TABLE checklist_itens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    modelo_id BIGINT UNSIGNED NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    critico BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (modelo_id) REFERENCES checklist_modelos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- TABELA: inspecoes
-- RN02: registra vistoria pré e pós; UNIQUE permite uma de cada por reserva.
-- RN04/RF03: professor_id registra quem vistoriou. A API restringe vistoria e
-- liberação ao professor da turma e exige resposta para todos os itens ativos.
-- RN01: resultado é consolidado pela API conforme respostas e criticidade.
CREATE TABLE inspecoes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    agendamento_id BIGINT UNSIGNED NOT NULL,
    modelo_id BIGINT UNSIGNED NOT NULL,
    professor_id BIGINT UNSIGNED NOT NULL,
    etapa ENUM('PRE_USO', 'POS_USO') NOT NULL,
    resultado ENUM('APROVADO', 'REPROVADO', 'APROVADO_COM_RESSALVAS') NOT NULL,
    observacoes TEXT,
    realizada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (agendamento_id, etapa),
    FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id),
    FOREIGN KEY (modelo_id) REFERENCES checklist_modelos(id),
    FOREIGN KEY (professor_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- TABELA: inspecao_respostas
-- RN01/RF03: resultado individual de cada item da vistoria.
-- RF04/RNF05: caminho_foto guarda o caminho da imagem no armazenamento local;
-- o arquivo é recebido/salvo pelo Multer na API, não dentro do banco.
CREATE TABLE inspecao_respostas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    inspecao_id BIGINT UNSIGNED NOT NULL,
    item_id BIGINT UNSIGNED NOT NULL,
    conforme BOOLEAN NOT NULL,
    observacao TEXT,
    caminho_foto VARCHAR(500),
    UNIQUE (inspecao_id, item_id),
    FOREIGN KEY (inspecao_id) REFERENCES inspecoes(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES checklist_itens(id)
) ENGINE=InnoDB;

-- TABELA: inspecao_componentes
-- RF02/RN02: compara quantidades esperadas, encontradas e danificadas durante
-- a vistoria; diferença pode gerar ocorrência patrimonial conforme a API.
CREATE TABLE inspecao_componentes (
    inspecao_id BIGINT UNSIGNED NOT NULL,
    componente_id BIGINT UNSIGNED NOT NULL,
    quantidade_esperada INT UNSIGNED NOT NULL,
    quantidade_encontrada INT UNSIGNED NOT NULL,
    quantidade_danificada INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (inspecao_id, componente_id),
    CHECK (quantidade_danificada <= quantidade_encontrada),
    FOREIGN KEY (inspecao_id) REFERENCES inspecoes(id) ON DELETE CASCADE,
    FOREIGN KEY (componente_id) REFERENCES componentes(id)
) ENGINE=InnoDB;

-- TABELA: ocorrencias_patrimoniais
-- RN03: registra dano/extravio de componente vinculado à reserva; o responsável
-- é obtido por agendamentos.responsavel_id. A API valida essa associação.
CREATE TABLE ocorrencias_patrimoniais (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    agendamento_id BIGINT UNSIGNED NOT NULL,
    componente_id BIGINT UNSIGNED,
    tipo ENUM('DANO', 'EXTRAVIO') NOT NULL,
    quantidade INT UNSIGNED NOT NULL DEFAULT 1,
    descricao TEXT,
    criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id),
    FOREIGN KEY (componente_id) REFERENCES componentes(id)
) ENGINE=InnoDB;

-- TABELA: chamados_manutencao
-- RN01/RF05: falha em item crítico gera chamado urgente e bloqueio do ativo;
-- falha não crítica gera chamado preventivo e mantém o uso liberado. A API
-- decide tipo/severidade/status pelas respostas e evita duplicidade por inspeção.
-- RF07: inspecao_id NULL permite chamado aberto manualmente.
-- RF08/RF16: datas/status apoiam reparo e notificação aos responsáveis.
CREATE TABLE chamados_manutencao (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    equipamento_id BIGINT UNSIGNED NOT NULL,
    inspecao_id BIGINT UNSIGNED,
    solicitante_id BIGINT UNSIGNED,
    tecnico_id BIGINT UNSIGNED,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    tipo ENUM('CORRETIVO', 'PREVENTIVO') NOT NULL DEFAULT 'CORRETIVO',
    severidade ENUM('BAIXA', 'MEDIA', 'ALTA', 'CRITICA') NOT NULL DEFAULT 'MEDIA',
    status ENUM('ABERTO', 'EM_ATENDIMENTO', 'AGUARDANDO_PECAS', 'CONCLUIDO', 'CANCELADO') NOT NULL DEFAULT 'ABERTO',
    aberto_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    concluido_em DATETIME,
    UNIQUE (inspecao_id),
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id),
    FOREIGN KEY (inspecao_id) REFERENCES inspecoes(id),
    FOREIGN KEY (solicitante_id) REFERENCES usuarios(id),
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id),
    INDEX idx_chamado_equipamento_status (equipamento_id, status)
) ENGINE=InnoDB;

-- TABELA: historico_manutencao
-- RF08: ações de reparo, técnico, peças substituídas, custo e data; registros
-- alimentam também o cálculo de MTTR do RF14.
CREATE TABLE historico_manutencao (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    chamado_id BIGINT UNSIGNED NOT NULL,
    tecnico_id BIGINT UNSIGNED NOT NULL,
    descricao TEXT NOT NULL,
    pecas_trocadas TEXT,
    custo DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (custo >= 0),
    registrado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chamado_id) REFERENCES chamados_manutencao(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- TABELA: notificacoes
-- RF16: alertas associados a usuários e chamados; a API cria notificações para
-- professores e técnicos quando um chamado urgente é aberto.
CREATE TABLE notificacoes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT UNSIGNED NOT NULL,
    chamado_id BIGINT UNSIGNED,
    mensagem VARCHAR(255) NOT NULL,
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (chamado_id) REFERENCES chamados_manutencao(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- TABELA: resultados_testes
-- RF15: relatório e resultado da prática vinculados à reserva e ao aluno autor.
CREATE TABLE resultados_testes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    agendamento_id BIGINT UNSIGNED NOT NULL,
    usuario_id BIGINT UNSIGNED NOT NULL,
    titulo VARCHAR(150),
    relatorio TEXT NOT NULL,
    enviado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;
