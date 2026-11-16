import * as CheckinModel from "../models/CheckinModel.js";

function idValido(valor, nomeCampo = "ID") {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new TypeError(`${nomeCampo} deve ser um número inteiro positivo.`);
  }
  return id;
}

function montarId(agendamentoId, alunoId) {
  return `${agendamentoId}-${alunoId}`;
}

function interpretarId(valor) {
  const partes = String(valor ?? "").split("-");
  if (partes.length !== 2) throw new TypeError("ID do check-in inválido.");
  return {
    agendamentoId: idValido(partes[0], "ID do agendamento"),
    alunoId: idValido(partes[1], "ID do aluno"),
  };
}

export async function buscarAtualDoAluno(alunoId) {
  const checkin = await CheckinModel.buscarMaisRecentePorAluno(idValido(alunoId, "ID do aluno"));
  if (!checkin) {
    const erro = new Error("Nenhuma solicitação de acesso encontrada.");
    erro.status = 404;
    throw erro;
  }
  return {
    aprovado: checkin.aprovado_em !== null,
    agendamento: {
      id: checkin.agendamento_id, atividade: checkin.atividade,
      inicio: checkin.inicio, fim: checkin.fim, token: checkin.token_acesso,
      professor: checkin.professor_nome,
    },
    segundos_restantes: Math.max(0, Math.floor((new Date(checkin.fim) - new Date(checkin.agora)) / 1000)),
    turma: { id: checkin.turma_id, nome: checkin.turma_nome },
    equipamentos: [{
      id: checkin.equipamento_id,
      nome: checkin.equipamento_nome,
      codigo_patrimonio: checkin.codigo_patrimonio,
      localizacao: checkin.localizacao,
      tipo: checkin.tipo,
      status: checkin.equipamento_status,
    }],
  };
}

export async function listarPendentes(professorId) {
  const linhas = await CheckinModel.listarPendentesPorProfessor(idValido(professorId, "ID do professor"));
  return linhas.map((linha) => ({
    id: montarId(linha.agendamento_id, linha.aluno_id),
    aluno: { id: linha.aluno_id, nome: linha.aluno_nome, matricula: linha.aluno_matricula },
    turma: { id: linha.turma_id, nome: linha.turma_nome },
    equipamento: { id: linha.equipamento_id, nome: linha.equipamento_nome },
    agendamento: {
      id: linha.agendamento_id, atividade: linha.atividade,
      inicio: linha.inicio, fim: linha.fim, token: linha.token_acesso,
    },
    criado_em: linha.criado_em,
  }));
}

export async function aprovar(idRecebido, professorId) {
  const { agendamentoId, alunoId } = interpretarId(idRecebido);
  const checkin = await CheckinModel.buscarPorIds(agendamentoId, alunoId);
  if (!checkin) {
    const erro = new Error("Check-in não encontrado.");
    erro.status = 404;
    throw erro;
  }
  if (Number(checkin.professor_id) !== Number(professorId)) {
    const erro = new Error("Check-in pertence a uma turma de outro professor.");
    erro.status = 403;
    throw erro;
  }
  if (checkin.aprovado_em !== null || !(await CheckinModel.aprovar(agendamentoId, alunoId))) {
    const erro = new Error("Check-in já aprovado ou sem vínculo e agendamento ativos.");
    erro.status = 409;
    throw erro;
  }
  const atualizado = await CheckinModel.buscarPorIds(agendamentoId, alunoId);
  return { id: montarId(agendamentoId, alunoId), aprovado_em: atualizado.aprovado_em };
}
