import * as AgendamentoModel from "../models/AgendamentoModel.js";
import * as ChamadoModel from "../models/ChamadoModel.js";
import * as EquipamentoModel from "../models/EquipamentoModel.js";

const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;

function validarData(valor, nomeCampo) {
  if (typeof valor !== "string" || !REGEX_DATA.test(valor))
    throw new TypeError(`${nomeCampo} deve estar no formato AAAA-MM-DD.`);
  return valor;
}

export async function gerar({ periodo_inicio, periodo_fim, tipo } = {}) {
  if (tipo && !["BANCADA", "ROBO"].includes(tipo))
    throw new TypeError("tipo deve ser BANCADA ou ROBO.");
  const filtroTipo = tipo || null;
  const inicio = periodo_inicio
    ? validarData(periodo_inicio, "periodo_inicio")
    : "1970-01-01";
  const hoje = new Date();
  const hojeLocal = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
  const fim = periodo_fim ? validarData(periodo_fim, "periodo_fim") : hojeLocal;
  if (inicio > fim)
    throw new TypeError("periodo_inicio não pode ser depois de periodo_fim.");

  const horasPeriodo =
    (Date.parse(`${fim}T00:00:00Z`) - Date.parse(`${inicio}T00:00:00Z`)) /
      3600000 +
    24;
  const [
    rankingUso,
    horasPorEquipamento,
    rankingFalhas,
    mttrHoras,
    equipamentosPorStatus,
  ] = await Promise.all([
    AgendamentoModel.rankingUso(inicio, fim, { limite: 10, tipo: filtroTipo }),
    AgendamentoModel.horasReservadasPorEquipamento(inicio, fim, filtroTipo),
    ChamadoModel.rankingFalhas(inicio, fim, filtroTipo),
    ChamadoModel.tempoMedioReparo(inicio, fim, filtroTipo),
    EquipamentoModel.contarPorStatus(filtroTipo),
  ]);
  const taxaOcupacao = horasPorEquipamento.map((linha) => ({
    equipamento_id: linha.equipamento_id,
    equipamento_nome: linha.equipamento_nome,
    horas_reservadas: Number(linha.horas_reservadas),
    taxa_ocupacao_percentual: Number(
      ((Number(linha.horas_reservadas) / horasPeriodo) * 100).toFixed(2),
    ),
  }));
  const horasPorId = new Map(
    taxaOcupacao.map((linha) => [
      Number(linha.equipamento_id),
      linha.horas_reservadas,
    ]),
  );
  const rankingUsoComHoras = rankingUso.map((linha) => ({
    ...linha,
    horas_reservadas: horasPorId.get(Number(linha.equipamento_id)) ?? 0,
  }));
  return {
    periodo: { inicio, fim },
    tipo: filtroTipo,
    ranking_uso: rankingUsoComHoras,
    taxa_ocupacao: taxaOcupacao,
    ranking_falhas: rankingFalhas,
    mttr_horas: mttrHoras,
    equipamentos_por_status: equipamentosPorStatus,
  };
}
