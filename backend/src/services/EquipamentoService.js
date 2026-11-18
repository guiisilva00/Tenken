import { validarId } from "../utils/ValidarId.js";
import Equipamento, { STATUS_VALIDOS } from "../models/Equipamento.js";
import * as EquipamentoModel from "../models/EquipamentoModel.js";
import * as ChamadoModel from "../models/ChamadoModel.js";
import { pool } from "../config/Database.js";

export async function listar({ pagina = 1, limite = 20, tipo, localizacao, status } = {}) {
  const paginaNum = Number(pagina);
  const limiteNum = Number(limite);
  if (!Number.isInteger(paginaNum) || paginaNum <= 0) throw new TypeError("Página deve ser um número inteiro positivo.");
  if (!Number.isInteger(limiteNum) || limiteNum < 1 || limiteNum > 100) throw new TypeError("Limite deve ser um inteiro entre 1 e 100.");
  const offset = (paginaNum - 1) * limiteNum;
  const { equipamentos, total } = await EquipamentoModel.listar({ limite: limiteNum, offset, tipo, localizacao, status });
  return { equipamentos, paginacao: { pagina: paginaNum, limite: limiteNum, total, totalPaginas: Math.ceil(total / limiteNum) } };
}

export async function buscarPorId(idRecebido) {
  const id = validarId(idRecebido);
  const equipamento = await EquipamentoModel.buscarPorId(id);
  if (!equipamento) throw new Error(`Equipamento ${id} não encontrado.`);
  return equipamento;
}

export async function criar(dados) {
  return EquipamentoModel.criar(new Equipamento(dados));
}

export async function atualizar(idRecebido, dados) {
  const id = validarId(idRecebido);
  const equipamentoDominio = new Equipamento({ id, ...dados });
  if (!(await EquipamentoModel.atualizar(id, equipamentoDominio))) throw new Error(`Equipamento ${id} não encontrado.`);
  return EquipamentoModel.buscarPorId(id);
}

export async function atualizarStatus(idRecebido, status) {
  const id = validarId(idRecebido);
  if (!STATUS_VALIDOS.includes(status)) throw new TypeError(`Status deve ser um de: ${STATUS_VALIDOS.join(", ")}.`);
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    const equipamento = await EquipamentoModel.travarPorId(id, conexao);
    if (!equipamento) throw new Error(`Equipamento ${id} não encontrado.`);
    if (status === "DISPONIVEL" && await ChamadoModel.existeCorretivoAtivo(id, conexao)) {
      const erro = new Error("O equipamento possui chamado corretivo ativo e não pode ser liberado.");
      erro.status = 409;
      throw erro;
    }
    await EquipamentoModel.atualizarStatus(id, status, conexao);
    await conexao.commit();
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
  return EquipamentoModel.buscarPorId(id);
}

export async function inativar(idRecebido) {
  const id = validarId(idRecebido);
  if (!(await EquipamentoModel.inativar(id))) throw new Error(`Equipamento ${id} não encontrado.`);
}
