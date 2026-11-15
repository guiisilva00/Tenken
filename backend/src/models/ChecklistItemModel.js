import { pool } from "../config/Database.js";

export async function listarPorModelo(modeloId) {
  const [linhas] = await pool.query(
    "SELECT * FROM checklist_itens WHERE modelo_id = ? ORDER BY id",
    [modeloId],
  );
  return linhas;
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query(
    "SELECT * FROM checklist_itens WHERE id = ?",
    [id],
  );
  return linhas[0] || null;
}

export async function criar({ modelo_id, descricao, critico }) {
  const [resultado] = await pool.query(
    "INSERT INTO checklist_itens (modelo_id, descricao, critico) VALUES (?, ?, ?)",
    [modelo_id, descricao, critico],
  );
  return { id: resultado.insertId, modelo_id, descricao, critico };
}

export async function atualizar(id, { descricao, critico }) {
  const [resultado] = await pool.query(
    "UPDATE checklist_itens SET descricao = ?, critico = ? WHERE id = ?",
    [descricao, critico, id],
  );
  return resultado.affectedRows > 0;
}

export async function excluir(id) {
  const [resultado] = await pool.query(
    "DELETE FROM checklist_itens WHERE id = ?",
    [id],
  );
  return resultado.affectedRows > 0;
}
