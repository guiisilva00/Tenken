-- ESQUEMA INICIAL DO BANCO DE DADOS


CREATE DATABASE IF NOT EXISTS tenken_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE tenken_db;

-- TABELA: usuarios
-- RF10: cadastro e perfil de acesso (Aluno, Professor, TÃ©cnico e Admin).
-- RN06: a API deve permitir gestÃ£o do Tenken e alteraÃ§Ã£o de status apenas a
-- TÃ©cnico/Admin. RNF03: senha_hash deve receber somente hash bcrypt gerado na API.
-- RNF06: JWT Ã© emitido/validado pela API; nÃ£o Ã© armazenado nesta tabela.
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
-- RF11: associa uma turma/projeto ao professor responsÃ¡vel.
CREATE TABLE turmas_projetos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    professor_id BIGINT UNSIGNED NOT NULL,
    token_acesso VARCHAR(8) NULL UNIQUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professor_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- TABELA: turma_alunos
-- RF11: vÃ­nculo N:N entre alunos e turmas/projetos.
-- A API valida que aluno_id tem perfil ALUNO e professor_id tem perfil PROFESSOR.
CREATE TABLE turma_alunos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    turma_id BIGINT UNSIGNED NOT NULL,
    aluno_id BIGINT UNSIGNED NOT NULL,
    FOREIGN KEY (turma_id) REFERENCES turmas_projetos(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- TABELA: equipamentos
-- RF01: cadastro do ativo, patrimÃ´nio exclusivo, localizaÃ§Ã£o e ID interno.
-- RN05/RF13: status informa disponibilidade; a API bloqueia reserva de ativos
-- INATIVO/EM_MANUTENCAO e mantÃ©m o estado atualizado durante o uso.
-- RN06: mudanÃ§as de status sÃ£o restritas Ã  API para TÃ©cnico/Admin.
CREATE TABLE equipamentos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo_patrimonio VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    tipo ENUM('BANCADA', 'ROBO') NOT NULL,
    localizacao VARCHAR(100) NOT NULL,
    status ENUM('DISPONIVEL', 'RESERVADO', 'EM_USO', 'EM_MANUTENCAO', 'INATIVO') NOT NULL DEFAULT 'DISPONIVEL',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- TABELA: agendamentos
-- RN03: responsavel_id identifica o responsÃ¡vel patrimonial da reserva.
-- RN05/RF06: perÃ­odo, ativo, estado e token Ãºnico da reserva. CHECK valida a
-- ordem das datas; a API deve impedir sobreposiÃ§Ã£o e verificar o estado do ativo.
-- RF09: Ã­ndice por equipamento e perÃ­odo apoia calendÃ¡rio e busca de horÃ¡rios.
-- RF11: associa a reserva Ã  turma/projeto.
-- RF12: cancelamento atualiza status para CANCELADO e libera o horÃ¡rio via API.
CREATE TABLE agendamentos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    responsavel_id BIGINT UNSIGNED NOT NULL,
    equipamento_id BIGINT UNSIGNED NOT NULL,
    turma_id BIGINT UNSIGNED NOT NULL,
    atividade VARCHAR(120) NULL,
    inicio DATETIME NOT NULL,
    fim DATETIME NOT NULL,
    -- legado: token agora fica em turmas_projetos.
    token_acesso VARCHAR(20) NULL,
    status ENUM('CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO') NOT NULL DEFAULT 'CONFIRMADO',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (fim > inicio),
    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id),
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id),
    FOREIGN KEY (turma_id) REFERENCES turmas_projetos(id),
    INDEX idx_agendamento_equipamento_horario (equipamento_id, inicio, fim)
) ENGINE=InnoDB;

