-- Dados historicos adicionais para exercitar os relatorios do Tenken.
-- Pre-requisitos: database/init/02-schema.sql e
-- database/seed/20261108_1020_seed_completa_laboratorio.sql.
-- Execute em desenvolvimento. As datas sao relativas ao dia da execucao,
-- cobrindo aproximadamente os ultimos dois anos.
-- Reexecucao segura: tokens, chamados e OS usam identificadores proprios.

USE tenken_db;
SET NAMES utf8mb4;
SET @seed_data_base = CURDATE();

CREATE TEMPORARY TABLE tmp_tenken_agendamentos AS
WITH RECURSIVE sequencia (n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM sequencia WHERE n < 120
),
equipamentos_ordenados AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY codigo_patrimonio) AS posicao
  FROM equipamentos
  WHERE codigo_patrimonio IN (
    'TEN-LAB-BAN-014', 'TEN-LAB-BAN-021', 'TEN-LAB-ROB-006',
    'TEN-LAB-ROB-011', 'TEN-LAB-BAN-033'
  )
),
alunos_ordenados AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY matricula) AS posicao
  FROM usuarios
  WHERE email IN (
    'aluno1.seed@tenken.local', 'aluno2.seed@tenken.local',
    'aluno3.seed@tenken.local'
  )
),
turma_seed AS (
  SELECT MIN(tp.id) AS id
  FROM turmas_projetos tp
  JOIN usuarios u ON u.id = tp.professor_id
  WHERE u.email = 'prof.seed@tenken.local'
)
SELECT
  s.n,
  (CONCAT('TNK-H', LPAD(s.n, 4, '0')) COLLATE utf8mb4_unicode_ci) AS token_acesso,
  e.id AS equipamento_id,
  a.id AS aluno_id,
  ts.id AS turma_id,
  TIMESTAMP(
    DATE_SUB(@seed_data_base, INTERVAL (720 - ((s.n - 1) * 6)) DAY),
    MAKETIME(8 + MOD(s.n * 3, 9), IF(MOD(s.n, 2) = 0, 30, 0), 0)
  ) AS inicio,
  TIMESTAMP(
    DATE_SUB(@seed_data_base, INTERVAL (720 - ((s.n - 1) * 6)) DAY),
    MAKETIME(10 + MOD(s.n * 3, 9), IF(MOD(s.n, 2) = 0, 30, 0), 0)
  ) AS fim
FROM sequencia s
JOIN equipamentos_ordenados e ON e.posicao = MOD(s.n - 1, 5) + 1
JOIN alunos_ordenados a ON a.posicao = MOD(s.n - 1, 3) + 1
CROSS JOIN turma_seed ts;

START TRANSACTION;

-- 120 aulas em cinco equipamentos, com horarios alternados e datas
-- espalhadas por dois anos. Doze registros cancelados ajudam a validar
-- que os relatorios excluem reservas canceladas do ranking de uso.
INSERT INTO agendamentos
  (responsavel_id, equipamento_id, turma_id, atividade, inicio, fim,
   token_acesso, status, criado_em)
SELECT
  prof.id,
  s.equipamento_id,
  s.turma_id,
  CASE
    WHEN MOD(s.n, 5) = 0 THEN 'Pratica de comandos eletricos'
    WHEN MOD(s.n, 5) = 1 THEN 'Programacao de CLP e sensores'
    WHEN MOD(s.n, 5) = 2 THEN 'Integracao de celula robotica'
    WHEN MOD(s.n, 5) = 3 THEN 'Diagnostico de sistemas automatizados'
    ELSE 'Projeto aplicado de instrumentacao'
  END,
  s.inicio,
  s.fim,
  s.token_acesso,
  CASE WHEN MOD(s.n, 10) = 0 THEN 'CANCELADO' ELSE 'CONCLUIDO' END,
  DATE_SUB(s.inicio, INTERVAL (3 + MOD(s.n, 18)) DAY)
FROM tmp_tenken_agendamentos s
JOIN usuarios prof ON prof.email = 'prof.seed@tenken.local'
WHERE s.turma_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM agendamentos existente
    WHERE existente.token_acesso = s.token_acesso
  );

