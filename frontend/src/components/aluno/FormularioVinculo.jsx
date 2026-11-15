"use client";

import { useState } from "react";
import authForm from "@/components/auth/authForm.module.css";
import styles from "./FormularioVinculo.module.css";

const mensagemTokenInvalido =
  "Token inválido. Use os 6 números informados pelo professor.";

export default function FormularioVinculo({ onEnviar }) {
  const [nome, setNome] = useState("");
  const [turma, setTurma] = useState("");
  const [token, setToken] = useState("");
  const [erro, setErro] = useState("");
  const turmasDisponiveis = [
    "Automação Industrial - Turma 3B",
    "Robótica Aplicada - Turma 1A",
    "Mecatrônica - Turma 2C",
  ];

  function enviar(evento) {
    evento.preventDefault();

    if (!nome.trim() || !turma) {
      setErro("Preencha seu nome completo e selecione uma turma.");
      return;
    }

    if (!/^\d{6}$/.test(token)) {
      setErro(mensagemTokenInvalido);
      return;
    }

    setErro("");
    onEnviar({ nome: nome.trim(), turma, token });
  }

  function editar(evento) {
    setToken(evento.target.value.replace(/\D/g, "").slice(0, 6));
    if (erro) setErro("");
  }

  return (
    <form className={authForm.form} onSubmit={enviar} noValidate>
      <div className={authForm.field}>
        <label className={authForm.label} htmlFor="nome-aluno">
          Nome completo
        </label>
        <input
          className={`${authForm.input} ${styles.textInput}`}
          id="nome-aluno"
          name="nome"
          type="text"
          placeholder="Digite seu nome completo"
          value={nome}
          onChange={(evento) => {
            setNome(evento.target.value);
            setErro("");
          }}
          autoComplete="name"
          required
        />
      </div>
      <div className={authForm.field}>
        <label className={authForm.label} htmlFor="turma-aluno">
          Turma
        </label>
        <select
          className={`${authForm.input} ${styles.selectInput}`}
          id="turma-aluno"
          name="turma"
          value={turma}
          onChange={(evento) => {
            setTurma(evento.target.value);
            setErro("");
          }}
          required
        >
          <option value="">Selecione sua turma</option>
          {turmasDisponiveis.map((opcao) => (
            <option key={opcao} value={opcao}>
              {opcao}
            </option>
          ))}
        </select>
      </div>
      <div className={authForm.field}>
        <label className={authForm.label} htmlFor="token-aula">
          Token da aula
        </label>
        <input
          className={`${authForm.input} ${styles.tokenInput}`}
          id="token-aula"
          name="token"
          type="text"
          inputMode="numeric"
          maxLength={6}
          required
          autoComplete="one-time-code"
          value={token}
          onChange={editar}
          aria-invalid={Boolean(erro)}
          aria-describedby={erro ? "token-aula-erro" : undefined}
        />
      </div>

      {erro && (
        <p className={authForm.alert} id="token-aula-erro" role="alert">
          {erro}
        </p>
      )}

      <button className={authForm.button} type="submit">
        Solicitar acesso à bancada
      </button>
    </form>
  );
}
