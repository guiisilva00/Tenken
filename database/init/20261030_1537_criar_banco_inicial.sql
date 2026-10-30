-- =============================================================================
-- ESQUEMA DO BANCO DE DADOS - GESTÃO DE BANCADAS, ROBÔS E COMPONENTES
-- =============================================================================

USE tenken_db;

-- 1. TIPOS
CREATE TYPE perfil_usuario AS ENUM ('ALUNO', 'PROFESSOR', 'TECNICO', 'ADMIN');
CREATE TYPE tipo_equipamento AS ENUM ('BANCADA', 'ROBO');
CREATE TYPE status_equipamento AS ENUM ('DISPONIVEL', 'RESERVADO', 'EM_USO', 'EM_MANUTENCAO', 'INATIVO');
CREATE TYPE status_agendamento AS ENUM ('PENDENTE', 'CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO');
CREATE TYPE tipo_inspecao AS ENUM ('PRE_USO', 'POS_USO');
CREATE TYPE resultado_inspecao AS ENUM ('APROVADO', 'REPROVADO', 'APROVADO_COM_RESSALVAS');
CREATE TYPE tipo_chamado AS ENUM ('CORRETIVO', 'PREVENTIVO', 'MELHORIA'); 
CREATE TYPE status_chamado AS ENUM ('ABERTO', 'EM_ATENDIMENTO', 'AGUARDANDO_PECAS', 'CONCLUIDO', 'CANCELADO');
CREATE TYPE severidade_chamado AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA');

-- 2. GESTÃO DE PRÉ-CADASTRO E GERAÇÃO DE MATRÍCULA (ALUNO)
-- Tabela para guardar os dados antes do aluno criar a conta oficial
CREATE TABLE pre_matriculas_alunos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    matricula VARCHAR(50) UNIQUE NOT NULL, -- Gerada pelo backend no clique do botão
    utilizada BOOLEAN DEFAULT false,       -- Vira 'true' quando a conta oficial for criada
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. GESTÃO DE USUÁRIOS E ACADEMIA
-- Centraliza Aluno, Professor, Técnico e Admin com CPF e Telefone
CREATE TABLE usuarios (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil perfil_usuario NOT NULL DEFAULT 'ALUNO',
    matricula VARCHAR(50) UNIQUE,          -- Obrigatório para Alunos; opcional/registro funcional para demais
    status BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_matricula_aluno CHECK (
        (perfil = 'ALUNO' AND matricula IS NOT NULL) OR (perfil <> 'ALUNO')
    )
);

CREATE TABLE turmas_projetos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    codigo_disciplina VARCHAR(30),
    professor_id BIGINT NOT NULL REFERENCES usuarios(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vínculo N:N de Alunos oficiais com as Turmas
CREATE TABLE turma_alunos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    turma_id BIGINT NOT NULL REFERENCES turmas_projetos(id) ON DELETE CASCADE,
    aluno_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_aluno_turma UNIQUE (turma_id, aluno_id)
);

-- 4. GESTÃO DE INVENTÁRIO E ATIVOS (ROBÔS, BANCADAS E COMPONENTES)
CREATE TABLE equipamentos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo_patrimonio VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    tipo tipo_equipamento NOT NULL,
    subtipo VARCHAR(50),                   -- Ex: Braço Articulado, Cartesiano, Bancada Eletropneumática, CLP
    modelo_fabricante VARCHAR(100),
    localizacao_laboratorio VARCHAR(50) NOT NULL,
    status status_equipamento DEFAULT 'DISPONIVEL',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE componentes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo_patrimonio VARCHAR(50) UNIQUE,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,        -- Ex: Garra, Sensor, Cabo, Fonte, Multímetro, Motor
    descricao TEXT,
    quantidade_total INT DEFAULT 1 CHECK (quantidade_total >= 0),
    quantidade_disponivel INT DEFAULT 1 CHECK (quantidade_disponivel >= 0),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipamento_componentes (
    equipamento_id BIGINT REFERENCES equipamentos(id) ON DELETE CASCADE,
    componente_id BIGINT REFERENCES componentes(id) ON DELETE RESTRICT,
    quantidade_alocada INT DEFAULT 1 CHECK (quantidade_alocada > 0),
    PRIMARY KEY (equipamento_id, componente_id)
);

