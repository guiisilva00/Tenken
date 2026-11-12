import * as OrdemServicoService from "../services/ordemServicoService.js";

function responderErro(erro, res, next) {
  if (erro instanceof TypeError) return res.status(400).json({ sucesso: false, erro: erro.message });
  if (erro.status === 403) return res.status(403).json({ sucesso: false, erro: erro.message });
  if (erro.status === 409) return res.status(409).json({ sucesso: false, erro: erro.message });
  if (erro.status === 422) return res.status(422).json({ sucesso: false, erro: erro.message });
  if (erro.message.includes("não encontrada")) return res.status(404).json({ sucesso: false, erro: erro.message });
  return next(erro);
}

export async function buscarPorId(req, res, next) {
  try {
    const ordemServico = await OrdemServicoService.buscarPorId(req.params.id);
    return res.status(200).json({ sucesso: true, dados: ordemServico });
  } catch (erro) { return responderErro(erro, res, next); }
}

export async function listarParaTecnicos(req, res, next) {
  try {
    const ordens = await OrdemServicoService.listarParaTecnicos(req.usuario, req.query);
    return res.status(200).json({ sucesso: true, dados: ordens });
  } catch (erro) { return responderErro(erro, res, next); }
}

export async function atualizarStatus(req, res, next) {
  try {
    const ordemServico = await OrdemServicoService.atualizarStatus(req.params.id, req.body.status);
    return res.status(200).json({ sucesso: true, dados: ordemServico });
  } catch (erro) { return responderErro(erro, res, next); }
}

export async function concluir(req, res, next) {
  try {
    const ordemServico = await OrdemServicoService.concluir(req.params.id, req.body, req.usuario);
    return res.status(200).json({ sucesso: true, dados: ordemServico });
  } catch (erro) { return responderErro(erro, res, next); }
}
