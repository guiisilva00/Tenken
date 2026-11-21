import { rateLimit } from "express-rate-limit";

export function criarLimitadorTaxa({ windowMs, max, mensagem }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler(request, response) {
      response.status(429).json({ sucesso: false, erro: mensagem });
    },
  });
}

export const limitadorAtivacaoPreCadastro = criarLimitadorTaxa({
  windowMs: 15 * 60 * 1000,
  max: 3,
  mensagem: "Muitas tentativas de ativação. Tente novamente em 15 minutos.",
});

export const limitadorLogin = criarLimitadorTaxa({
  windowMs: 15 * 60 * 1000,
  max: 10,
  mensagem: "Muitas tentativas de login. Tente novamente em 15 minutos.",
});

export const limitadorCadastroAluno = criarLimitadorTaxa({
  windowMs: 15 * 60 * 1000,
  max: 10,
  mensagem: "Muitas tentativas de cadastro. Tente novamente em 15 minutos.",
});

export const limitadorRedefinicaoSenha = criarLimitadorTaxa({
  windowMs: 15 * 60 * 1000,
  max: 5,
  mensagem: "Muitas solicitações. Tente novamente em 15 minutos.",
});