-- Check-ins aprovados para aulas realizadas.
INSERT INTO checkins (agendamento_id, aluno_id, realizado_em, aprovado_em)
SELECT ag.id, s.aluno_id,
       DATE_SUB(s.inicio, INTERVAL (5 + MOD(s.n, 16)) MINUTE),
       DATE_SUB(s.inicio, INTERVAL (2 + MOD(s.n, 5)) MINUTE)
FROM tmp_tenken_agendamentos s
JOIN agendamentos ag ON ag.token_acesso = s.token_acesso
WHERE ag.status = 'CONCLUIDO'
  AND NOT EXISTS (
    SELECT 1 FROM checkins c
    WHERE c.agendamento_id = ag.id AND c.aluno_id = s.aluno_id
  );

-- Uma inspecao pre-uso para cada aula. Uma em cada quatro registra ressalva,
-- e as associadas a chamados ficam reprovadas para manter o historico coerente.
INSERT INTO inspecoes
  (agendamento_id, modelo_id, professor_id, etapa, resultado, observacoes, realizada_em)
SELECT ag.id,
       cm.id,
       prof.id,
       'PRE_USO',
       CASE
         WHEN MOD(s.n, 3) = 0 THEN 'REPROVADO'
         WHEN MOD(s.n, 4) = 0 THEN 'APROVADO_COM_RESSALVAS'
         ELSE 'APROVADO'
       END,
       CASE
         WHEN MOD(s.n, 3) = 0 THEN 'Falha identificada na verificacao preventiva; equipamento encaminhado para avaliacao tecnica.'
         WHEN MOD(s.n, 4) = 0 THEN 'Pequena irregularidade registrada; equipamento liberado apos orientacao.'
         ELSE 'Itens de seguranca e funcionamento conferidos antes da atividade.'
       END,
       DATE_SUB(s.inicio, INTERVAL (10 + MOD(s.n, 20)) MINUTE)
FROM tmp_tenken_agendamentos s
JOIN agendamentos ag ON ag.token_acesso = s.token_acesso
JOIN usuarios prof ON prof.email = 'prof.seed@tenken.local'
JOIN equipamentos eq ON eq.id = s.equipamento_id
JOIN checklist_modelos cm
  ON cm.tipo_equipamento = eq.tipo
 AND cm.etapa = 'PRE_USO'
 AND cm.ativo = TRUE
WHERE ag.status = 'CONCLUIDO'
  AND NOT EXISTS (
    SELECT 1 FROM inspecoes i
    WHERE i.agendamento_id = ag.id AND i.etapa = 'PRE_USO'
  );

-- 40 chamados distribuídos pelo período: 28 concluídos, com tempos de reparo
-- variados para o MTTR, e 12 ainda em andamento para os painéis operacionais.
INSERT INTO chamados_manutencao
  (equipamento_id, inspecao_id, solicitante_id, tecnico_id, titulo, descricao,
   tipo, severidade, status, aberto_em, concluido_em)
SELECT
  ag.equipamento_id,
  insp.id,
  prof.id,
  tec.id,
  CONCAT('Manutencao historica ', s.token_acesso),
  CASE
    WHEN MOD(s.n, 4) = 0 THEN 'Revisao de conexoes e reaperto dos bornes identificados durante a inspecao.'
    WHEN MOD(s.n, 4) = 1 THEN 'Substituicao de componente com desgaste e validacao do funcionamento em bancada.'
    WHEN MOD(s.n, 4) = 2 THEN 'Ajuste de sensor com leitura instavel, seguido de teste operacional.'
    ELSE 'Correcao de falha intermitente e verificacao dos dispositivos de seguranca.'
  END,
  CASE WHEN MOD(s.n, 5) = 0 THEN 'PREVENTIVO' ELSE 'CORRETIVO' END,
  CASE
    WHEN MOD(s.n, 4) = 0 THEN 'BAIXA'
    WHEN MOD(s.n, 4) = 1 THEN 'MEDIA'
    WHEN MOD(s.n, 4) = 2 THEN 'ALTA'
    ELSE 'CRITICA'
  END,
  CASE
    WHEN s.n <= 84 THEN 'CONCLUIDO'
    WHEN MOD(s.n, 3) = 0 THEN 'AGUARDANDO_PECAS'
    WHEN MOD(s.n, 2) = 0 THEN 'EM_ATENDIMENTO'
    ELSE 'ABERTO'
  END,
  DATE_ADD(s.inicio, INTERVAL (1 + MOD(s.n, 7)) HOUR),
  CASE WHEN s.n <= 84
    THEN DATE_ADD(
      DATE_ADD(s.inicio, INTERVAL (1 + MOD(s.n, 7)) HOUR),
      INTERVAL (4 + MOD(s.n * 7, 44)) HOUR
    )
    ELSE NULL
  END
