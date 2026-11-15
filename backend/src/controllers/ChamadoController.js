import * as ChamadoService from "../services/ChamadoService.js";
import * as HistoricoManutencaoService from "../services/HistoricoManutencaoService.js";
import * as OrdemServicoService from "../services/OrdemServicoService.js";

export async function listar(req, res, next) {
  try {
    const resultado = await ChamadoService.listar(req.query, req.usuario);
    return res.status(200).json({
      sucesso: true,
      dados: resultado.chamados,
      paginacao: resultado.paginacao,
    });
  } catch (erro) {
    return next(erro);
  }
}

export async function listarDoProfessor(req, res, next) {
  try {
    const chamados = await ChamadoService.listarDoProfessor(
      req.query.situacao,
      req.usuario,
    );
    return res.status(200).json({ sucesso: true, dados: chamados });
  } catch (erro) {
    return next(erro);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const chamado = await ChamadoService.buscarPorId(req.params.id);
    return res.status(200).json({ sucesso: true, dados: chamado });
  } catch (erro) {
    return next(erro);
  }
}

export async function criar(req, res, next) {
  try {
    const chamado = await ChamadoService.criar(req.body, req.usuario);
    return res.status(201).json({ sucesso: true, dados: chamado });
  } catch (erro) {
    return next(erro);
  }
}

export async function atualizarStatus(req, res, next) {
  try {
    const chamado = await ChamadoService.atualizarStatus(
      req.params.id,
      req.body.status,
      req.usuario,
    );
    return res.status(200).json({ sucesso: true, dados: chamado });
  } catch (erro) {
    return next(erro);
  }
}

export async function atualizarTecnico(req, res, next) {
  try {
    const chamado = await ChamadoService.atualizarTecnico(
      req.params.id,
      req.body.tecnico_id,
    );
    return res.status(200).json({ sucesso: true, dados: chamado });
  } catch (erro) {
    return next(erro);
  }
}

export async function listarHistorico(req, res, next) {
  try {
    const historico = await HistoricoManutencaoService.listar(
      req.params.id,
      req.usuario,
    );
    return res.status(200).json({ sucesso: true, dados: historico });
  } catch (erro) {
    return next(erro);
  }
}

export async function criarHistorico(req, res, next) {
  try {
    const historico = await HistoricoManutencaoService.criar(
      req.params.id,
      req.body,
      req.usuario,
    );
    return res.status(201).json({ sucesso: true, dados: historico });
  } catch (erro) {
    return next(erro);
  }
}

export async function emitirOrdemServico(req, res, next) {
  try {
    const ordemServico = await OrdemServicoService.emitir(
      req.params.id,
      req.usuario,
    );
    return res.status(201).json({ sucesso: true, dados: ordemServico });
  } catch (erro) {
    return next(erro);
  }
}
