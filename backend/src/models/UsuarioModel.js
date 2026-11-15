import { pool } from "../config/Database.js";

const PERFIS_VALIDOS = ["ALUNO", "PROFESSOR", "TECNICO", "ADMIN"];

export async function listar({ limite, offset, perfil, ativo }) {
  const condicoes = [];
  const valores = [];

  if (perfil !== undefined) {
    condicoes.push("perfil = ?");
    valores.push(perfil);
  }
  if (ativo !== undefined) {
    condicoes.push("ativo = ?");
    valores.push(ativo);
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";

  const [linhas] = await pool.query(
    `SELECT id, nome, email, perfil, matricula, ativo, criado_em
     FROM usuarios ${where}
     ORDER BY id LIMIT ? OFFSET ?`,
    [...valores, limite, offset],
  );
  const ids = linhas.map(({ id }) => id);
  const turmas = ids.length ? await listarTurmas(ids) : [];
  const turmasPorAluno = new Map(ids.map((id) => [String(id), []]));
  turmas.forEach(({ aluno_id, turma_id, turma_nome }) => {
    turmasPorAluno
      .get(String(aluno_id))
      ?.push({ id: turma_id, nome: turma_nome });
  });
  linhas.forEach((usuario) => {
    usuario.turmas = turmasPorAluno.get(String(usuario.id)) ?? [];
  });
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM usuarios ${where}`,
    valores,
  );

  return { usuarios: linhas, total: Number(total) };
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query(
    "SELECT id, nome, email, perfil, matricula, ativo, criado_em FROM usuarios WHERE id = ?",
    [id],
  );
  return linhas[0] || null;
}

export async function buscarAtivoPorId(id) {
  const [linhas] = await pool.query(
    "SELECT ativo FROM usuarios WHERE id = ?",
    [id],
  );
  return linhas[0] || null;
}

export async function buscarPorMatricula(matricula) {
  const [linhas] = await pool.query(
    "SELECT id, nome, email, perfil, matricula, senha_hash, ativo FROM usuarios WHERE matricula = ?",
    [matricula],
  );
  return linhas[0] || null;
}

export async function buscarPorEmail(email) {
  const [linhas] = await pool.query(
    "SELECT id FROM usuarios WHERE email = ? LIMIT 1",
    [email],
  );
  return linhas[0] || null;
}

export async function atualizarSenha(id, senhaHash) {
  const [resultado] = await pool.query(
    "UPDATE usuarios SET senha_hash = ? WHERE id = ?",
    [senhaHash, id],
  );
  return resultado.affectedRows > 0;
}

export async function atualizarPerfil(id, perfil) {
  const [resultado] = await pool.query(
    "UPDATE usuarios SET perfil = ? WHERE id = ?",
    [perfil, id],
  );
  return resultado.affectedRows > 0;
}

export async function atualizarAtivo(id, ativo) {
  const [resultado] = await pool.query(
    "UPDATE usuarios SET ativo = ? WHERE id = ?",
    [ativo, id],
  );
  return resultado.affectedRows > 0;
}

async function listarTurmas(alunoIds) {
  const [linhas] = await pool.query(
    `SELECT ta.aluno_id, t.id AS turma_id, t.nome AS turma_nome
     FROM turma_alunos ta JOIN turmas_projetos t ON t.id = ta.turma_id
     WHERE ta.aluno_id IN (?) ORDER BY t.nome`,
    [alunoIds],
  );
  return linhas;
}

export async function listarTurmasDoAluno(alunoId) {
  const turmas = await listarTurmas([alunoId]);
  return turmas.map(({ turma_id: id, turma_nome: nome }) => ({ id, nome }));
}

export async function atualizarDados(id, { nome, email, matricula, turmaIds }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[aluno]] = await connection.query(
      "SELECT id, perfil FROM usuarios WHERE id = ? FOR UPDATE",
      [id],
    );
    if (!aluno || aluno.perfil !== "ALUNO") {
      const erro = new Error("Aluno não encontrado.");
      erro.status = 404;
      throw erro;
    }

    if (turmaIds.length) {
      const [[{ total }]] = await connection.query(
        "SELECT COUNT(*) AS total FROM turmas_projetos WHERE id IN (?)",
        [turmaIds],
      );
      if (Number(total) !== turmaIds.length) {
        const erro = new TypeError("Uma ou mais turmas não foram encontradas.");
        throw erro;
      }
    }

    await connection.query(
      "UPDATE usuarios SET nome = ?, email = ?, matricula = ? WHERE id = ?",
      [nome, email, matricula, id],
    );
    await connection.query("DELETE FROM turma_alunos WHERE aluno_id = ?", [id]);
    if (turmaIds.length) {
      await connection.query(
        "INSERT INTO turma_alunos (aluno_id, turma_id) VALUES ?",
        [turmaIds.map((turmaId) => [id, turmaId])],
      );
    }
    await connection.commit();
  } catch (erro) {
    await connection.rollback();
    throw erro;
  } finally {
    connection.release();
  }
}

export { PERFIS_VALIDOS };
