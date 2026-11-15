import * as ChamadoModel from "../models/ChamadoModel.js";
import * as EquipamentoModel from "../models/EquipamentoModel.js";

export async function gerar(tecnicoId) {
  const [chamados, equipamentosPorStatus] = await Promise.all([
    ChamadoModel.resumoTecnico(tecnicoId),
    EquipamentoModel.contarPorStatus(),
  ]);

  const emManutencao = equipamentosPorStatus.find(
    (item) => item.status === "EM_MANUTENCAO",
  );

  return {
    chamados: {
      por_status: chamados.porStatus,
      por_severidade_em_aberto: chamados.porSeveridade,
      abertos_por_dia: chamados.abertosPorDia,
      concluidos_por_dia: chamados.concluidosPorDia,
    },
    equipamentos: { em_manutencao: Number(emManutencao?.total ?? 0) },
  };
}
