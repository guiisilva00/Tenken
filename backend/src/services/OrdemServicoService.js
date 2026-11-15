import { validarId } from "../utils/ValidarId.js";
import * as ChamadoModel from "../models/ChamadoModel.js";
import * as OrdemServicoModel from "../models/OrdemServicoModel.js";
import * as HistoricoManutencaoService from "./HistoricoManutencaoService.js";
import * as ChamadoService from "./ChamadoService.js";
import { pool } from "../config/Database.js";

const STATUS_VALIDOS = ["EMITIDA", "EM_EXECUCAO", "FINALIZADA", "CANCELADA"];
const STATUS_CHAMADO_VALIDOS = [
  "ABERTO",
  "EM_ATENDIMENTO",
  "AGUARDANDO_PECAS",
  "CONCLUIDO",
  "CANCELADO",
];
const SEVERIDADES_VALIDAS = ["BAIXA", "MEDIA", "ALTA", "CRITICA"];
const STATUS_CHAMADO_POR_ORDEM = {
  EMITIDA: "ABERTO",
  EM_EXECUCAO: "EM_ATENDIMENTO",
  FINALIZADA: "CONCLUIDO",
  CANCELADA: "CANCELADO",
};

async function gerarNumero() {
  const ano = new Date().getFullYear();
  const totalNoAno = await OrdemServicoModel.contarNoAno(ano);
  const sequencial = String(totalNoAno + 1).padStart(4, "0");
  return `OS-${ano}-${sequencial}`;
}

export async function emitir(chamadoIdRecebido, usuarioLogado) {
  const chamadoId = validarId(chamadoIdRecebido, "ID do chamado");

  const chamado = await ChamadoModel.buscarPorId(chamadoId);
  if (!chamado) {
    throw new Error(`Chamado ${chamadoId} não encontrado.`);
  }

  const existente = await OrdemServicoModel.buscarPorChamado(chamadoId);
  if (existente) {
    const erroConflito = new Error(
      `O chamado ${chamadoId} já possui uma ordem de serviço.`,
    );
    erroConflito.status = 409;
    throw erroConflito;
  }

  const numero = await gerarNumero();
  return await OrdemServicoModel.criar({
    chamado_id: chamadoId,
    numero,
    emitida_por: Number(usuarioLogado.id),
  });
}

export async function listarParaTecnicos(usuarioLogado, filtros = {}) {
  if (usuarioLogado?.perfil !== "TECNICO") {
    const erro = new Error("Apenas técnicos podem listar ordens de serviço.");
    erro.status = 403;
    throw erro;
  }
  const status = filtros.status;
  if (status !== undefined && !STATUS_CHAMADO_VALIDOS.includes(status)) {
    throw new TypeError(
      `Status deve ser um de: ${STATUS_CHAMADO_VALIDOS.join(", ")}.`,
    );
  }
  const severidade = filtros.severidade;
  if (severidade !== undefined && !SEVERIDADES_VALIDAS.includes(severidade)) {
    throw new TypeError(
      `Severidade deve ser uma de: ${SEVERIDADES_VALIDAS.join(", ")}.`,
    );
  }
  return await OrdemServicoModel.listarTodas({ status, severidade });
}

export async function buscarPorId(idRecebido) {
  const id = validarId(idRecebido);
  const ordemServico = await OrdemServicoModel.buscarPorId(id);
  if (!ordemServico) {
    throw new Error(`Ordem de serviço ${id} não encontrada.`);
  }
  return ordemServico;
}

export async function atualizarStatus(idRecebido, status) {
  const id = validarId(idRecebido);
  if (!STATUS_VALIDOS.includes(status)) {
    throw new TypeError(`Status deve ser um de: ${STATUS_VALIDOS.join(", ")}.`);
  }
  const ordemServico = await OrdemServicoModel.buscarPorId(id);
  if (!ordemServico) {
    throw new Error(`Ordem de serviço ${id} não encontrada.`);
  }
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    const atualizou = await OrdemServicoModel.atualizarStatus(id, status, conexao);
    if (!atualizou) throw new Error(`Ordem de serviço ${id} não encontrada.`);
    await ChamadoModel.atualizarStatus(
      ordemServico.chamado_id,
      STATUS_CHAMADO_POR_ORDEM[status],
      conexao,
    );
    await conexao.commit();
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
  return await OrdemServicoModel.buscarPorId(id);
}

export async function concluir(idRecebido, descricao, usuarioLogado) {
  const id = validarId(idRecebido);
  if (typeof descricao !== "string" || descricao.trim() === "") {
    throw new TypeError("Descreva o serviço realizado para concluir a ordem.");
  }
  const ordemServico = await OrdemServicoModel.buscarPorId(id);
  if (!ordemServico) {
    throw new Error(`Ordem de serviço ${id} não encontrada.`);
  }
  if (usuarioLogado?.perfil !== "TECNICO") {
    const erro = new Error("Apenas técnicos podem concluir ordens de serviço.");
    erro.status = 403;
    throw erro;
  }
  if (ordemServico.status === "FINALIZADA") {
    const erro = new Error("Esta ordem de serviço já foi concluída.");
    erro.status = 409;
    throw erro;
  }

  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    await HistoricoManutencaoService.criar(
      ordemServico.chamado_id,
      { descricao },
      usuarioLogado,
      conexao,
    );
    await ChamadoService.atualizarStatus(
      ordemServico.chamado_id,
      "CONCLUIDO",
      usuarioLogado,
      conexao,
    );
    await conexao.commit();
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
  return await OrdemServicoModel.buscarPorId(id);
}
