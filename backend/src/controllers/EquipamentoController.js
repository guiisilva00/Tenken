import * as EquipamentoService from "../services/EquipamentoService.js";

export async function listar(req, res, next) {
  try {
    const resultado = await EquipamentoService.listar(req.query);
    return res.status(200).json({
      sucesso: true,
      dados: resultado.equipamentos,
      paginacao: resultado.paginacao,
    });
  } catch (erro) {
    return next(erro);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const equipamento = await EquipamentoService.buscarPorId(req.params.id);
    return res.status(200).json({ sucesso: true, dados: equipamento });
  } catch (erro) {
    return next(erro);
  }
}

export async function criar(req, res, next) {
  try {
    const equipamento = await EquipamentoService.criar(req.body);
    return res.status(201).json({ sucesso: true, dados: equipamento });
  } catch (erro) {
    return next(erro);
  }
}

export async function atualizar(req, res, next) {
  try {
    const equipamento = await EquipamentoService.atualizar(
      req.params.id,
      req.body,
    );
    return res.status(200).json({ sucesso: true, dados: equipamento });
  } catch (erro) {
    return next(erro);
  }
}

export async function atualizarStatus(req, res, next) {
  try {
    const equipamento = await EquipamentoService.atualizarStatus(
      req.params.id,
      req.body.status,
    );
    return res.status(200).json({ sucesso: true, dados: equipamento });
  } catch (erro) {
    return next(erro);
  }
}

export async function excluir(req, res, next) {
  try {
    await EquipamentoService.inativar(req.params.id);
    return res.status(204).send();
  } catch (erro) {
    return next(erro);
  }
}
