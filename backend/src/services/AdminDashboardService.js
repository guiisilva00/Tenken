import * as ChamadoModel from "../models/ChamadoModel.js";
import * as EquipamentoModel from "../models/EquipamentoModel.js";

export async function gerar() {
  const [
    totalEquipamentos,
    equipamentosPorStatus,
    equipamentosCriticos,
    chamados,
  ] = await Promise.all([
    EquipamentoModel.contarTotal(),
    EquipamentoModel.contarPorStatus(),
    ChamadoModel.contarEquipamentosCriticos(),
    ChamadoModel.contarPorStatusESeveridade(),
  ]);
  return {
    equipamentos: {
      total: totalEquipamentos,
      por_status: equipamentosPorStatus,
      criticos: equipamentosCriticos,
    },
    chamados: {
      por_status: chamados.porStatus,
      por_severidade_em_aberto: chamados.porSeveridade,
    },
  };
}
