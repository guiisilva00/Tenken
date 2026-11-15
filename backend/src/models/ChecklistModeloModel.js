import { pool } from "../config/Database.js";

export async function listar() {
  const [linhas] = await pool.query(
    "SELECT * FROM checklist_modelos ORDER BY id DESC",
  );
  return linhas;
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query(
    "SELECT * FROM checklist_modelos WHERE id = ?",
    [id],
  );
  return linhas[0] || null;
}

export async function buscarPorTipoEtapa(tipoEquipamento, etapa) {
  const [linhas] = await pool.query(
    "SELECT * FROM checklist_modelos WHERE tipo_equipamento = ? AND etapa = ? AND ativo = 1 ORDER BY id DESC LIMIT 1",
    [tipoEquipamento, etapa],
  );
  return linhas[0] || null;
}

export async function existeAtivoPorTipoEtapa(
  tipoEquipamento,
  etapa,
  excluirId = null,
) {
  const condicaoId = excluirId === null ? "" : " AND id <> ?";
  const valores =
    excluirId === null
      ? [tipoEquipamento, etapa]
      : [tipoEquipamento, etapa, excluirId];
  const [linhas] = await pool.query(
    `SELECT id FROM checklist_modelos WHERE tipo_equipamento = ? AND etapa = ? AND ativo = 1${condicaoId} LIMIT 1`,
    valores,
  );
  return linhas.length > 0;
}

export async function criar({ titulo, tipo_equipamento, etapa }) {
  const [resultado] = await pool.query(
    "INSERT INTO checklist_modelos (titulo, tipo_equipamento, etapa) VALUES (?, ?, ?)",
    [titulo, tipo_equipamento, etapa],
  );
  return {
    id: resultado.insertId,
    titulo,
    tipo_equipamento,
    etapa,
    ativo: true,
  };
}

export async function atualizar(
  id,
  { titulo, tipo_equipamento, etapa, ativo },
) {
  const [resultado] = await pool.query(
    "UPDATE checklist_modelos SET titulo = ?, tipo_equipamento = ?, etapa = ?, ativo = ? WHERE id = ?",
    [titulo, tipo_equipamento, etapa, ativo, id],
  );
  return resultado.affectedRows > 0;
}

export async function excluir(id) {
  const [resultado] = await pool.query(
    "DELETE FROM checklist_modelos WHERE id = ?",
    [id],
  );
  return resultado.affectedRows > 0;
}
