import * as CheckinService from "../services/CheckinService.js";

function responderErro(erro, res, next) {
  if (erro instanceof TypeError) return res.status(400).json({ sucesso: false, erro: erro.message });
  if (erro.status) return res.status(erro.status).json({ sucesso: false, erro: erro.message });
  return next(erro);
}

export async function buscarAtual(req, res, next) {
  try {
    const dados = await CheckinService.buscarAtualDoAluno(req.usuario.id);
    return res.status(200).json({ sucesso: true, dados });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function listarPendentes(req, res, next) {
  try {
    const dados = await CheckinService.listarPendentes(req.usuario.id);
    return res.status(200).json({ sucesso: true, dados });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function aprovar(req, res, next) {
  try {
    const dados = await CheckinService.aprovar(req.params.id, req.usuario.id);
    return res.status(200).json({ sucesso: true, dados });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}
