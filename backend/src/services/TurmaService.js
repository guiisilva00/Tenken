import * as TurmaModel from "../models/TurmaModel.js";
import * as UsuarioModel from "../models/UsuarioModel.js";

export async function listarPorProfessor(professorId) {
  const turmas = await TurmaModel.listarPorProfessor(professorId);
  return turmas.map((turma) => ({ ...turma, alunos: Number(turma.alunos) }));
}

export async function listarTodas() {
  const turmas = await TurmaModel.listarTodas();
  return turmas.map((turma) => ({ ...turma, alunos: Number(turma.alunos) }));
}

export async function criar({ nome, professor_id } = {}) {
  const nomeLimpo = typeof nome === "string" ? nome.trim() : "";
  if (!nomeLimpo || nomeLimpo.length > 100) {
    throw new TypeError("Informe um nome de turma com até 100 caracteres.");
  }
  const professorId = Number(professor_id);
  if (!Number.isInteger(professorId) || professorId <= 0) {
    throw new TypeError("Selecione um professor válido.");
  }
  const professor = await UsuarioModel.buscarPorId(professorId);
  if (!professor || professor.perfil !== "PROFESSOR" || !professor.ativo) {
    throw new TypeError("O responsável deve ser um professor ativo.");
  }
  const id = await TurmaModel.criar({
    nome: nomeLimpo,
    professor_id: professorId,
  });
  return {
    id,
    nome: nomeLimpo,
    professor_id: professorId,
    professor_nome: professor.nome,
    alunos: 0,
  };
}
