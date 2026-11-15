import { pool } from "../config/Database.js";

export async function buscarMaisRecentePorAluno(alunoId) {
  const [linhas] = await pool.query(
    `SELECT c.agendamento_id, c.aluno_id, c.aprovado_em,
            t.id AS turma_id, t.nome AS turma_nome,
            e.id AS equipamento_id, e.nome AS equipamento_nome,
            e.codigo_patrimonio, e.localizacao
     FROM checkins c
     JOIN agendamentos a ON a.id = c.agendamento_id
     JOIN turmas_projetos t ON t.id = a.turma_id
     JOIN equipamentos e ON e.id = a.equipamento_id
     WHERE c.aluno_id = ?
     ORDER BY c.realizado_em DESC
     LIMIT 1`,
    [alunoId],
  );
  return linhas[0] || null;
}

export async function listarPendentesPorProfessor(professorId) {
  const [linhas] = await pool.query(
    `SELECT c.agendamento_id, c.aluno_id, c.realizado_em AS criado_em,
            u.nome AS aluno_nome, u.matricula AS aluno_matricula,
            t.id AS turma_id, t.nome AS turma_nome,
            e.id AS equipamento_id, e.nome AS equipamento_nome
     FROM checkins c
     JOIN agendamentos a ON a.id = c.agendamento_id
     JOIN turmas_projetos t ON t.id = a.turma_id
     JOIN equipamentos e ON e.id = a.equipamento_id
     JOIN usuarios u ON u.id = c.aluno_id
     WHERE c.aprovado_em IS NULL AND t.professor_id = ?
     ORDER BY c.realizado_em DESC`,
    [professorId],
  );
  return linhas;
}

export async function buscarPorIds(agendamentoId, alunoId) {
  const [linhas] = await pool.query(
    `SELECT c.agendamento_id, c.aluno_id, c.aprovado_em, c.realizado_em,
            t.professor_id
     FROM checkins c
     JOIN agendamentos a ON a.id = c.agendamento_id
     JOIN turmas_projetos t ON t.id = a.turma_id
     WHERE c.agendamento_id = ? AND c.aluno_id = ?`,
    [agendamentoId, alunoId],
  );
  return linhas[0] || null;
}

export async function aprovar(agendamentoId, alunoId) {
  const [resultado] = await pool.query(
    "UPDATE checkins SET aprovado_em = NOW() WHERE agendamento_id = ? AND aluno_id = ? AND aprovado_em IS NULL",
    [agendamentoId, alunoId],
  );
  return resultado.affectedRows > 0;
}
