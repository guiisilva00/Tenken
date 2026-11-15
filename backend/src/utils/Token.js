import { createHash, randomBytes, randomInt } from "node:crypto";

const CARACTERES_TOKEN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const FORMATO_TOKEN_TURMA = /^TNK-[A-Z0-9]{4}$/;
const TEMPO_RESET_MS = 30 * 60 * 1000;

export function gerarTokenTurma() {
  let sufixo = "";
  for (let indice = 0; indice < 4; indice += 1) {
    sufixo += CARACTERES_TOKEN[randomInt(CARACTERES_TOKEN.length)];
  }
  return `TNK-${sufixo}`;
}

export function validarTokenTurma(valor) {
  return typeof valor === "string" && FORMATO_TOKEN_TURMA.test(valor);
}

export function gerarTokenResetSenha() {
  return randomBytes(32).toString("hex");
}

export function hashTokenResetSenha(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function calcularExpiracaoResetSenha() {
  return new Date(Date.now() + TEMPO_RESET_MS);
}
