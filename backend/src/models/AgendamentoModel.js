import { pool } from "../config/Database.js";

export async function rankingUso(inicio, fim, { limite = 10, tipo } = {}) {
  const [linhas] = await pool.query(
    `SELECT a.equipamento_id, e.nome AS equipamento_nome, COUNT(*) AS total_agendamentos
     FROM agendamentos a
     LEFT JOIN equipamentos e ON e.id = a.equipamento_id
     WHERE a.status != 'CANCELADO'
       AND a.inicio >= ? AND a.fim < DATE_ADD(?, INTERVAL 1 DAY)
       AND (? IS NULL OR e.tipo = ?)
     GROUP BY a.equipamento_id, e.nome
     ORDER BY total_agendamentos DESC
     LIMIT ?`,
    [inicio, fim, tipo ?? null, tipo ?? null, limite],
  );
  return linhas;
}

export async function horasReservadasPorEquipamento(inicio, fim, tipo) {
  const [linhas] = await pool.query(
    `SELECT a.equipamento_id, e.nome AS equipamento_nome,
            SUM(TIMESTAMPDIFF(MINUTE, a.inicio, a.fim)) / 60 AS horas_reservadas
     FROM agendamentos a
     LEFT JOIN equipamentos e ON e.id = a.equipamento_id
     WHERE a.status != 'CANCELADO' AND a.inicio >= ? AND a.fim < DATE_ADD(?, INTERVAL 1 DAY)
       AND (? IS NULL OR e.tipo = ?)
     GROUP BY a.equipamento_id, e.nome`,
    [inicio, fim, tipo ?? null, tipo ?? null],
  );
  return linhas;
}

export async function listarPorProfessor(professorId) {
  const [linhas] = await pool.query(
    `SELECT a.id, a.turma_id AS turmaId, t.nome AS turma,
       a.equipamento_id AS equipamentoId, e.nome AS equipamento, e.codigo_patrimonio AS patrimonio,
       a.atividade, DATE_FORMAT(a.inicio, '%Y-%m-%d') AS data,
       DATE_FORMAT(a.inicio, '%H:%i') AS inicio, DATE_FORMAT(a.fim, '%H:%i') AS fim,
       a.status, a.token_acesso AS token, i.resultado AS preUsoResultado
     FROM agendamentos a JOIN turmas_projetos t ON t.id=a.turma_id
     JOIN equipamentos e ON e.id=a.equipamento_id
     LEFT JOIN inspecoes i ON i.agendamento_id=a.id AND i.etapa='PRE_USO'
     WHERE a.responsavel_id=? ORDER BY a.inicio DESC`,
    [professorId],
  );
  return linhas;
}

export async function buscarDetalhado(id) {
  const [linhas] = await pool.query(
    `SELECT a.id, a.turma_id AS turmaId, t.nome AS turma,
       a.equipamento_id AS equipamentoId, e.nome AS equipamento, e.codigo_patrimonio AS patrimonio,
       a.atividade, DATE_FORMAT(a.inicio, '%Y-%m-%d') AS data,
       DATE_FORMAT(a.inicio, '%H:%i') AS inicio, DATE_FORMAT(a.fim, '%H:%i') AS fim,
       a.status, a.token_acesso AS token, i.resultado AS preUsoResultado
     FROM agendamentos a JOIN turmas_projetos t ON t.id=a.turma_id
     JOIN equipamentos e ON e.id=a.equipamento_id
     LEFT JOIN inspecoes i ON i.agendamento_id=a.id AND i.etapa='PRE_USO' WHERE a.id=?`,
    [id],
  );
  return linhas[0] || null;
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query(
    "SELECT id, responsavel_id, equipamento_id, turma_id, status FROM agendamentos WHERE id=?",
    [id],
  );
  return linhas[0] || null;
}

export async function verificarConflito(equipamentoId, inicio, fim, db = pool) {
  const [linhas] = await db.query(
    "SELECT id FROM agendamentos WHERE equipamento_id=? AND status NOT IN ('CANCELADO','CONCLUIDO') AND inicio < ? AND fim > ? LIMIT 1",
    [equipamentoId, fim, inicio],
  );
  return linhas.length > 0;
}

export async function listarEquipamentosComConflito(inicio, fim, db = pool) {
  const [linhas] = await db.query(
    "SELECT DISTINCT equipamento_id FROM agendamentos WHERE status NOT IN ('CANCELADO','CONCLUIDO') AND inicio < ? AND fim > ?",
    [fim, inicio],
  );
  return linhas.map((linha) => Number(linha.equipamento_id));
}

export async function inicioJaPassou(inicio, db = pool) {
  const [[linha]] = await db.query("SELECT ? <= NOW() AS ja_passou", [inicio]);
  return Boolean(linha?.ja_passou);
}

export async function buscarPorTokenAtivo(token) {
  // Os DATETIME e o NOW() usam o fuso de Brasília configurado na conexão.
  const [linhas] = await pool.query(
    `SELECT a.id, a.turma_id, t.nome AS turma
     FROM agendamentos a
     JOIN turmas_projetos t ON t.id = a.turma_id
     WHERE a.token_acesso = ?
       AND a.fim >= NOW()
       AND a.status IN ('CONFIRMADO', 'EM_ANDAMENTO')
     LIMIT 1`,
    [token],
  );
  return linhas[0] || null;
}

export async function tokenExiste(token, db = pool) {
  const [linhas] = await db.query(
    "SELECT id FROM agendamentos WHERE token_acesso = ? LIMIT 1",
    [token],
  );
  return linhas.length > 0;
}

export async function criar({
  responsavel_id,
  equipamento_id,
  turma_id,
  atividade,
  inicio,
  fim,
  token_acesso,
}, db = pool) {
  const [resultado] = await db.query(
    `INSERT INTO agendamentos (responsavel_id,equipamento_id,turma_id,atividade,inicio,fim,token_acesso,status) VALUES (?,?,?,?,?,?,?,'CONFIRMADO')`,
    [
      responsavel_id,
      equipamento_id,
      turma_id,
      atividade,
      inicio,
      fim,
      token_acesso,
    ],
  );
  return resultado.insertId;
}

export async function atualizarStatus(id, status, db = pool) {
  const [resultado] = await db.query(
    "UPDATE agendamentos SET status=? WHERE id=?",
    [status, id],
  );
  return resultado.affectedRows > 0;
}
