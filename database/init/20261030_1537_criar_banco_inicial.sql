-- =============================================================================
-- ESQUEMA DO BANCO DE DADOS - GESTÃO DE BANCADAS, ROBÔS E COMPONENTES (MySQL)
-- Requer MySQL 8.0.16+ (CHECK constraints são aplicadas a partir desta versão)
-- Datas em DATETIME: recomenda-se gravar sempre em UTC pela aplicação.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS tenken_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE tenken_db;

-- Obs.: o MySQL não possui CREATE TYPE ... AS ENUM; os ENUMs foram declarados
-- diretamente nas colunas que os utilizam.

-- 1. GESTÃO DE PRÉ-CADASTRO E GERAÇÃO DE MATRÍCULA (ALUNO)
-- Guarda os dados antes do aluno criar a conta oficial
CREATE TABLE pre_matriculas_alunos (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    matricula VARCHAR(50) NOT NULL UNIQUE,   -- Gerada pelo backend no clique do botão
    utilizada BOOLEAN NOT NULL DEFAULT FALSE, -- Vira TRUE quando a conta oficial for criada
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. GESTÃO DE USUÁRIOS E ACADEMIA
-- Centraliza Aluno, Professor, Técnico e Admin com CPF e Telefone
CREATE TABLE usuarios (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil ENUM('ALUNO', 'PROFESSOR', 'TECNICO', 'ADMIN') NOT NULL DEFAULT 'ALUNO',
    matricula VARCHAR(50) UNIQUE,            -- Obrigatório para Alunos; opcional/registro funcional para demais
    status BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_matricula_aluno CHECK (
        (perfil = 'ALUNO' AND matricula IS NOT NULL) OR (perfil <> 'ALUNO')
    )
) ENGINE=InnoDB;

CREATE TABLE turmas_projetos (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    codigo_disciplina VARCHAR(30),
    professor_id BIGINT NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_turmas_professor FOREIGN KEY (professor_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- Vínculo N:N de Alunos oficiais com as Turmas
CREATE TABLE turma_alunos (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    turma_id BIGINT NOT NULL,
    aluno_id BIGINT NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_aluno_turma UNIQUE (turma_id, aluno_id),
    CONSTRAINT fk_turma_alunos_turma FOREIGN KEY (turma_id) REFERENCES turmas_projetos(id) ON DELETE CASCADE,
    CONSTRAINT fk_turma_alunos_aluno FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. GESTÃO DE INVENTÁRIO E ATIVOS (ROBÔS, BANCADAS E COMPONENTES)
CREATE TABLE equipamentos (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    codigo_patrimonio VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    tipo ENUM('BANCADA', 'ROBO') NOT NULL,
    subtipo VARCHAR(50),                     -- Ex: Braço Articulado, Cartesiano, Bancada Eletropneumática, CLP
    modelo_fabricante VARCHAR(100),
    localizacao_laboratorio VARCHAR(50) NOT NULL,
    status ENUM('DISPONIVEL', 'RESERVADO', 'EM_USO', 'EM_MANUTENCAO', 'INATIVO') NOT NULL DEFAULT 'DISPONIVEL',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE componentes (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    codigo_patrimonio VARCHAR(50) UNIQUE,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,          -- Ex: Garra, Sensor, Cabo, Fonte, Multímetro, Motor
    descricao TEXT,
    quantidade_total INT NOT NULL DEFAULT 1 CHECK (quantidade_total >= 0),
    quantidade_disponivel INT NOT NULL DEFAULT 1 CHECK (quantidade_disponivel >= 0),
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE equipamento_componentes (
    equipamento_id BIGINT NOT NULL,
    componente_id BIGINT NOT NULL,
    quantidade_alocada INT NOT NULL DEFAULT 1 CHECK (quantidade_alocada > 0),
    PRIMARY KEY (equipamento_id, componente_id),
    CONSTRAINT fk_eqcomp_equipamento FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE,
    CONSTRAINT fk_eqcomp_componente FOREIGN KEY (componente_id) REFERENCES componentes(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 4. AGENDAMENTOS E TOKENS DE ACESSO
CREATE TABLE agendamentos (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    equipamento_id BIGINT NOT NULL,
    turma_id BIGINT NOT NULL,
    data_hora_inicio DATETIME NOT NULL,
    data_hora_fim DATETIME NOT NULL,
    token_acesso VARCHAR(20) UNIQUE,
    status ENUM('PENDENTE', 'CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO') NOT NULL DEFAULT 'CONFIRMADO',
    observacao TEXT,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_datas_validas CHECK (data_hora_fim > data_hora_inicio),
    CONSTRAINT fk_agend_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_agend_equipamento FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id),
    CONSTRAINT fk_agend_turma FOREIGN KEY (turma_id) REFERENCES turmas_projetos(id)
) ENGINE=InnoDB;

-- CHECK-IN DE ALUNOS VIA TOKEN
CREATE TABLE checkin_alunos (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    agendamento_id BIGINT NOT NULL,
    aluno_id BIGINT NOT NULL,
    data_hora_checkin DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_checkin_unico UNIQUE (agendamento_id, aluno_id),
    CONSTRAINT fk_checkin_agendamento FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE CASCADE,
    CONSTRAINT fk_checkin_aluno FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. MÓDULO TENKEN E VISTORIA
CREATE TABLE checklist_modelos (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    tipo_inspecao ENUM('PRE_USO', 'POS_USO') NOT NULL,
    tipo_equipamento ENUM('BANCADA', 'ROBO') NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE checklist_itens (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    modelo_id BIGINT NOT NULL,
    ordem INT NOT NULL,
    descricao_verificacao TEXT NOT NULL,
    eh_critico BOOLEAN NOT NULL DEFAULT FALSE,
    requer_foto BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_itens_modelo FOREIGN KEY (modelo_id) REFERENCES checklist_modelos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE inspecoes (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    agendamento_id BIGINT NOT NULL,
    modelo_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    tipo ENUM('PRE_USO', 'POS_USO') NOT NULL,
    status_resultado ENUM('APROVADO', 'REPROVADO', 'APROVADO_COM_RESSALVAS') NOT NULL,
    data_hora_realizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacoes_gerais TEXT,
    CONSTRAINT fk_insp_agendamento FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id),
    CONSTRAINT fk_insp_modelo FOREIGN KEY (modelo_id) REFERENCES checklist_modelos(id),
    CONSTRAINT fk_insp_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE inspecao_respostas (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    inspecao_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    conforme BOOLEAN NOT NULL,
    observacao_defeito TEXT,
    foto_comprovante_url VARCHAR(255),
    CONSTRAINT fk_resp_inspecao FOREIGN KEY (inspecao_id) REFERENCES inspecoes(id) ON DELETE CASCADE,
    CONSTRAINT fk_resp_item FOREIGN KEY (item_id) REFERENCES checklist_itens(id)
) ENGINE=InnoDB;

-- 6. RESULTADOS ACADÊMICOS
CREATE TABLE resultados_testes (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    agendamento_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    titulo_experimento VARCHAR(150),
    relatorio_teste TEXT NOT NULL,
    dados_telemetria JSON,
    data_submissao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_result_agendamento FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE CASCADE,
    CONSTRAINT fk_result_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- 7. MANUTENÇÃO
CREATE TABLE chamados_manutencao (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    equipamento_id BIGINT NOT NULL,
    inspecao_id BIGINT,
    solicitante_id BIGINT,
    tecnico_responsavel_id BIGINT,
    titulo VARCHAR(150) NOT NULL,
    descricao_problema TEXT NOT NULL,
    tipo_chamado ENUM('CORRETIVO', 'PREVENTIVO', 'MELHORIA') NOT NULL DEFAULT 'CORRETIVO',
    severidade ENUM('BAIXA', 'MEDIA', 'ALTA', 'CRITICA') DEFAULT 'MEDIA',
    status ENUM('ABERTO', 'EM_ATENDIMENTO', 'AGUARDANDO_PECAS', 'CONCLUIDO', 'CANCELADO') DEFAULT 'ABERTO',
    data_abertura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_conclusao DATETIME NULL,
    CONSTRAINT fk_cham_equipamento FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id),
    CONSTRAINT fk_cham_inspecao FOREIGN KEY (inspecao_id) REFERENCES inspecoes(id),
    CONSTRAINT fk_cham_solicitante FOREIGN KEY (solicitante_id) REFERENCES usuarios(id),
    CONSTRAINT fk_cham_tecnico FOREIGN KEY (tecnico_responsavel_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE historico_manutencao (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    chamado_id BIGINT NOT NULL,
    tecnico_id BIGINT NOT NULL,
    descricao_acao TEXT NOT NULL,
    pecas_substituidas TEXT,
    custo_estimado DECIMAL(10,2) DEFAULT 0.00 CHECK (custo_estimado >= 0),
    data_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hist_chamado FOREIGN KEY (chamado_id) REFERENCES chamados_manutencao(id) ON DELETE CASCADE,
    CONSTRAINT fk_hist_tecnico FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;