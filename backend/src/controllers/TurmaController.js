import * as TurmaService from "../services/TurmaService.js";

export async function listar(req, res, next) {
  try {
    const turmas =
      req.usuario.perfil === "ADMIN"
        ? await TurmaService.listarTodas()
        : await TurmaService.listarPorProfessor(Number(req.usuario.id));
    return res.status(200).json({ sucesso: true, dados: turmas });
  } catch (erro) {
    return next(erro);
  }
}

export async function criar(req, res, next) {
  try {
    const turma = await TurmaService.criar(req.body);
    return res.status(201).json({ sucesso: true, dados: turma });
  } catch (erro) {
    return next(erro);
  }
}
