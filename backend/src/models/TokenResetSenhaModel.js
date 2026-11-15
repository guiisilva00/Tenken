import { pool } from "../config/Database.js";

export async function invalidarAnteriores(usuarioId) {
  await pool.query(
    "UPDATE tokens_reset_senha SET usado_em = NOW() WHERE usuario_id = ? AND usado_em IS NULL",
    [usuarioId],
  );
}

export async function criar({ usuarioId, tokenHash, expiraEm }) {
  const [resultado] = await pool.query(
    "INSERT INTO tokens_reset_senha (usuario_id, token_hash, expira_em) VALUES (?, ?, ?)",
    [usuarioId, tokenHash, expiraEm],
  );
  return resultado.insertId;
}

export async function redefinirSenha(tokenHash, senhaHash) {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    const [linhas] = await conexao.query(
      `SELECT id, usuario_id, expira_em, usado_em
       FROM tokens_reset_senha WHERE token_hash = ? FOR UPDATE`,
      [tokenHash],
    );
    const token = linhas[0];
    if (!token || token.usado_em || new Date(token.expira_em) <= new Date()) {
      await conexao.rollback();
      return { status: "token_invalido" };
    }
    await conexao.query("UPDATE usuarios SET senha_hash = ? WHERE id = ?", [senhaHash, token.usuario_id]);
    await conexao.query(
      "UPDATE tokens_reset_senha SET usado_em = NOW() WHERE usuario_id = ? AND usado_em IS NULL",
      [token.usuario_id],
    );
    await conexao.commit();
    return { status: "ok" };
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}
