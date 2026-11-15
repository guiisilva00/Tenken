import { validarId } from "../utils/ValidarId.js";
import bcrypt from "bcrypt";

import * as PreCadastroStaffModel from "../models/PreCadastroStaffModel.js";

const PERFIS_VALIDOS = ["PROFESSOR", "TECNICO"];
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function gerarCodigo(perfil) {
  const prefixo = perfil === "PROFESSOR" ? "PROF" : "TEC";
  const sufixo = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
  return `${prefixo}-${sufixo}`;
}

export async function listar() {
  return await PreCadastroStaffModel.listar();
}

export async function criar({ nome, email, perfil }) {
  const nomeLimpo = typeof nome === "string" ? nome.trim() : "";
  const emailLimpo =
    typeof email === "string" ? email.trim().toLowerCase() : "";

  if (nomeLimpo.length < 3) {
    throw new TypeError("Nome deve ter no mínimo 3 caracteres.");
  }
  if (!REGEX_EMAIL.test(emailLimpo)) {
    throw new TypeError("Informe um e-mail válido.");
  }
  if (!PERFIS_VALIDOS.includes(perfil)) {
    throw new TypeError(`Perfil deve ser um de: ${PERFIS_VALIDOS.join(", ")}.`);
  }

  for (let tentativa = 1; tentativa <= 5; tentativa += 1) {
    const codigo = gerarCodigo(perfil);
    try {
      return await PreCadastroStaffModel.criar({
        nome: nomeLimpo,
        email: emailLimpo,
        perfil,
        codigo,
      });
    } catch (erro) {
      if (
        erro.code === "ER_DUP_ENTRY" &&
        erro.sqlMessage?.includes("codigo") &&
        tentativa < 5
      ) {
        continue;
      }
      if (erro.code === "ER_DUP_ENTRY") {
        const erroConflito = new Error(
          "Já existe um pré-cadastro para este e-mail.",
        );
        erroConflito.status = 409;
        throw erroConflito;
      }
      throw erro;
    }
  }

  throw new Error("Não foi possível gerar um código único. Tente novamente.");
}

export async function revogar(idRecebido) {
  const id = validarId(idRecebido);
  const revogou = await PreCadastroStaffModel.revogar(id);
  if (!revogou) {
    throw new Error(`Pré-cadastro ${id} não encontrado ou já utilizado.`);
  }
}

export async function ativar({ codigo, senha, confirmarSenha }) {
  if (typeof codigo !== "string" || !codigo.trim()) {
    throw new TypeError("Código é obrigatório.");
  }
  if (typeof senha !== "string" || senha.length < 8) {
    throw new TypeError("A senha deve ter no mínimo 8 caracteres.");
  }
  if (confirmarSenha !== senha) {
    throw new TypeError("A confirmação deve ser igual à senha.");
  }

  const senhaHash = await bcrypt.hash(senha, 12);
  const resultado = await PreCadastroStaffModel.ativar(
    codigo.trim(),
    senhaHash,
  );

  if (resultado.status === "nao_encontrado") {
    throw new Error("Código não encontrado.");
  }
  if (resultado.status === "ja_utilizado") {
    const erroConflito = new Error("Este código já foi utilizado.");
    erroConflito.status = 409;
    throw erroConflito;
  }

  return resultado.usuario;
}
