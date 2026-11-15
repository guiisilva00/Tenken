import { pool } from "../config/Database.js";

const MAX_TENTATIVAS = 5;

export async function listar() {
  const [linhas] = await pool.query(
    "SELECT id, nome, email, perfil, codigo, utilizada, tentativas, expira_em, criado_em FROM pre_cadastros_staff ORDER BY id DESC",
  );
  return linhas;
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query(
    "SELECT id, nome, email, perfil, codigo, utilizada, tentativas, expira_em, criado_em FROM pre_cadastros_staff WHERE id = ?",
    [id],
  );
  return linhas[0] || null;
}

export async function buscarPorCodigo(codigo) {
  const [linhas] = await pool.query(
    "SELECT * FROM pre_cadastros_staff WHERE codigo = ?",
    [codigo],
  );
  return linhas[0] || null;
}

export async function criar({ nome, email, perfil, codigo, expiraEm }) {
  const [resultado] = await pool.query(
    "INSERT INTO pre_cadastros_staff (nome, email, perfil, codigo, expira_em) VALUES (?, ?, ?, ?, ?)",
    [nome, email, perfil, codigo, expiraEm],
  );
  return {
    id: resultado.insertId,
    nome,
    email,
    perfil,
    codigo,
    utilizada: false,
    tentativas: 0,
    expira_em: expiraEm,
  };
}

export async function revogar(id) {
  const [resultado] = await pool.query(
    "DELETE FROM pre_cadastros_staff WHERE id = ? AND utilizada = FALSE",
    [id],
  );
  return resultado.affectedRows > 0;
}

export async function ativar(email, codigo, senhaHash) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [linhas] = await connection.query(
      "SELECT id, nome, email, perfil, codigo, utilizada, tentativas, expira_em FROM pre_cadastros_staff WHERE email = ? FOR UPDATE",
      [email],
    );
    const preCadastro = linhas[0];

    if (!preCadastro) {
      await connection.rollback();
      return { status: "nao_encontrado" };
    }
    if (preCadastro.utilizada) {
      await connection.rollback();
      return { status: "ja_utilizado" };
    }
    if (preCadastro.tentativas >= MAX_TENTATIVAS) {
      await connection.rollback();
      return { status: "bloqueado" };
    }
    if (new Date(preCadastro.expira_em).getTime() < Date.now()) {
      await connection.rollback();
      return { status: "expirado" };
    }
    if (preCadastro.codigo !== codigo) {
      await connection.query(
        "UPDATE pre_cadastros_staff SET tentativas = tentativas + 1 WHERE id = ?",
        [preCadastro.id],
      );
      await connection.commit();
      return { status: "codigo_invalido" };
    }

    const [resultadoInsert] = await connection.query(
      "INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo) VALUES (?, ?, ?, ?, TRUE)",
      [preCadastro.nome, preCadastro.email, senhaHash, preCadastro.perfil],
    );

    await connection.query(
      "UPDATE pre_cadastros_staff SET utilizada = TRUE WHERE id = ?",
      [preCadastro.id],
    );

    await connection.commit();

    return {
      status: "ok",
      usuario: {
        id: resultadoInsert.insertId,
        nome: preCadastro.nome,
        email: preCadastro.email,
        perfil: preCadastro.perfil,
      },
    };
  } catch (erro) {
    await connection.rollback();
    throw erro;
  } finally {
    connection.release();
  }
}
