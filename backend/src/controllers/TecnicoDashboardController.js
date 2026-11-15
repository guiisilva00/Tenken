import * as TecnicoDashboardService from "../services/TecnicoDashboardService.js";

export async function gerar(req, res, next) {
  try {
    const dashboard = await TecnicoDashboardService.gerar(
      Number(req.usuario.id),
    );
    return res.status(200).json({ sucesso: true, dados: dashboard });
  } catch (erro) {
    return next(erro);
  }
}
