import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { pool } from "../src/config/Database.js";
import * as service from "../src/services/CheckinService.js";
import { gerarTokenTurma } from "../src/utils/Token.js";

// Fixtures isoladas: todas as escritas são revertidas, inclusive em caso de falha.
test("check-ins: reserva ativa, contexto e autorização no MySQL", async (t) => {
  const conexao = await pool.getConnection();
  const queryOriginal = pool.query;
  pool.query = conexao.query.bind(conexao);
  try {
    await conexao.beginTransaction();
    const inserir = async (sql, params) => (await conexao.query(sql, params))[0].insertId;
    const prefixo = randomUUID();
    const usuario = (perfil, sufixo) => inserir(
      "INSERT INTO usuarios (nome,email,senha_hash,perfil) VALUES (?,?,?,?)",
      [`Teste ${sufixo}`, `${prefixo}-${sufixo}@example.invalid`, "teste", perfil],
    );
    const professor = await usuario("PROFESSOR", "professor");
    const outroProfessor = await usuario("PROFESSOR", "outro");
    const aluno = await usuario("ALUNO", "aluno");
    const semVinculo = await usuario("ALUNO", "sem-vinculo");
    const turma = await inserir("INSERT INTO turmas_projetos (nome,professor_id) VALUES (?,?)", ["Turma teste", professor]);
    await conexao.query("INSERT INTO turma_alunos (turma_id,aluno_id) VALUES (?,?)", [turma, aluno]);
    const equipamento = await inserir(
      "INSERT INTO equipamentos (codigo_patrimonio,nome,tipo,localizacao) VALUES (?,?,'BANCADA',?)",
      [prefixo, "Equipamento teste", "Laboratório teste"],
    );
    const reserva = async (status, inicio, fim) => inserir(
      `INSERT INTO agendamentos (responsavel_id,equipamento_id,turma_id,atividade,inicio,fim,status)
       VALUES (?,?,?,'Atividade teste',DATE_ADD(NOW(), INTERVAL ? MINUTE),DATE_ADD(NOW(), INTERVAL ? MINUTE),?)`,
      [professor, equipamento, turma, inicio, fim, status],
    );
    const antiga = await reserva("CONFIRMADO", -120, -60);
    const futura = await reserva("CONFIRMADO", 60, 120);
    const cancelada = await reserva("CANCELADO", -30, 30);
    const concluida = await reserva("CONCLUIDO", -30, 30);
    const ativa = await reserva("EM_ANDAMENTO", -30, 30);
    const token = gerarTokenTurma();
    await conexao.query("UPDATE agendamentos SET token_acesso=? WHERE id=?", [token, ativa]);
    const checkin = (id, idAluno = aluno) => conexao.query(
      "INSERT INTO checkins (agendamento_id,aluno_id) VALUES (?,?)", [id, idAluno],
    );
    for (const id of [antiga, futura, cancelada, concluida]) await checkin(id);
    await conexao.query("UPDATE checkins SET realizado_em=DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE aluno_id=?", [aluno]);
    await t.test("aulas antigas, futuras, canceladas e concluídas não são atuais", async () => {
      await assert.rejects(service.buscarAtualDoAluno(aluno), { status: 404 });
      assert.deepEqual(await service.listarPendentes(professor), []);
    });
    await checkin(ativa);
    await checkin(ativa, semVinculo);
    await t.test("restaura pendência com aula e equipamento corretos", async () => {
      const atual = await service.buscarAtualDoAluno(aluno);
      assert.equal(atual.aprovado, false);
      assert.equal(atual.agendamento.id, ativa);
      assert.equal(atual.agendamento.atividade, "Atividade teste");
      assert.equal(atual.agendamento.token, token);
      assert.equal(atual.agendamento.professor, "Teste professor");
      assert.equal(atual.turma.id, turma);
      assert.equal(atual.equipamentos[0].id, equipamento);
      assert.equal(atual.equipamentos[0].status, "DISPONIVEL");
      assert.ok(atual.segundos_restantes > 0 && atual.segundos_restantes <= 1800);
      const pendentes = await service.listarPendentes(professor);
      assert.equal(pendentes.length, 1);
      assert.equal(pendentes[0].agendamento.id, ativa);
      assert.equal(pendentes[0].agendamento.token, token);
      assert.ok(pendentes[0].agendamento.inicio < pendentes[0].agendamento.fim);
      assert.ok(pendentes[0].criado_em);
    });
    await t.test("outro professor não lista nem aprova a solicitação", async () => {
      assert.deepEqual(await service.listarPendentes(outroProfessor), []);
      await assert.rejects(service.aprovar(`${ativa}-${aluno}`, outroProfessor), { status: 403 });
    });
    await t.test("vínculo ausente não autoriza recuperação nem aprovação", async () => {
      await assert.rejects(service.buscarAtualDoAluno(semVinculo), { status: 404 });
      await assert.rejects(service.aprovar(`${ativa}-${semVinculo}`, professor), { status: 409 });
    });
    await t.test("remoção de vínculo invalida check-in existente; duplicação de vínculo não duplica pendências", async () => {
      await conexao.query("DELETE FROM turma_alunos WHERE turma_id=? AND aluno_id=?", [turma, aluno]);
      await assert.rejects(service.buscarAtualDoAluno(aluno), { status: 404 });
      await assert.rejects(service.aprovar(`${ativa}-${aluno}`, professor), { status: 409 });
      await conexao.query("INSERT INTO turma_alunos (turma_id,aluno_id) VALUES (?,?),(?,?)", [turma, aluno, turma, aluno]);
      assert.equal((await service.listarPendentes(professor)).length, 1);
    });
    await t.test("aprova reserva ativa, restaura aprovação e impede duplicação", async () => {
      await service.aprovar(`${ativa}-${aluno}`, professor);
      assert.equal((await service.buscarAtualDoAluno(aluno)).aprovado, true);
      assert.deepEqual(await service.listarPendentes(professor), []);
      await assert.rejects(service.aprovar(`${ativa}-${aluno}`, professor), { status: 409 });
    });
    await t.test("expiração e cancelamento invalidam a aprovação recuperada", async () => {
      await conexao.query("UPDATE agendamentos SET fim = DATE_SUB(NOW(), INTERVAL 1 SECOND) WHERE id=?", [ativa]);
      await assert.rejects(service.buscarAtualDoAluno(aluno), { status: 404 });
      await assert.rejects(service.aprovar(`${antiga}-${aluno}`, professor), { status: 409 });
      await conexao.query("UPDATE agendamentos SET fim=DATE_ADD(NOW(), INTERVAL 30 MINUTE), status='CANCELADO' WHERE id=?", [ativa]);
      await assert.rejects(service.buscarAtualDoAluno(aluno), { status: 404 });
    });
  } finally {
    pool.query = queryOriginal;
    await conexao.rollback();
    conexao.release();
    await pool.end();
  }
});
