import { pool } from "../config/Database.js";

export async function buscarMaisRecentePorAluno(alunoId) {
  const [linhas] = await pool.query(
    `SELECT c.agendamento_id, c.aluno_id, c.aprovado_em,
            a.atividade, a.inicio, a.fim, a.token_acesso,
            p.nome AS professor_nome, NOW() AS agora,
            t.id AS turma_id, t.nome AS turma_nome,
            e.id AS equipamento_id, e.nome AS equipamento_nome,
            e.codigo_patrimonio, e.localizacao, e.tipo, e.status AS equipamento_status
     FROM checkins c
     JOIN agendamentos a ON a.id = c.agendamento_id
     JOIN turmas_projetos t ON t.id = a.turma_id
     JOIN equipamentos e ON e.id = a.equipamento_id
     JOIN usuarios p ON p.id = t.professor_id
     WHERE c.aluno_id = ?
       AND EXISTS (SELECT 1 FROM turma_alunos ta WHERE ta.turma_id = a.turma_id AND ta.aluno_id = c.aluno_id)
       AND a.inicio <= NOW() AND a.fim >= NOW()
       AND a.status IN ('CONFIRMADO', 'EM_ANDAMENTO')
     ORDER BY c.realizado_em DESC, c.agendamento_id DESC
     LIMIT 1`,
    [alunoId],
  );
  return linhas[0] || null;
}

export async function listarPendentesPorProfessor(professorId) {
  const [linhas] = await pool.query(
    `SELECT c.agendamento_id, c.aluno_id, c.realizado_em AS criado_em,
            a.atividade, a.inicio, a.fim, a.token_acesso,
            u.nome AS aluno_nome, u.matricula AS aluno_matricula,
            t.id AS turma_id, t.nome AS turma_nome,
            e.id AS equipamento_id, e.nome AS equipamento_nome
     FROM checkins c
     JOIN agendamentos a ON a.id = c.agendamento_id
     JOIN turmas_projetos t ON t.id = a.turma_id
     JOIN equipamentos e ON e.id = a.equipamento_id
     JOIN usuarios u ON u.id = c.aluno_id
     WHERE c.aprovado_em IS NULL AND t.professor_id = ?
       AND EXISTS (SELECT 1 FROM turma_alunos ta WHERE ta.turma_id = a.turma_id AND ta.aluno_id = c.aluno_id)
       AND a.inicio <= NOW() AND a.fim >= NOW()
       AND a.status IN ('CONFIRMADO', 'EM_ANDAMENTO')
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

export async function aprovar(agendamentoId, alunoId, professorId) {
  const [resultado] = await pool.query(
    `UPDATE checkins c
     JOIN agendamentos a ON a.id = c.agendamento_id
     JOIN turmas_projetos t ON t.id = a.turma_id
     JOIN turma_alunos ta ON ta.turma_id = a.turma_id AND ta.aluno_id = c.aluno_id
     SET c.aprovado_em = NOW()
     WHERE c.agendamento_id = ? AND c.aluno_id = ? AND c.aprovado_em IS NULL
       AND t.professor_id = ?
       AND a.inicio <= NOW() AND a.fim >= NOW()
       AND a.status IN ('CONFIRMADO', 'EM_ANDAMENTO')`,
    [agendamentoId, alunoId, professorId],
  );
  return resultado.affectedRows > 0;
}
