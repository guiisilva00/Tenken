import Chamado, { SEVERIDADES_VALIDAS } from "../models/Chamado.js";
import * as AgendamentoModel from "../models/AgendamentoModel.js";
import * as ChamadoModel from "../models/ChamadoModel.js";
import * as ChecklistItemModel from "../models/ChecklistItemModel.js";
import * as ChecklistModeloModel from "../models/ChecklistModeloModel.js";
import * as EquipamentoModel from "../models/EquipamentoModel.js";
import * as InspecaoModel from "../models/InspecaoModel.js";
import { pool } from "../config/Database.js";
import { basename } from "node:path";

export async function listar(professorId) {
  const pendentes = await InspecaoModel.listarPendentes(professorId);
  const realizadas = await InspecaoModel.listarRealizadasPorProfessor(professorId);

  for (const item of pendentes) {
    const modelo = await ChecklistModeloModel.buscarPorTipoEtapa(item.tipoEquipamento, item.etapa);
    const itens = modelo ? await ChecklistItemModel.listarPorModelo(modelo.id) : [];
    item.modelo = modelo?.titulo || "";
    item.checklist = itens.map((checklistItem) => ({
      id: checklistItem.id,
      texto: checklistItem.descricao,
      critico: Boolean(checklistItem.critico),
    }));
    item.resultado = null;
  }

  return [...pendentes, ...realizadas]
    .sort((a, b) => `${b.data}${b.horario}`.localeCompare(`${a.data}${a.horario}`));
}

export async function buscarRespostas(id, professorId) {
  const inspecao = await InspecaoModel.buscarComAgendamento(Number(id));
  if (!inspecao) throw new Error("Inspecao nao encontrada.");
  if (Number(inspecao.responsavel_id) !== Number(professorId)) {
    const erro = new Error("Acesso negado.");
    erro.status = 403;
    throw erro;
  }
  return InspecaoModel.buscarRespostas(Number(id));
}

export async function abrirChamadoDeInspecao(idRecebido, dados, usuario) {
  const inspecaoId = Number(idRecebido);
  const descricao = typeof dados?.descricao === "string" ? dados.descricao.trim() : "";
  const severidade = dados?.severidade || "ALTA";
  if (!Number.isInteger(inspecaoId) || inspecaoId <= 0) {
    throw new TypeError("ID da inspeção deve ser um inteiro positivo.");
  }
  if (!descricao) throw new TypeError("Descreva o problema para abrir o chamado.");
  if (!SEVERIDADES_VALIDAS.includes(severidade)) {
    throw new TypeError(`Prioridade deve ser uma de: ${SEVERIDADES_VALIDAS.join(", ")}.`);
  }

  const inspecao = await InspecaoModel.buscarComAgendamento(inspecaoId);
  if (!inspecao) throw new Error("Inspecao nao encontrada.");
  if (Number(inspecao.responsavel_id) !== Number(usuario.id)) {
    const erro = new Error("Acesso negado.");
    erro.status = 403;
    throw erro;
  }
  if (inspecao.resultado !== "REPROVADO") {
    throw new TypeError("Só é possível abrir chamado para uma inspeção reprovada.");
  }

  const existente = await ChamadoModel.buscarPorInspecao(inspecaoId);
  if (existente) return existente;

  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    const chamadoExistente = await ChamadoModel.buscarPorInspecao(inspecaoId, conexao);
    if (chamadoExistente) {
      await conexao.commit();
      return chamadoExistente;
    }

    const chamado = await ChamadoModel.criar(new Chamado({
      id: 1,
      equipamento_id: Number(inspecao.equipamento_id),
      inspecao_id: inspecaoId,
      solicitante_id: Number(usuario.id),
      titulo: `Falha na inspeção — ${inspecao.equipamento_nome}`.slice(0, 150),
      descricao,
      tipo: "CORRETIVO",
      severidade,
    }), conexao);
    await EquipamentoModel.atualizarStatus(inspecao.equipamento_id, "EM_MANUTENCAO", conexao);
    await conexao.commit();
    return chamado;
  } catch (erro) {
    await conexao.rollback();
    if (erro.code === "ER_DUP_ENTRY") {
      const chamadoExistente = await ChamadoModel.buscarPorInspecao(inspecaoId);
      if (chamadoExistente) return chamadoExistente;
    }
    throw erro;
  } finally {
    conexao.release();
  }
}

