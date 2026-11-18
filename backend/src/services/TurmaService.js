import * as TurmaModel from "../models/TurmaModel.js";
import * as UsuarioModel from "../models/UsuarioModel.js";
import { validarId } from "../utils/ValidarId.js";

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

export async function atualizar(idRecebido, { nome, professor_id } = {}) {
  const id = validarId(idRecebido);
  const nomeLimpo = typeof nome === "string" ? nome.trim() : "";
  if (!nomeLimpo || nomeLimpo.length > 100) throw new TypeError("Informe um nome de turma com até 100 caracteres.");
  const professorId = Number(professor_id);
  const professor = Number.isInteger(professorId) && professorId > 0 ? await UsuarioModel.buscarPorId(professorId) : null;
  if (!professor || professor.perfil !== "PROFESSOR" || !professor.ativo) throw new TypeError("O responsável deve ser um professor ativo.");
  if (!(await TurmaModel.buscarPorId(id))) throw new Error(`Turma ${id} não encontrada.`);
  await TurmaModel.atualizar(id, { nome: nomeLimpo, professor_id: professorId });
  return { id, nome: nomeLimpo, professor_id: professorId, professor_nome: professor.nome };
}

export async function excluir(idRecebido) {
  const id = validarId(idRecebido);
  if (!(await TurmaModel.excluir(id))) throw new Error(`Turma ${id} não encontrada.`);
}