-- TABELA: checkins
-- RN04/RF03: registra a presenÃ§a de cada aluno na reserva validada pelo token.
-- A chave composta impede mais de um check-in do mesmo aluno na mesma reserva;
-- a API valida token, turma e perfil do aluno.
CREATE TABLE checkins (
    agendamento_id BIGINT UNSIGNED NOT NULL,
    aluno_id BIGINT UNSIGNED NOT NULL,
    realizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- NULL = aguardando aprovação do professor.
    aprovado_em DATETIME NULL,
    PRIMARY KEY (agendamento_id, aluno_id),
    FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- TABELA: checklist_modelos
-- RN02/RF03: modelos de checklist por tipo de equipamento e etapa prÃ©/pÃ³s-uso.
CREATE TABLE checklist_modelos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    tipo_equipamento ENUM('BANCADA', 'ROBO') NOT NULL,
    etapa ENUM('PRE_USO', 'POS_USO') NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- TABELA: checklist_itens
-- RN01/RF03: itens verificÃ¡veis; critico distingue falha impeditiva de alerta.
CREATE TABLE checklist_itens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    modelo_id BIGINT UNSIGNED NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    critico BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (modelo_id) REFERENCES checklist_modelos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Modelos e itens iniciais dos checklists usados na página do professor.
INSERT INTO checklist_modelos (titulo, tipo_equipamento, etapa, ativo) VALUES
('Inspeção de bancada — pré-uso', 'BANCADA', 'PRE_USO', TRUE),
('Inspeção de bancada — pós-uso', 'BANCADA', 'POS_USO', TRUE),
('Inspeção de robô colaborativo — início', 'ROBO', 'PRE_USO', TRUE),
('Devolução de robô colaborativo', 'ROBO', 'POS_USO', TRUE);

INSERT INTO checklist_itens (modelo_id, descricao, critico) VALUES
((SELECT id FROM checklist_modelos WHERE titulo = 'Inspeção de bancada — pré-uso'), 'Botão de emergência interrompe o circuito ao ser acionado', TRUE),
((SELECT id FROM checklist_modelos WHERE titulo = 'Inspeção de bancada — pré-uso'), 'Cabos e pontas de prova sem cobre exposto', TRUE),
((SELECT id FROM checklist_modelos WHERE titulo = 'Inspeção de bancada — pré-uso'), 'Bornes, seletores e instrumentos estão identificados e funcionando', FALSE),
((SELECT id FROM checklist_modelos WHERE titulo = 'Inspeção de bancada — pré-uso'), 'Proteções e tampas do painel estão instaladas e sem danos visíveis', TRUE),
((SELECT id FROM checklist_modelos WHERE titulo = 'Inspeção de bancada — pré-uso'), 'A bancada está estável e não há peças soltas', TRUE),
((SELECT id FROM checklist_modelos WHERE titulo = 'Inspeção de bancada — pós-uso'), 'Bancada, fontes e instrumentos desligados; área organizada e segura', TRUE),
((SELECT id FROM checklist_modelos WHERE titulo = 'Inspeção de bancada — pós-uso'), 'Cabos e acessórios devolvidos ao suporte', FALSE),
((SELECT id FROM checklist_modelos WHERE titulo = 'Inspeção de bancada — pós-uso'), 'Não houve aquecimento, cheiro ou ruído anormal durante o uso', TRUE),
((SELECT id FROM checklist_modelos WHERE titulo = 'Inspeção de bancada — pós-uso'), 'Cabos, conectores e instrumentos continuam sem danos após a atividade', TRUE),
((SELECT id FROM checklist_modelos WHERE titulo = 'Inspeção de bancada — pós-uso'), 'Componentes usados foram contabilizados; itens faltantes foram registrados', FALSE),
((SELECT id FROM checklist_modelos WHERE titulo = 'Inspeção de robô colaborativo — início'), 'Cercamento e parada de emergência funcionando', TRUE),
((SELECT id FROM checklist_modelos WHERE titulo = 'Inspeção de robô colaborativo — início'), 'Garra e ferramenta firmemente fixadas', TRUE),
((SELECT id FROM checklist_modelos WHERE titulo = 'Inspeção de robô colaborativo — início'), 'Área de trabalho livre de objetos soltos', FALSE),
((SELECT id FROM checklist_modelos WHERE titulo = 'Inspeção de robô colaborativo — início'), 'Cabos, mangueiras e conexões estão sem desgaste, esmagamento ou vazamento visível.', TRUE),
((SELECT id FROM checklist_modelos WHERE titulo = 'Inspeção de robô colaborativo — início'), 'Modo de operação e velocidade estão adequados à atividade planejada.', TRUE),
((SELECT id FROM checklist_modelos WHERE titulo = 'Devolução de robô colaborativo'), 'Robô estacionado e alimentação isolada', TRUE),
((SELECT id FROM checklist_modelos WHERE titulo = 'Devolução de robô colaborativo'), 'Ferramentas e gabaritos guardados', FALSE),
((SELECT id FROM checklist_modelos WHERE titulo = 'Devolução de robô colaborativo'), 'Garra e ferramenta continuam firmes e sem danos após o uso.', TRUE),
((SELECT id FROM checklist_modelos WHERE titulo = 'Devolução de robô colaborativo'), 'Não houve colisão, parada de emergência ou comportamento inesperado durante a atividade.', TRUE),
((SELECT id FROM checklist_modelos WHERE titulo = 'Devolução de robô colaborativo'), 'A célula e a área de trabalho estão sem danos e sem objetos deixados para trás.', TRUE);

-- TABELA: inspecoes
-- RN02: registra vistoria prÃ© e pÃ³s; UNIQUE permite uma de cada por reserva.
-- RN04/RF03: professor_id registra quem vistoriou. A API restringe vistoria e
-- liberaÃ§Ã£o ao professor da turma e exige resposta para todos os itens ativos.
-- RN01: resultado Ã© consolidado pela API conforme respostas e criticidade.
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

-- TABELA: chamados_manutencao
-- RN01/RF05: falha em item crÃ­tico gera chamado urgente e bloqueio do ativo;
-- falha nÃ£o crÃ­tica gera chamado preventivo e mantÃ©m o uso liberado. A API
-- decide tipo/severidade/status pelas respostas e evita duplicidade por inspeÃ§Ã£o.
-- RF07: inspecao_id NULL permite chamado aberto manualmente.
-- RF08/RF16: datas/status apoiam reparo e notificaÃ§Ã£o aos responsÃ¡veis.
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
    INDEX idx_chamado_equipamento_status (equipamento_id, status),
    INDEX idx_chamados_professor_status_aberto (solicitante_id, status, aberto_em)
) ENGINE=InnoDB;

