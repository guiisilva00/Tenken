import { validarId } from "../utils/ValidarId.js";
import Equipamento, { STATUS_VALIDOS } from "../models/Equipamento.js";
import * as EquipamentoModel from "../models/EquipamentoModel.js";

export async function listar({
  pagina = 1,
  limite = 20,
  tipo,
  localizacao,
  status,
} = {}) {
  const paginaNum = Number(pagina);
  const limiteNum = Number(limite);

  if (!Number.isInteger(paginaNum) || paginaNum <= 0) {
    throw new TypeError("Página deve ser um número inteiro positivo.");
  }
  if (!Number.isInteger(limiteNum) || limiteNum < 1 || limiteNum > 100) {
    throw new TypeError("Limite deve ser um inteiro entre 1 e 100.");
  }

  const offset = (paginaNum - 1) * limiteNum;
  const { equipamentos, total } = await EquipamentoModel.listar({
    limite: limiteNum,
    offset,
    tipo,
    localizacao,
    status,
  });

  return {
    equipamentos,
    paginacao: {
      pagina: paginaNum,
      limite: limiteNum,
      total,
      totalPaginas: Math.ceil(total / limiteNum),
    },
  };
}

export async function buscarPorId(idRecebido) {
  const id = validarId(idRecebido);
  const equipamento = await EquipamentoModel.buscarPorId(id);
  if (!equipamento) {
    throw new Error(`Equipamento ${id} não encontrado.`);
  }
  return equipamento;
}

export async function criar(dados) {
  const equipamentoDominio = new Equipamento(dados);
  return EquipamentoModel.criar(equipamentoDominio);
}

export async function atualizar(idRecebido, dados) {
  const id = validarId(idRecebido);
  const equipamentoDominio = new Equipamento({ id, ...dados });
  const atualizou = await EquipamentoModel.atualizar(id, equipamentoDominio);
  if (!atualizou) {
    throw new Error(`Equipamento ${id} não encontrado.`);
  }
  return await EquipamentoModel.buscarPorId(id);
}

export async function atualizarStatus(idRecebido, status) {
  const id = validarId(idRecebido);
  if (!STATUS_VALIDOS.includes(status)) {
    throw new TypeError(`Status deve ser um de: ${STATUS_VALIDOS.join(", ")}.`);
  }
  const atualizou = await EquipamentoModel.atualizarStatus(id, status);
  if (!atualizou) {
    throw new Error(`Equipamento ${id} não encontrado.`);
  }
  return await EquipamentoModel.buscarPorId(id);
}

export async function inativar(idRecebido) {
  const id = validarId(idRecebido);
  const inativou = await EquipamentoModel.inativar(id);
  if (!inativou) {
    throw new Error(`Equipamento ${id} não encontrado.`);
  }
}
