import { validarId } from "../utils/ValidarId.js";
import * as ChamadoModel from "../models/ChamadoModel.js";
import * as HistoricoManutencaoModel from "../models/HistoricoManutencaoModel.js";
import * as OrdemServicoModel from "../models/OrdemServicoModel.js";

async function validarAtribuicaoTecnico(chamado, usuarioLogado) {
  if (
    usuarioLogado?.perfil === "TECNICO" &&
    Number(chamado.tecnico_id) !== Number(usuarioLogado.id)
  ) {
    const ordemServico = await OrdemServicoModel.buscarPorChamado(chamado.id);
    if (!ordemServico) {
      const erro = new Error(
        "Você só pode acessar o histórico de chamados atribuídos a você ou vinculados a uma ordem de serviço.",
      );
      erro.status = 403;
      throw erro;
    }
  }
}

export async function listar(chamadoIdRecebido, usuarioLogado) {
  const chamadoId = validarId(chamadoIdRecebido, "ID do chamado");
  const chamado = await ChamadoModel.buscarPorId(chamadoId);
  if (!chamado) {
    throw new Error(`Chamado ${chamadoId} não encontrado.`);
  }
  await validarAtribuicaoTecnico(chamado, usuarioLogado);
  return await HistoricoManutencaoModel.listarPorChamado(chamadoId);
}

export async function criar(chamadoIdRecebido, dados, usuarioLogado) {
  const chamadoId = validarId(chamadoIdRecebido, "ID do chamado");
  const chamado = await ChamadoModel.buscarPorId(chamadoId);
  if (!chamado) {
    throw new Error(`Chamado ${chamadoId} não encontrado.`);
  }
  await validarAtribuicaoTecnico(chamado, usuarioLogado);

  if (typeof dados.descricao !== "string" || dados.descricao.trim() === "") {
    throw new TypeError("Descrição é obrigatória.");
  }

  const custo = dados.custo === undefined ? 0 : Number(dados.custo);
  if (!Number.isFinite(custo) || custo < 0) {
    throw new TypeError("Custo deve ser um número maior ou igual a zero.");
  }

  return await HistoricoManutencaoModel.criar({
    chamado_id: chamadoId,
    tecnico_id: Number(usuarioLogado.id),
    descricao: dados.descricao.trim(),
    pecas_trocadas:
      typeof dados.pecas_trocadas === "string"
        ? dados.pecas_trocadas.trim()
        : null,
    custo,
  });
}
