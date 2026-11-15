import * as UsuarioService from "../services/UsuarioService.js";

export async function login(req, res, next) {
  try {
    const sessao = await UsuarioService.login(req.body);
    return res.status(200).json({ sucesso: true, dados: sessao });
  } catch (erro) {
    return next(erro);
  }
}

export async function redefinirSenha(req, res, next) {
  try {
    await UsuarioService.redefinirSenha(req.body);
    return res
      .status(200)
      .json({ sucesso: true, dados: { mensagem: "Senha atualizada." } });
  } catch (erro) {
    return next(erro);
  }
}

export async function me(req, res, next) {
  try {
    const usuario = await UsuarioService.buscarSessao(req.usuario.id);
    return res.status(200).json({ sucesso: true, dados: { usuario } });
  } catch (erro) {
    return next(erro);
  }
}

export async function listar(req, res, next) {
  try {
    const resultado = await UsuarioService.listar(req.query);
    return res.status(200).json({
      sucesso: true,
      dados: resultado.usuarios,
      paginacao: resultado.paginacao,
    });
  } catch (erro) {
    return next(erro);
  }
}

export async function atualizarPerfil(req, res, next) {
  try {
    const usuario = await UsuarioService.atualizarPerfil(
      req.params.id,
      req.body.perfil,
    );
    return res.status(200).json({ sucesso: true, dados: usuario });
  } catch (erro) {
    return next(erro);
  }
}

export async function atualizarDados(req, res, next) {
  try {
    const usuario = await UsuarioService.atualizarDados(
      req.params.id,
      req.body,
    );
    return res.status(200).json({ sucesso: true, dados: usuario });
  } catch (erro) {
    if (erro.code === "ER_DUP_ENTRY") {
      erro.status = 409;
      erro.message = "E-mail ou matrícula já cadastrados.";
    }
    return next(erro);
  }
}

export async function atualizarAtivo(req, res, next) {
  try {
    const usuario = await UsuarioService.atualizarAtivo(
      req.params.id,
      req.body.ativo,
    );
    return res.status(200).json({ sucesso: true, dados: usuario });
  } catch (erro) {
    return next(erro);
  }
}
