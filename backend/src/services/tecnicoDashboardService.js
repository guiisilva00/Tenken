import * as ChamadoModel from "../models/chamadoModel.js";
import * as EquipamentoModel from "../models/equipamentoModel.js";

export async function gerar(tecnicoId) {
  const [chamados, equipamentosPorCategoria] = await Promise.all([
    ChamadoModel.resumoTecnico(tecnicoId),
    EquipamentoModel.contarPorTipoEStatus(),
  ]);

  const categorias = ["BANCADA", "ROBO"].map((tipo) => ({
    tipo,
    por_status: equipamentosPorCategoria
      .filter((item) => item.tipo === tipo)
      .map((item) => ({ status: item.status, total: Number(item.total) })),
  }));
  const emManutencao = equipamentosPorCategoria
    .filter((item) => item.status === "EM_MANUTENCAO")
    .reduce((total, item) => total + Number(item.total), 0);

  return {
    chamados: {
      por_status: chamados.porStatus,
      por_severidade_em_aberto: chamados.porSeveridade,
      abertos_por_dia: chamados.abertosPorDia,
      concluidos_por_dia: chamados.concluidosPorDia,
    },
    equipamentos: { em_manutencao: emManutencao, por_categoria: categorias },
  };
}
