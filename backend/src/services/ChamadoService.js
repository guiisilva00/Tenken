import { validarId } from "../utils/ValidarId.js";
import Chamado, {
  SEVERIDADES_VALIDAS,
  STATUS_VALIDOS,
} from "../models/Chamado.js";
import * as ChamadoModel from "../models/ChamadoModel.js";
import * as EquipamentoModel from "../models/EquipamentoModel.js";
import * as UsuarioModel from "../models/UsuarioModel.js";
import * as OrdemServicoModel from "../models/OrdemServicoModel.js";

const PERFIS_PODEM_ABRIR_CHAMADO = ["ADMIN", "PROFESSOR", "TECNICO"];

export async function listar(
  { pagina = 1, limite = 10, status, severidade, equipamento_id } = {},
  usuarioLogado,
) {
  const paginaNum = Number(pagina);
  const limiteNum = Number(limite);

  if (!Number.isInteger(paginaNum) || paginaNum <= 0) {
    throw new TypeError("Página deve ser um número inteiro positivo.");
  }
  if (!Number.isInteger(limiteNum) || limiteNum < 1 || limiteNum > 100) {
    throw new TypeError("Limite deve ser um inteiro entre 1 e 100.");
  }
  if (status !== undefined && !STATUS_VALIDOS.includes(status)) {
    throw new TypeError(`Status deve ser um de: ${STATUS_VALIDOS.join(", ")}.`);
  }
  if (severidade !== undefined && !SEVERIDADES_VALIDAS.includes(severidade)) {
    throw new TypeError(
      `Severidade deve ser uma de: ${SEVERIDADES_VALIDAS.join(", ")}.`,
    );
  }

  const offset = (paginaNum - 1) * limiteNum;
  const equipamentoIdFiltro =
    equipamento_id !== undefined
      ? validarId(equipamento_id, "ID do equipamento")
      : undefined;
  const tecnicoId =
    usuarioLogado?.perfil === "TECNICO"
      ? validarId(usuarioLogado.id, "ID do técnico")
      : undefined;

  const { chamados, total } = await ChamadoModel.listar({
    limite: limiteNum,
    offset,
    status,
    severidade,
    equipamento_id: equipamentoIdFiltro,
    tecnicoId,
  });

  return {
    chamados,
    paginacao: {
      pagina: paginaNum,
      limite: limiteNum,
      total,
      totalPaginas: Math.ceil(total / limiteNum),
    },
  };
}

export async function listarDoProfessor(situacao, usuarioLogado) {
  if (usuarioLogado?.perfil !== "PROFESSOR") {
    const erro = new Error("Acesso não autorizado.");
    erro.status = 403;
    throw erro;
  }
  if (
    situacao !== undefined &&
    !["EM_ANDAMENTO", "CONCLUIDO"].includes(situacao)
  ) {
    throw new TypeError("Situação deve ser EM_ANDAMENTO ou CONCLUIDO.");
  }
  return ChamadoModel.listarDoProfessor(
    validarId(usuarioLogado.id, "ID do professor"),
    situacao,
  );
}

export async function buscarPorId(idRecebido) {
  const id = validarId(idRecebido);
  const chamado = await ChamadoModel.buscarPorId(id);
  if (!chamado) {
    throw new Error(`Chamado ${id} não encontrado.`);
  }
  return chamado;
}

export async function criar(dados, usuarioLogado) {
  if (!PERFIS_PODEM_ABRIR_CHAMADO.includes(usuarioLogado.perfil)) {
    const erro = new Error("Seu perfil não pode abrir chamados manualmente.");
    erro.status = 403;
    throw erro;
  }

  const equipamentoId = validarId(dados.equipamento_id, "ID do equipamento");
  const equipamento = await EquipamentoModel.buscarPorId(equipamentoId);
  if (!equipamento) {
    throw new Error(`Equipamento ${equipamentoId} não encontrado.`);
  }

  const chamadoDominio = new Chamado({
    id: 1,
    equipamento_id: equipamentoId,
    solicitante_id: Number(usuarioLogado.id),
    titulo: dados.titulo,
    descricao: dados.descricao,
    tipo: dados.tipo,
    severidade: dados.severidade,
  });

  return await ChamadoModel.criar(chamadoDominio);
}

export async function atualizarStatus(idRecebido, status, usuarioLogado) {
  const id = validarId(idRecebido);
  if (!STATUS_VALIDOS.includes(status)) {
    throw new TypeError(`Status deve ser um de: ${STATUS_VALIDOS.join(", ")}.`);
  }
  const chamado = await ChamadoModel.buscarPorId(id);
  if (!chamado) {
    throw new Error(`Chamado ${id} não encontrado.`);
  }
  if (
    usuarioLogado?.perfil === "TECNICO" &&
    Number(chamado.tecnico_id) !== Number(usuarioLogado.id)
  ) {
    const ordemServico = await OrdemServicoModel.buscarPorChamado(id);
    if (!ordemServico) {
      const erro = new Error(
        "Você só pode atualizar chamados atribuídos a você ou vinculados a uma ordem de serviço.",
      );
      erro.status = 403;
      throw erro;
    }
  }
  const atualizou = await ChamadoModel.atualizarStatus(id, status);
  if (!atualizou) {
    throw new Error(`Chamado ${id} não encontrado.`);
  }
  const statusOrdemPorChamado = {
    ABERTO: "EMITIDA",
    EM_ATENDIMENTO: "EM_EXECUCAO",
    CONCLUIDO: "FINALIZADA",
    CANCELADO: "CANCELADA",
  };
  if (statusOrdemPorChamado[status]) {
    await OrdemServicoModel.atualizarStatusPorChamado(
      id,
      statusOrdemPorChamado[status],
    );
  }
  if (status === "CONCLUIDO") {
    const chamadosAtivos = await ChamadoModel.contarAtivosPorEquipamento(
      chamado.equipamento_id,
    );
    if (chamadosAtivos === 0) {
      const equipamento = await EquipamentoModel.buscarPorId(
        chamado.equipamento_id,
      );
      if (equipamento?.status === "EM_MANUTENCAO") {
        await EquipamentoModel.atualizarStatus(
          chamado.equipamento_id,
          "DISPONIVEL",
        );
      }
    }
  }

  return await ChamadoModel.buscarPorId(id);
}

export async function atualizarTecnico(idRecebido, tecnicoIdRecebido) {
  const id = validarId(idRecebido);
  const tecnicoId = validarId(tecnicoIdRecebido, "ID do técnico");

  const tecnico = await UsuarioModel.buscarPorId(tecnicoId);
  if (!tecnico) {
    throw new Error(`Usuário ${tecnicoId} não encontrado.`);
  }
  if (tecnico.perfil !== "TECNICO") {
    throw new TypeError("O usuário informado não tem perfil TECNICO.");
  }

  const atualizou = await ChamadoModel.atualizarTecnico(id, tecnicoId);
  if (!atualizou) {
    throw new Error(`Chamado ${id} não encontrado.`);
  }
  return await ChamadoModel.buscarPorId(id);
}