FROM tmp_tenken_agendamentos s
JOIN agendamentos ag ON ag.token_acesso = s.token_acesso
JOIN inspecoes insp ON insp.agendamento_id = ag.id AND insp.etapa = 'PRE_USO'
JOIN usuarios prof ON prof.email = 'prof.seed@tenken.local'
JOIN usuarios tec ON tec.email = 'tecnico.seed@tenken.local'
WHERE MOD(s.n, 3) = 0
  AND ag.status = 'CONCLUIDO'
  AND NOT EXISTS (
    SELECT 1 FROM chamados_manutencao c
    WHERE c.titulo = CONCAT('Manutencao historica ', s.token_acesso)
  );

INSERT INTO historico_manutencao
  (chamado_id, tecnico_id, descricao, pecas_trocadas, custo, registrado_em)
SELECT c.id,
       tec.id,
       CASE WHEN c.status = 'CONCLUIDO'
         THEN 'Servico concluido; equipamento testado e devolvido para uso.'
         ELSE 'Chamado avaliado; atendimento segue registrado para acompanhamento.'
       END,
       CASE WHEN MOD(s.n, 2) = 0 THEN 'Componente e terminais de reposicao' ELSE NULL END,
       CASE WHEN c.status = 'CONCLUIDO' THEN 35.00 + MOD(s.n * 13, 420) ELSE 0.00 END,
       CASE WHEN c.status = 'CONCLUIDO'
         THEN DATE_SUB(c.concluido_em, INTERVAL 1 HOUR)
         ELSE DATE_ADD(c.aberto_em, INTERVAL 2 HOUR)
       END
FROM tmp_tenken_agendamentos s
JOIN chamados_manutencao c
  ON c.titulo = CONCAT('Manutencao historica ', s.token_acesso)
JOIN usuarios tec ON tec.email = 'tecnico.seed@tenken.local'
WHERE MOD(s.n, 3) = 0
  AND NOT EXISTS (
    SELECT 1 FROM historico_manutencao h WHERE h.chamado_id = c.id
  );

INSERT INTO ordens_servico
  (chamado_id, numero, emitida_por, status, emitida_em, finalizada_em)
SELECT c.id,
       CONCAT('OS-H', LPAD(s.n, 4, '0')),
       adm.id,
       CASE WHEN c.status = 'CONCLUIDO' THEN 'FINALIZADA'
            WHEN c.status = 'ABERTO' THEN 'EMITIDA'
            ELSE 'EM_EXECUCAO'
       END,
       DATE_ADD(c.aberto_em, INTERVAL 30 MINUTE),
       c.concluido_em
FROM tmp_tenken_agendamentos s
JOIN chamados_manutencao c
  ON c.titulo = CONCAT('Manutencao historica ', s.token_acesso)
JOIN usuarios adm ON adm.email = 'admin.seed@tenken.local'
WHERE MOD(s.n, 3) = 0
  AND NOT EXISTS (
    SELECT 1 FROM ordens_servico os WHERE os.chamado_id = c.id
  );

COMMIT;
DROP TEMPORARY TABLE tmp_tenken_agendamentos;

-- Resumo dos registros deste conjunto para validar a carga.
SELECT 'agendamentos historicos' AS entidade, COUNT(*) AS total
FROM agendamentos WHERE token_acesso LIKE 'TNK-H%'
UNION ALL
SELECT 'chamados historicos', COUNT(*)
FROM chamados_manutencao WHERE titulo LIKE 'Manutencao historica TNK-H%'
UNION ALL
SELECT 'ordens de servico historicas', COUNT(*)
FROM ordens_servico WHERE numero LIKE 'OS-H%';
