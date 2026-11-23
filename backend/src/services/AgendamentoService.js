import * as AgendamentoModel from "../models/AgendamentoModel.js";
import * as EquipamentoModel from "../models/EquipamentoModel.js";
import * as TurmaModel from "../models/TurmaModel.js";
import { gerarTokenTurma } from "../utils/Token.js";
import { pool } from "../config/Database.js";

function idValido(v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new TypeError("ID inválido.");
  return n;
}

function dataLocalISO() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const valor = Object.fromEntries(partes.map(({ type, value }) => [type, value]));
  return `${valor.year}-${valor.month}-${valor.day}`;
}

function agoraLocal() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const valor = Object.fromEntries(partes.map(({ type, value }) => [type, value]));
  return `${valor.year}-${valor.month}-${valor.day} ${valor.hour}:${valor.minute}`;
}

function dataISOValida(data) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data || "");
  if (!partes) return false;
  const [, ano, mes, dia] = partes.map(Number);
  if (mes < 1 || mes > 12 || dia < 1) return false;
  return dia <= new Date(ano, mes, 0).getDate();
}

export async function listarPorProfessor(id) {
  return AgendamentoModel.listarPorProfessor(id);
}
export async function criar(dados, usuario) {
  const turmaId = idValido(dados?.turmaId),
    equipamentoId = idValido(dados?.equipamentoId);
  const atividade =
    typeof dados.atividade === "string" ? dados.atividade.trim() : "";
  const { data, inicio, fim } = dados;
  if (!atividade || !data || !inicio || !fim || fim <= inicio)
    throw new TypeError("Informe atividade, data e horário válido.");
  if (!dataISOValida(data))
    throw new TypeError("Informe uma data vÃ¡lida para o agendamento.");
  if (data < dataLocalISO())
    throw new TypeError(
      "NÃ£o Ã© possÃ­vel criar agendamentos em dias anteriores a hoje.",
    );
  if (`${data} ${inicio}` <= agoraLocal())
    throw new TypeError("O início do agendamento precisa ser um horário futuro.");
  const turma = await TurmaModel.buscarPorId(turmaId);
  if (!turma || Number(turma.professor_id) !== Number(usuario.id))
    throw new TypeError("A turma não está vinculada a este professor.");
  const ini = `${data} ${inicio}:00`,
    fimData = `${data} ${fim}:00`;
  const conexao = await pool.getConnection();
  let agendamentoId;
  try {
    await conexao.beginTransaction();
    if (await AgendamentoModel.inicioJaPassou(ini, conexao))
      throw new TypeError("Não é possível agendar em um horário que já passou.");
    const equipamento = await EquipamentoModel.travarPorId(equipamentoId, conexao);
    if (!equipamento || ["EM_MANUTENCAO", "INATIVO"].includes(equipamento.status))
      throw new TypeError("Equipamento indisponível para reserva.");
    if (await AgendamentoModel.verificarConflito(equipamentoId, ini, fimData, conexao))
      throw new TypeError("Equipamento já reservado nesse horário.");
    for (let tentativa = 0; tentativa < 5; tentativa += 1) {
      const token = gerarTokenTurma();
      if (await AgendamentoModel.tokenExiste(token, conexao)) continue;
      try {
        agendamentoId = await AgendamentoModel.criar({
          responsavel_id: Number(usuario.id),
          equipamento_id: equipamentoId,
          turma_id: turmaId,
          atividade,
          inicio: ini,
          fim: fimData,
          token_acesso: token,
        }, conexao);
        break;
      } catch (erro) {
        if (erro.code !== "ER_DUP_ENTRY" || tentativa === 4) throw erro;
      }
    }
    if (!agendamentoId) throw new Error("Nao foi possivel gerar token unico para o agendamento.");
    await conexao.commit();
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
  return AgendamentoModel.buscarDetalhado(agendamentoId);
}
export async function cancelar(idRecebido, professorId) {
  const id = idValido(idRecebido),
    a = await AgendamentoModel.buscarPorId(id);
  if (!a) throw new Error(`Agendamento ${id} nao encontrado.`);
  if (Number(a.responsavel_id) !== Number(professorId)) {
    const e = new Error("Reserva de outro professor.");
    e.status = 403;
    throw e;
  }
  if (a.status !== "CONFIRMADO")
    throw new TypeError("Somente reservas confirmadas podem ser canceladas.");
  await AgendamentoModel.atualizarStatus(id, "CANCELADO");
}
