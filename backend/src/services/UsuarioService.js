import { validarId } from "../utils/ValidarId.js";
import * as UsuarioModel from "../models/UsuarioModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const { PERFIS_VALIDOS } = UsuarioModel;

export async function login({ matricula, senha } = {}) {
  const matriculaLimpa = typeof matricula === "string" ? matricula.trim() : "";
  if (!matriculaLimpa || typeof senha !== "string" || !senha)
    throw new TypeError("Matrícula e senha são obrigatórias.");
  const usuario = await UsuarioModel.buscarPorMatricula(matriculaLimpa);
  const senhaValida = usuario
    ? await bcrypt.compare(senha, usuario.senha_hash)
    : false;
  if (!usuario || !senhaValida) {
    const erro = new Error("Matrícula ou senha inválidas.");
    erro.status = 401;
    throw erro;
  }
  if (!usuario.ativo) {
    const erro = new Error("Usuário inativo.");
    erro.status = 403;
    throw erro;
  }
  const token = jwt.sign(
    { perfil: usuario.perfil, matricula: usuario.matricula },
    process.env.JWT_SECRET,
    {
      subject: String(usuario.id),
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    },
  );
  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      perfil: usuario.perfil,
      matricula: usuario.matricula,
    },
  };
}

export async function buscarSessao(idRecebido) {
  const id = validarId(idRecebido);
  const usuario = await UsuarioModel.buscarPorId(id);
  if (!usuario || !usuario.ativo) {
    const erro = new Error("Sessão inválida ou usuário inativo.");
    erro.status = 401;
    throw erro;
  }
  return usuario;
}

export async function redefinirSenha({ email, senha, confirmarSenha } = {}) {
  const emailLimpo =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
    throw new TypeError("Informe um e-mail válido.");
  }
  if (typeof senha !== "string" || senha.length < 8) {
    throw new TypeError("A senha deve ter no mínimo 8 caracteres.");
  }
  if (senha !== confirmarSenha) {
    throw new TypeError("A confirmação deve ser igual à senha.");
  }

  const usuario = await UsuarioModel.buscarPorEmail(emailLimpo);
  if (!usuario) {
    const erro = new Error("E-mail não encontrado.");
    erro.status = 404;
    throw erro;
  }

  const senhaHash = await bcrypt.hash(senha, 12);
  await UsuarioModel.atualizarSenha(usuario.id, senhaHash);
}

export async function listar({ pagina = 1, limite = 10, perfil, ativo } = {}) {
  const paginaNum = Number(pagina);
  const limiteNum = Number(limite);

  if (!Number.isInteger(paginaNum) || paginaNum <= 0) {
    throw new TypeError("Página deve ser um número inteiro positivo.");
  }
  if (!Number.isInteger(limiteNum) || limiteNum < 1 || limiteNum > 100) {
    throw new TypeError("Limite deve ser um inteiro entre 1 e 100.");
  }
  if (perfil !== undefined && !PERFIS_VALIDOS.includes(perfil)) {
    throw new TypeError(`Perfil deve ser um de: ${PERFIS_VALIDOS.join(", ")}.`);
  }

  const offset = (paginaNum - 1) * limiteNum;
  const ativoFiltro = ativo === undefined ? undefined : ativo === "true";
  const { usuarios, total } = await UsuarioModel.listar({
    limite: limiteNum,
    offset,
    perfil,
    ativo: ativoFiltro,
  });

  return {
    usuarios,
    paginacao: {
      pagina: paginaNum,
      limite: limiteNum,
      total,
      totalPaginas: Math.ceil(total / limiteNum),
    },
  };
}

export async function atualizarPerfil(idRecebido, perfil) {
  const id = validarId(idRecebido);
  if (!PERFIS_VALIDOS.includes(perfil)) {
    throw new TypeError(`Perfil deve ser um de: ${PERFIS_VALIDOS.join(", ")}.`);
  }
  const atualizou = await UsuarioModel.atualizarPerfil(id, perfil);
  if (!atualizou) {
    throw new Error(`Usuário ${id} não encontrado.`);
  }
  return await UsuarioModel.buscarPorId(id);
}

export async function atualizarAtivo(idRecebido, ativo) {
  const id = validarId(idRecebido);
  if (typeof ativo !== "boolean") {
    throw new TypeError("Ativo deve ser um valor booleano.");
  }
  const atualizou = await UsuarioModel.atualizarAtivo(id, ativo);
  if (!atualizou) {
    throw new Error(`Usuário ${id} não encontrado.`);
  }
  return await UsuarioModel.buscarPorId(id);
}

export async function atualizarDados(
  idRecebido,
  { nome, email, matricula, turmaIds } = {},
) {
  const id = validarId(idRecebido);
  const nomeLimpo = typeof nome === "string" ? nome.trim() : "";
  const emailLimpo = typeof email === "string" ? email.trim() : "";
  const matriculaLimpa = typeof matricula === "string" ? matricula.trim() : "";

  if (!nomeLimpo) throw new TypeError("Nome é obrigatório.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo))
    throw new TypeError("Informe um e-mail válido.");
  if (
    !Array.isArray(turmaIds) ||
    turmaIds.some(
      (turmaId) => !Number.isInteger(Number(turmaId)) || Number(turmaId) <= 0,
    )
  ) {
    throw new TypeError("Selecione turmas válidas.");
  }

  const usuarioAtual = await UsuarioModel.buscarPorId(id);
  if (!usuarioAtual || usuarioAtual.perfil !== "ALUNO") {
    const erro = new Error(`Aluno ${id} não encontrado.`);
    erro.status = 404;
    throw erro;
  }

  await UsuarioModel.atualizarDados(id, {
    nome: nomeLimpo,
    email: emailLimpo,
    matricula: matriculaLimpa || null,
    turmaIds: [...new Set(turmaIds.map(Number))],
  });

  const atualizado = await UsuarioModel.buscarPorId(id);
  atualizado.turmas = await UsuarioModel.listarTurmasDoAluno(id);
  return atualizado;
}
