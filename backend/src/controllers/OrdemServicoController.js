import * as OrdemServicoService from "../services/OrdemServicoService.js";

export async function buscarPorId(req, res, next) {
  try {
    const ordemServico = await OrdemServicoService.buscarPorId(req.params.id);
    return res.status(200).json({ sucesso: true, dados: ordemServico });
  } catch (erro) {
    return next(erro);
  }
}

export async function listarParaTecnicos(req, res, next) {
  try {
    const ordens = await OrdemServicoService.listarParaTecnicos(
      req.usuario,
      req.query,
    );
    return res.status(200).json({ sucesso: true, dados: ordens });
  } catch (erro) {
    return next(erro);
  }
}

export async function atualizarStatus(req, res, next) {
  try {
    const ordemServico = await OrdemServicoService.atualizarStatus(
      req.params.id,
      req.body.status,
    );
    return res.status(200).json({ sucesso: true, dados: ordemServico });
  } catch (erro) {
    return next(erro);
  }
}

export async function concluir(req, res, next) {
  try {
    const ordemServico = await OrdemServicoService.concluir(
      req.params.id,
      req.body,
      req.usuario,
    );
    return res.status(200).json({ sucesso: true, dados: ordemServico });
  } catch (erro) {
    return next(erro);
  }
}
