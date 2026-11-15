import { pool } from "../config/Database.js";

export async function listarPorChamado(chamadoId) {
  const [linhas] = await pool.query(
    "SELECT * FROM historico_manutencao WHERE chamado_id = ? ORDER BY registrado_em DESC",
    [chamadoId],
  );
  return linhas;
}

export async function criar(historico, db = pool) {
  const sql = `
    INSERT INTO historico_manutencao (chamado_id, tecnico_id, descricao, pecas_trocadas, custo)
    VALUES (?, ?, ?, ?, ?)
  `;
  const valores = [
    historico.chamado_id,
    historico.tecnico_id,
    historico.descricao,
    historico.pecas_trocadas,
    historico.custo,
  ];
  const [resultado] = await db.query(sql, valores);

  return { id: resultado.insertId, ...historico };
}
