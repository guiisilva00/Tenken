import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { pool } from "../src/config/Database.js";
import { gerarMatricula } from "../src/services/AlunoService.js";

test("matrícula de ativação não é enumerável", async () => {
  const conexao = await pool.getConnection();
  const executarOriginal = pool.execute;
  let transacaoIniciada = false;
  pool.execute = conexao.execute.bind(conexao);
  try {
    await conexao.beginTransaction();
    transacaoIniciada = true;
    const id = randomUUID();
    const resultado = await gerarMatricula({
      nome: "Teste de matrícula",
      email: `${id}@example.invalid`,
      cpf: randomBytes(7).toString("hex"),
    });
    assert.match(resultado.matricula, /^MAT-[A-F0-9]{16}$/);
  } finally {
    if (transacaoIniciada) await conexao.rollback();
    pool.execute = executarOriginal;
    conexao.release();
    await pool.end();
  }
});
