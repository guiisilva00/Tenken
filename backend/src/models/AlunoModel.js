import { pool } from "../config/Database.js";

export async function buscarAgendamentoAtivo(turmaId) {
  const [linhas] = await pool.execute(
    `SELECT id FROM agendamentos
     WHERE turma_id = ?
       AND inicio <= NOW() AND fim >= NOW()
       AND status IN ('CONFIRMADO', 'EM_ANDAMENTO')
     ORDER BY inicio DESC
     LIMIT 1`,
    [turmaId],
  );
  return linhas[0] || null;
}

export async function pertenceATurma(turmaId, alunoId) {
  const [linhas] = await pool.execute(
    "SELECT 1 FROM turma_alunos WHERE turma_id = ? AND aluno_id = ? LIMIT 1",
    [turmaId, alunoId],
  );
  return linhas.length > 0;
}

export async function criarCheckin(agendamentoId, alunoId) {
  await pool.execute(
    "INSERT INTO checkins (agendamento_id, aluno_id, aprovado_em) VALUES (?, ?, NULL)",
    [agendamentoId, alunoId],
  );
}

export async function criarPreMatricula({
  nome,
  email,
  cpf,
  telefone,
  matricula,
}) {
  await pool.execute(
    `INSERT INTO pre_matriculas_alunos
      (nome, email, cpf, telefone, matricula)
     VALUES (?, ?, ?, ?, ?)`,
    [nome, email, cpf, telefone, matricula],
  );
}

export async function cadastrar({ matricula, senhaHash }) {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    const [linhas] = await conexao.execute(
      `SELECT id, nome, email, utilizada
       FROM pre_matriculas_alunos
       WHERE matricula = ?
       FOR UPDATE`,
      [matricula],
    );
    const preMatricula = linhas[0];
    if (!preMatricula) {
      const erro = new Error("Matrícula não encontrada.");
      erro.status = 404;
      throw erro;
    }
    if (preMatricula.utilizada) {
      const erro = new Error("Esta matrícula já foi utilizada.");
      erro.status = 409;
      throw erro;
    }

    const [resultado] = await conexao.execute(
      `INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo, matricula)
       VALUES (?, ?, ?, 'ALUNO', TRUE, ?)`,
      [preMatricula.nome, preMatricula.email, senhaHash, matricula],
    );
    await conexao.execute(
      "UPDATE pre_matriculas_alunos SET utilizada = true WHERE id = ?",
      [preMatricula.id],
    );
    await conexao.commit();
    return { id: resultado.insertId, nome: preMatricula.nome, matricula };
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}