-- TABELA: historico_manutencao
-- RF08: aÃ§Ãµes de reparo, tÃ©cnico, peÃ§as substituÃ­das, custo e data; registros
-- alimentam tambÃ©m o cÃ¡lculo de MTTR do RF14.
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

-- TABELA: pre_matriculas_alunos
-- RF10/regra de matrÃ­cula: guarda os dados de quem gerou matrÃ­cula antes de criar a conta.
-- A matrÃ­cula sÃ³ vira usuÃ¡rio quando o aluno define a senha (POST /api/alunos/cadastro).
CREATE TABLE pre_matriculas_alunos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    matricula VARCHAR(50) NOT NULL UNIQUE,
    utilizada BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Estrutura consolidada da antiga migration 20261111_ordens_servico.sql.
-- TABELA: ordens_servico
-- Vinculada 1:1 a um chamado de manutenÃ§Ã£o.
CREATE TABLE ordens_servico (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    chamado_id BIGINT UNSIGNED NOT NULL,
    numero VARCHAR(20) NOT NULL UNIQUE,
    emitida_por BIGINT UNSIGNED NOT NULL,
    status ENUM('EMITIDA', 'EM_EXECUCAO', 'FINALIZADA', 'CANCELADA') NOT NULL DEFAULT 'EMITIDA',
    emitida_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finalizada_em DATETIME,
    UNIQUE (chamado_id),
    FOREIGN KEY (chamado_id) REFERENCES chamados_manutencao(id),
    FOREIGN KEY (emitida_por) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- Cadastro prévio de professores e técnicos; usado pela API /api/pre-cadastros.
CREATE TABLE pre_cadastros_staff (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    perfil ENUM('PROFESSOR', 'TECNICO') NOT NULL,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    utilizada BOOLEAN NOT NULL DEFAULT FALSE,
    tentativas TINYINT UNSIGNED NOT NULL DEFAULT 0,
    expira_em DATETIME NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE tokens_reset_senha (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT UNSIGNED NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expira_em DATETIME NOT NULL,
    usado_em DATETIME NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;
