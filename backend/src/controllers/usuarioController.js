import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";

import { pool } from "../config/database.js";
import * as UsuarioService from "../services/usuarioService.js";

export async function login(request, response, next) {
  const { matricula, senha } = request.body ?? {};

  if (typeof matricula !== "string" || !matricula.trim() || typeof senha !== "string" || !senha) {
    return response.status(400).json({
      message: "Matrícula e senha são obrigatórias",
    });
  }

  try {
    const [usuarios] = await pool.execute(
      `SELECT id, nome, perfil, matricula, senha_hash, ativo
       FROM usuarios
       WHERE matricula = ?
       LIMIT 1`,
      [matricula.trim()],
    );

    const usuario = usuarios[0];
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
      return response.status(401).json({ message: "Matrícula ou senha inválidas" });
    }

    if (!usuario.ativo) {
      return response.status(403).json({ message: "Usuário inativo" });
    }

    const token = jwt.sign(
      { perfil: usuario.perfil, matricula: usuario.matricula },
      process.env.JWT_SECRET,
      {
        subject: String(usuario.id),
        expiresIn: process.env.JWT_EXPIRES_IN || "8h",
      },
    );

    return response.status(200).json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        perfil: usuario.perfil,
        matricula: usuario.matricula,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function solicitarRedefinicaoSenha(request, response, next) {
  const email = typeof request.body?.email === "string" ? request.body.email.trim().toLowerCase() : "";
  if (!email) return response.status(400).json({ message: "Informe um e-mail válido" });

  try {
    const [usuarios] = await pool.execute(
      "SELECT id, email FROM usuarios WHERE email = ? LIMIT 1",
      [email],
    );
    if (!usuarios.length) {
      return response.status(200).json({ message: "Se o e-mail estiver cadastrado, você receberá as instruções" });
    }

    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      return response.status(503).json({ message: "Serviço de e-mail indisponível" });
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await pool.execute(
      "INSERT INTO tokens_redefinicao_senha (usuario_id, token_hash, expira_em) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 HOUR)) ON DUPLICATE KEY UPDATE token_hash = VALUES(token_hash), expira_em = VALUES(expira_em)",
      [usuarios[0].id, tokenHash],
    );

    const link = new URL("/redefinir-senha", process.env.FRONTEND_URL || "http://localhost:3000");
    link.searchParams.set("token", token);
    const envio = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [email],
        subject: "Redefinição de senha Tenken",
        html: `<p>Use o link abaixo para redefinir sua senha. Ele expira em uma hora.</p><p><a href="${link.href}">Redefinir senha</a></p>`,
      }),
    });
    if (!envio.ok) throw new Error("Falha ao enviar e-mail de redefinição");

    return response.status(200).json({ message: "Se o e-mail estiver cadastrado, você receberá as instruções" });
  } catch (error) {
    return next(error);
  }
}

export async function redefinirSenha(request, response, next) {
  const { token, senha, confirmarSenha } = request.body ?? {};
  const errors = [];
  if (typeof token !== "string" || !token) errors.push({ field: "token", message: "Token obrigatório" });
  if (typeof senha !== "string" || senha.length < 8) errors.push({ field: "senha", message: "A senha deve ter no mínimo 8 caracteres" });
  if (typeof confirmarSenha !== "string" || confirmarSenha !== senha) errors.push({ field: "confirmarSenha", message: "A confirmação deve ser igual à senha" });
  if (errors.length) return response.status(400).json({ message: "Dados inválidos", errors });

  try {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const [tokens] = await pool.execute(
      "SELECT usuario_id FROM tokens_redefinicao_senha WHERE token_hash = ? AND expira_em > UTC_TIMESTAMP() LIMIT 1",
      [tokenHash],
    );
    if (!tokens.length) return response.status(410).json({ message: "Token inválido ou expirado" });

    const senhaHash = await bcrypt.hash(senha, 12);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute("UPDATE usuarios SET senha_hash = ? WHERE id = ?", [senhaHash, tokens[0].usuario_id]);
      await connection.execute("DELETE FROM tokens_redefinicao_senha WHERE usuario_id = ?", [tokens[0].usuario_id]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return response.status(200).json({ message: "Senha redefinida" });
  } catch (error) {
    return next(error);
  }
}

function responderErro(erro, res, next) {
  if (erro instanceof TypeError) {
    return res.status(400).json({ sucesso: false, erro: erro.message });
  }
  if (erro.message.includes("não encontrado")) {
    return res.status(404).json({ sucesso: false, erro: erro.message });
  }
  return next(erro);
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
    return responderErro(erro, res, next);
  }
}

export async function atualizarPerfil(req, res, next) {
  try {
    const usuario = await UsuarioService.atualizarPerfil(req.params.id, req.body.perfil);
    return res.status(200).json({ sucesso: true, dados: usuario });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function atualizarAtivo(req, res, next) {
  try {
    const usuario = await UsuarioService.atualizarAtivo(req.params.id, req.body.ativo);
    return res.status(200).json({ sucesso: true, dados: usuario });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}