export async function registrar(dados, usuario, arquivos = []) {
  const agendamentoId = Number(dados.agendamentoId);
  const { etapa } = dados;
  if (!Number.isInteger(agendamentoId) || agendamentoId <= 0 || !["PRE_USO", "POS_USO"].includes(etapa)) {
    throw new TypeError("Agendamento ou etapa inválidos.");
  }

  const agendamento = await AgendamentoModel.buscarPorId(agendamentoId);
  if (!agendamento) throw new Error("Agendamento nao encontrado.");
  if (Number(agendamento.responsavel_id) !== Number(usuario.id)) {
    const erro = new Error("Acesso negado.");
    erro.status = 403;
    throw erro;
  }
  if ((etapa === "PRE_USO" && agendamento.status !== "CONFIRMADO")
    || (etapa === "POS_USO" && agendamento.status !== "EM_ANDAMENTO")) {
    throw new TypeError("Etapa não permitida para o status atual.");
  }

  const equipamento = await EquipamentoModel.buscarPorId(agendamento.equipamento_id);
  const modelo = await ChecklistModeloModel.buscarPorTipoEtapa(equipamento.tipo, etapa);
  const itens = modelo ? await ChecklistItemModel.listarPorModelo(modelo.id) : [];
  const respostas = new Map((Array.isArray(dados.respostas) ? dados.respostas : [])
    .map((resposta) => [Number(resposta.itemId), resposta]));
  if (!itens.length || itens.some((item) => typeof respostas.get(item.id)?.conforme !== "boolean")) {
    throw new TypeError("Responda todos os itens do checklist.");
  }

  const fotosPorItem = new Map();
  for (const arquivo of arquivos) {
    const correspondencia = /^foto_(\d+)$/.exec(arquivo.fieldname);
    const itemId = correspondencia ? Number(correspondencia[1]) : NaN;
    if (!Number.isInteger(itemId) || !respostas.has(itemId) || !itens.some((item) => item.id === itemId)) {
      throw new TypeError("A foto enviada nÃ£o corresponde a um item deste checklist.");
    }
    if (fotosPorItem.has(itemId)) {
      throw new TypeError("Envie no mÃ¡ximo uma foto por item do checklist.");
    }
    fotosPorItem.set(itemId, `/uploads/inspecoes/${basename(arquivo.filename)}`);
  }

  const reprovada = itens.some((item) => item.critico && !respostas.get(item.id).conforme);
  const possuiFalha = itens.some((item) => !respostas.get(item.id).conforme);
  const resultado = reprovada ? "REPROVADO" : possuiFalha ? "APROVADO_COM_RESSALVAS" : "APROVADO";
  const descricaoChamado = typeof dados.chamadoDescricao === "string" ? dados.chamadoDescricao.trim() : "";
  const severidade = dados.chamadoSeveridade || "ALTA";

  if (reprovada && !descricaoChamado) {
    throw new TypeError("Descreva o problema para abrir o chamado.");
  }
  if (reprovada && !SEVERIDADES_VALIDAS.includes(severidade)) {
    throw new TypeError(`Prioridade deve ser uma de: ${SEVERIDADES_VALIDAS.join(", ")}.`);
  }

  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    const inspecaoId = await InspecaoModel.criar({
      agendamento_id: agendamentoId,
      modelo_id: modelo.id,
      professor_id: Number(usuario.id),
      etapa,
      resultado,
      observacoes: typeof dados.observacoes === "string" ? dados.observacoes.trim() : "",
    }, conexao);

    await InspecaoModel.criarRespostas(inspecaoId, itens.map((item) => ({
      item_id: item.id,
      conforme: respostas.get(item.id).conforme,
      observacao: respostas.get(item.id).observacao || null,
      caminho_foto: fotosPorItem.get(item.id) || null,
    })), conexao);

    await EquipamentoModel.atualizarStatus(
      equipamento.id,
      reprovada ? "EM_MANUTENCAO" : etapa === "PRE_USO" ? "EM_USO" : "DISPONIVEL",
      conexao,
    );
    if (etapa === "PRE_USO" && !reprovada) {
      await AgendamentoModel.atualizarStatus(agendamentoId, "EM_ANDAMENTO", conexao);
    }
    if (etapa === "POS_USO") {
      await AgendamentoModel.atualizarStatus(agendamentoId, "CONCLUIDO", conexao);
    }

    let chamado = null;
    if (reprovada) {
      chamado = await ChamadoModel.criar(new Chamado({
        id: 1,
        equipamento_id: Number(equipamento.id),
        inspecao_id: Number(inspecaoId),
        solicitante_id: Number(usuario.id),
        titulo: `Falha na inspeção — ${equipamento.nome}`.slice(0, 150),
        descricao: descricaoChamado,
        tipo: "CORRETIVO",
        severidade,
      }), conexao);
    } else if (possuiFalha) {
      chamado = await ChamadoModel.criar(new Chamado({
        id: 1,
        equipamento_id: Number(equipamento.id),
        inspecao_id: Number(inspecaoId),
        solicitante_id: Number(usuario.id),
        titulo: `Ressalva na inspeção — ${equipamento.nome}`.slice(0, 150),
        descricao: descricaoChamado || "Item não crítico reprovado na inspeção; manutenção preventiva recomendada.",
        tipo: "PREVENTIVO",
        severidade: "BAIXA",
      }), conexao);
    }

    await conexao.commit();
    return {
      id: inspecaoId,
      resultado,
      equipamento: equipamento.nome,
      chamadoId: chamado?.id ?? null,
      chamadoStatus: chamado?.status ?? null,
    };
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}
