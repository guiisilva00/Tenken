import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import * as AlunoModel from "../models/AlunoModel.js";
import * as TurmaModel from "../models/TurmaModel.js";
import * as AgendamentoModel from "../models/AgendamentoModel.js";
import { validarTokenTurma } from "../utils/Token.js";

const MAX_TENTATIVAS_MATRICULA = 5;

export async function buscarArea(alunoId) {
  return AlunoModel.buscarArea(Number(alunoId));
}

function erroComStatus(mensagem, status) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

function erroDeValidacao(errors) {
  const erro = new TypeError(
    errors[0]?.message || "Confira os dados informados.",
  );
  erro.errors = errors;
  return erro;
}

function gerarCodigoMatricula() {
  return `MAT-${randomBytes(8).toString("hex").toUpperCase()}`;
}

export async function solicitarAcesso(token, alunoId) {
  if (!validarTokenTurma(token)) throw erroComStatus("Token invalido.", 400);
  const agendamento = await AgendamentoModel.buscarPorTokenAtivo(token);
  if (!agendamento) throw erroComStatus("Token nao encontrado ou agendamento inativo.", 404);
  if (!(await AlunoModel.pertenceATurma(agendamento.turma_id, alunoId))) {
    throw erroComStatus("Aluno nao pertence a esta turma.", 403);
  }

  try {
    await AlunoModel.criarCheckin(agendamento.id, alunoId);
  } catch (erro) {
    if (erro.code === "ER_DUP_ENTRY") throw erroComStatus("Solicitacao ja registrada.", 409);
    throw erro;
  }

  return {
    status: "AGUARDANDO_APROVACAO",
    turma: { id: agendamento.turma_id, nome: agendamento.turma },
  };
}

export async function gerarMatricula(body = {}) {
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const cpf = typeof body.cpf === "string" ? body.cpf.trim() : "";
  const telefone =
    typeof body.telefone === "string" ? body.telefone.trim() : "";
  const errors = [];

  if (!nome) errors.push({ field: "nome", message: "Nome é obrigatório" });
  if (!email && !cpf) {
    errors.push({ field: "email", message: "Informe email ou CPF" });
    errors.push({ field: "cpf", message: "Informe email ou CPF" });
  }
  for (const campo of ["email", "cpf", "telefone"]) {
    if (body[campo] != null && typeof body[campo] !== "string") {
      errors.push({
        field: campo,
        message: `${campo === "email" ? "Email" : campo === "cpf" ? "CPF" : "Telefone"} deve ser um texto`,
      });
    }
  }
  if (errors.length) throw erroDeValidacao(errors);

  for (
    let tentativa = 1;
    tentativa <= MAX_TENTATIVAS_MATRICULA;
    tentativa += 1
  ) {
    const matricula = gerarCodigoMatricula();
    try {
      await AlunoModel.criarPreMatricula({
        nome,
        email,
        cpf,
        telefone: telefone || null,
        matricula,
      });
      return { matricula, nome };
    } catch (erro) {
      if (erro.code !== "ER_DUP_ENTRY") throw erro;
      const detalhe =
        `${erro.sqlMessage ?? ""} ${erro.message ?? ""}`.toLowerCase();
      if (detalhe.includes("matricula")) {
        if (tentativa < MAX_TENTATIVAS_MATRICULA) continue;
        throw erroComStatus(
          "Não foi possível gerar uma matrícula única. Tente novamente.",
          409,
        );
      }
      throw erroComStatus(
        "Já existe uma solicitação de matrícula para estes dados.",
        409,
      );
    }
  }
}

export async function cadastrarAluno(body = {}) {
  const { matricula, senha, confirmarSenha } = body;
  const errors = [];
  if (typeof matricula !== "string" || !matricula.trim()) {
    errors.push({ field: "matricula", message: "Matrícula é obrigatória" });
  }
  if (typeof senha !== "string" || senha.length < 8) {
    errors.push({
      field: "senha",
      message: "A senha deve ter no mínimo 8 caracteres",
    });
  }
  if (typeof confirmarSenha !== "string" || confirmarSenha !== senha) {
    errors.push({
      field: "confirmarSenha",
      message: "A confirmação deve ser igual à senha",
    });
  }
  if (errors.length) throw erroDeValidacao(errors);

  const senhaHash = await bcrypt.hash(senha, 12);
  try {
    return await AlunoModel.cadastrar({
      matricula: matricula.trim(),
      senhaHash,
    });
  } catch (erro) {
    if (erro.code === "ER_DUP_ENTRY") {
      throw erroComStatus(
        "Não foi possível concluir o cadastro com os dados informados.",
        409,
      );
    }
    throw erro;
  }
}
