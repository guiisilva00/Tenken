import { pool } from "../config/Database.js";

export async function listar() {
  const [linhas] = await pool.query(
    "SELECT id, nome, email, perfil, codigo, utilizada, criado_em FROM pre_cadastros_staff ORDER BY id DESC",
  );
  return linhas;
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query(
    "SELECT id, nome, email, perfil, codigo, utilizada, criado_em FROM pre_cadastros_staff WHERE id = ?",
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

export async function criar({ nome, email, perfil, codigo }) {
  const [resultado] = await pool.query(
    "INSERT INTO pre_cadastros_staff (nome, email, perfil, codigo) VALUES (?, ?, ?, ?)",
    [nome, email, perfil, codigo],
  );
  return {
    id: resultado.insertId,
    nome,
    email,
    perfil,
    codigo,
    utilizada: false,
  };
}

export async function revogar(id) {
  const [resultado] = await pool.query(
    "DELETE FROM pre_cadastros_staff WHERE id = ? AND utilizada = FALSE",
    [id],
  );
  return resultado.affectedRows > 0;
}

export async function ativar(codigo, senhaHash) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [linhas] = await connection.query(
      "SELECT id, nome, email, perfil, utilizada FROM pre_cadastros_staff WHERE codigo = ? FOR UPDATE",
      [codigo],
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
