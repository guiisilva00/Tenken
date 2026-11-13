import { pool } from "../config/database.js";

export async function listar({ limite, offset, tipo, localizacao, status }) {
  const filtros = [];
  const valores = [];
  for (const [campo, valor] of [["tipo", tipo], ["localizacao", localizacao], ["status", status]]) {
    if (valor) {
      filtros.push(`${campo} = ?`);
      valores.push(valor);
    }
  }
  const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";
  const [linhas] = await pool.query(
    `SELECT * FROM equipamentos ${where} ORDER BY id LIMIT ? OFFSET ?`,
    [...valores, limite, offset],
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM equipamentos ${where}`, valores);

  return { equipamentos: linhas, total: Number(total) };
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query("SELECT * FROM equipamentos WHERE id = ?", [id]);
  return linhas[0] || null;
}

export async function criar(equipamento) {
  const sql = `
    INSERT INTO equipamentos (codigo_patrimonio, nome, tipo, localizacao, status)
    VALUES (?, ?, ?, ?, ?)
  `;
  const valores = [
    equipamento.codigo_patrimonio,
    equipamento.nome,
    equipamento.tipo,
    equipamento.localizacao,
    equipamento.status,
  ];
  const [resultado] = await pool.query(sql, valores);

  return { ...equipamento, id: resultado.insertId };
}

export async function atualizar(id, equipamento) {
  const sql = `
    UPDATE equipamentos
    SET codigo_patrimonio = ?, nome = ?, tipo = ?, localizacao = ?
    WHERE id = ?
  `;
  const valores = [
    equipamento.codigo_patrimonio,
    equipamento.nome,
    equipamento.tipo,
    equipamento.localizacao,
    id,
  ];
  const [resultado] = await pool.query(sql, valores);

  return resultado.affectedRows > 0;
}

export async function atualizarStatus(id, status, db = pool) {
  const [resultado] = await db.query(
    "UPDATE equipamentos SET status = ? WHERE id = ?",
    [status, id],
  );

  return resultado.affectedRows > 0;
}

export async function inativar(id) {
  const [resultado] = await pool.query(
    "UPDATE equipamentos SET status = 'INATIVO' WHERE id = ?",
    [id],
  );

  return resultado.affectedRows > 0;
}

export async function contarPorStatus(tipo) {
  const [linhas] = await pool.query(
    `SELECT status, COUNT(*) AS total FROM equipamentos ${tipo ? "WHERE tipo = ?" : ""} GROUP BY status`,
    tipo ? [tipo] : [],
  );
  return linhas;
}

export async function contarPorTipoEStatus() {
  const [linhas] = await pool.query(
    "SELECT tipo, status, COUNT(*) AS total FROM equipamentos GROUP BY tipo, status",
  );
  return linhas;
}

export async function contarTotal() {
  const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM equipamentos");
  return Number(total);
}
