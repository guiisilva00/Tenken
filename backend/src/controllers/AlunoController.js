import * as AlunoService from "../services/AlunoService.js";

export async function solicitarAcesso(req, res, next) {
  try {
    const resultado = await AlunoService.solicitarAcesso(
      req.body?.token,
      req.usuario.id,
    );
    return res.status(201).json(resultado);
  } catch (erro) {
    return next(erro);
  }
}

export async function gerarMatricula(req, res, next) {
  try {
    const resultado = await AlunoService.gerarMatricula(req.body);
    return res.status(201).json(resultado);
  } catch (erro) {
    return next(erro);
  }
}

export async function cadastrarAluno(req, res, next) {
  try {
    const resultado = await AlunoService.cadastrarAluno(req.body);
    return res.status(201).json(resultado);
  } catch (erro) {
    return next(erro);
  }
}
