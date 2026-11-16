"use client";

import { createContext, useContext } from "react";

export const AulaContexto = createContext(null);
export const useAulaAtual = () => useContext(AulaContexto);

export function ResumoAula({ agendamento }) {
  if (!agendamento) return null;
  const formatar = (valor) => new Date(valor).toLocaleString("pt-BR");
  return (
    <div>
      <p><strong>Atividade:</strong> {agendamento.atividade || "Não informada"}</p>
      <p><strong>Início:</strong> {formatar(agendamento.inicio)}</p>
      <p><strong>Término:</strong> {formatar(agendamento.fim)}</p>
    </div>
  );
}