-- 5. AGENDAMENTOS E TOKENS DE ACESSO
CREATE TABLE agendamentos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id), 
    equipamento_id BIGINT NOT NULL REFERENCES equipamentos(id),
    turma_id BIGINT NOT NULL REFERENCES turmas_projetos(id),
    data_hora_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_hora_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    token_acesso VARCHAR(20) UNIQUE,
    status status_agendamento DEFAULT 'CONFIRMADO',
    observacao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_datas_validas CHECK (data_hora_fim > data_hora_inicio)
);

-- CHECK-IN DE ALUNOS VIA TOKEN
CREATE TABLE checkin_alunos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    agendamento_id BIGINT NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    aluno_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    data_hora_checkin TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_checkin_unico UNIQUE (agendamento_id, aluno_id)
);

-- 6. MÓDULO TENKEN E VISTORIA
CREATE TABLE checklist_modelos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    tipo_inspecao tipo_inspecao NOT NULL,
    tipo_equipamento tipo_equipamento NOT NULL,
    ativo BOOLEAN DEFAULT true
);

CREATE TABLE checklist_itens (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    modelo_id BIGINT NOT NULL REFERENCES checklist_modelos(id) ON DELETE CASCADE,
    ordem INT NOT NULL,
    descricao_verificacao TEXT NOT NULL,
    eh_critico BOOLEAN DEFAULT false,
    requer_foto BOOLEAN DEFAULT false
);

CREATE TABLE inspecoes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    agendamento_id BIGINT NOT NULL REFERENCES agendamentos(id),
    modelo_id BIGINT NOT NULL REFERENCES checklist_modelos(id),
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    tipo tipo_inspecao NOT NULL,
    status_resultado resultado_inspecao NOT NULL,
    data_hora_realizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    observacoes_gerais TEXT
);

CREATE TABLE inspecao_respostas (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    inspecao_id BIGINT NOT NULL REFERENCES inspecoes(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES checklist_itens(id),
    conforme BOOLEAN NOT NULL,
    observacao_defeito TEXT,
    foto_comprovante_url VARCHAR(255)
);

-- 7. RESULTADOS ACADÊMICOS
CREATE TABLE resultados_testes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    agendamento_id BIGINT NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    titulo_experimento VARCHAR(150),
    relatorio_teste TEXT NOT NULL,
    dados_telemetria JSONB, 
    data_submissao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. MANUTENÇÃO
CREATE TABLE chamados_manutencao (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    equipamento_id BIGINT NOT NULL REFERENCES equipamentos(id),
    inspecao_id BIGINT REFERENCES inspecoes(id),
    solicitante_id BIGINT REFERENCES usuarios(id), 
    tecnico_responsavel_id BIGINT REFERENCES usuarios(id),
    titulo VARCHAR(150) NOT NULL,
    descricao_problema TEXT NOT NULL,
    tipo_chamado tipo_chamado NOT NULL DEFAULT 'CORRETIVO',
    severidade severidade_chamado DEFAULT 'MEDIA',
    status status_chamado DEFAULT 'ABERTO',
    data_abertura TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_conclusao TIMESTAMP WITH TIME ZONE
);

CREATE TABLE historico_manutencao (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    chamado_id BIGINT NOT NULL REFERENCES chamados_manutencao(id) ON DELETE CASCADE,
    tecnico_id BIGINT NOT NULL REFERENCES usuarios(id),
    descricao_acao TEXT NOT NULL,
    pecas_substituidas TEXT,
    custo_estimado DECIMAL(10,2) DEFAULT 0.00 CHECK (custo_estimado >= 0),
    data_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);