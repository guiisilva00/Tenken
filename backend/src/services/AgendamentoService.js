import * as AgendamentoModel from "../models/AgendamentoModel.js";
import * as EquipamentoModel from "../models/EquipamentoModel.js";
import * as TurmaModel from "../models/TurmaModel.js";
import { gerarTokenTurma } from "../utils/Token.js";

function idValido(v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new TypeError("ID inválido.");
  return n;
}

function dataLocalISO() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
}

function dataISOValida(data) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data || "");
  if (!partes) return false;
  const [, ano, mes, dia] = partes.map(Number);
  const validada = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    validada.getUTCFullYear() === ano &&
    validada.getUTCMonth() === mes - 1 &&
    validada.getUTCDate() === dia
  );
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
  const turma = await TurmaModel.buscarPorId(turmaId);
  if (!turma || Number(turma.professor_id) !== Number(usuario.id))
    throw new TypeError("A turma não está vinculada a este professor.");
  if (!turma.token_acesso) {
    for (let tentativa = 0; tentativa < 5; tentativa += 1) {
      try {
        await TurmaModel.definirTokenTurma(turmaId, gerarTokenTurma());
        const turmaAtualizada = await TurmaModel.buscarPorId(turmaId);
        if (turmaAtualizada?.token_acesso) {
          turma.token_acesso = turmaAtualizada.token_acesso;
          break;
        }
      } catch (error) {
        if (error.code !== "ER_DUP_ENTRY" || tentativa === 4) throw error;
      }
    }
    if (!turma.token_acesso)
      throw new Error("Nao foi possivel definir token unico para turma.");
  }
  const equipamento = await EquipamentoModel.buscarPorId(equipamentoId);
  if (!equipamento || ["EM_MANUTENCAO", "INATIVO"].includes(equipamento.status))
    throw new TypeError("Equipamento indisponível para reserva.");
  const ini = `${data} ${inicio}:00`,
    fimData = `${data} ${fim}:00`;
  if (await AgendamentoModel.verificarConflito(equipamentoId, ini, fimData))
    throw new TypeError("Equipamento já reservado nesse horário.");
  const agendamentoId = await AgendamentoModel.criar({
    responsavel_id: Number(usuario.id),
    equipamento_id: equipamentoId,
    turma_id: turmaId,
    atividade,
    inicio: ini,
    fim: fimData,
    token_acesso: null,
  });
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
