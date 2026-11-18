import { pool } from "../config/Database.js";

export async function listarPorProfessor(professorId) {
  const [linhas] = await pool.query(
    `SELECT t.id, t.nome, COUNT(ta.aluno_id) AS alunos
     FROM turmas_projetos t LEFT JOIN turma_alunos ta ON ta.turma_id = t.id
     WHERE t.professor_id = ? GROUP BY t.id, t.nome ORDER BY t.nome`,
    [professorId],
  );
  return linhas;
}

export async function listarTodas() {
  const [linhas] = await pool.query(
    `SELECT t.id, t.nome, t.professor_id, u.nome AS professor_nome,
            COUNT(DISTINCT ta.aluno_id) AS alunos, t.criado_em
     FROM turmas_projetos t
     JOIN usuarios u ON u.id = t.professor_id
     LEFT JOIN turma_alunos ta ON ta.turma_id = t.id
     GROUP BY t.id, t.nome, t.professor_id, u.nome, t.criado_em
     ORDER BY t.nome`,
  );
  return linhas;
}

export async function criar({ nome, professor_id }) {
  const [resultado] = await pool.query(
    "INSERT INTO turmas_projetos (nome, professor_id) VALUES (?, ?)",
    [nome, professor_id],
  );
  return resultado.insertId;
}

export async function atualizar(id, { nome, professor_id }) {
  const [resultado] = await pool.query(
    "UPDATE turmas_projetos SET nome = ?, professor_id = ? WHERE id = ?",
    [nome, professor_id, id],
  );
  return resultado.affectedRows > 0;
}

export async function excluir(id) {
  const [[refs]] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM turma_alunos WHERE turma_id = ?) +
       (SELECT COUNT(*) FROM agendamentos WHERE turma_id = ?) AS total`,
    [id, id],
  );
  if (Number(refs.total) > 0) {
    const erro = new Error("A turma possui alunos ou agendamentos vinculados e não pode ser excluída.");
    erro.status = 409;
    throw erro;
  }
  const [resultado] = await pool.query("DELETE FROM turmas_projetos WHERE id = ?", [id]);
  return resultado.affectedRows > 0;
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query(
    "SELECT id, nome, professor_id, token_acesso FROM turmas_projetos WHERE id = ?",
    [id],
  );
  return linhas[0] || null;
}

export async function buscarTurmaPorToken(token) {
  const [linhas] = await pool.query(
    "SELECT id, nome, professor_id, token_acesso FROM turmas_projetos WHERE token_acesso = ?",
    [token],
  );
  return linhas[0] || null;
}

export async function definirTokenTurma(turmaId, token) {
  const [resultado] = await pool.query(
    "UPDATE turmas_projetos SET token_acesso = ? WHERE id = ? AND token_acesso IS NULL",
    [token, turmaId],
  );
  return resultado.affectedRows > 0;
}
