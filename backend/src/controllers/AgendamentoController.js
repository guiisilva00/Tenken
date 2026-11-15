import * as Service from "../services/AgendamentoService.js";
export async function listar(req, res, next) {
  try {
    return res.json({
      sucesso: true,
      dados: await Service.listarPorProfessor(Number(req.usuario.id)),
    });
  } catch (e) {
    return next(e);
  }
}
export async function criar(req, res, next) {
  try {
    return res.status(201).json({
      sucesso: true,
      dados: await Service.criar(req.body, req.usuario),
    });
  } catch (e) {
    return next(e);
  }
}
export async function cancelar(req, res, next) {
  try {
    await Service.cancelar(req.params.id, Number(req.usuario.id));
    return res.status(204).send();
  } catch (e) {
    return next(e);
  }
}
