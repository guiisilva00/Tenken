"use client";

import { useState } from "react";
import authForm from "@/components/auth/authForm.module.css";
import styles from "./FormularioVinculo.module.css";

const mensagemTokenInvalido =
  "Token inválido. Use o código no formato TNK-XXXX informado pelo professor.";

export default function FormularioVinculo({ onEnviar }) {
  const [token, setToken] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    if (!/^TNK-[A-Z0-9]{4}$/.test(token)) {
      setErro(mensagemTokenInvalido);
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      await onEnviar(token);
    } catch (error) {
      setErro(error.message || "Não foi possível enviar a solicitação. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  function editar(evento) {
    setToken(evento.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 8));
    if (erro) setErro("");
  }

  return (
    <form className={authForm.form} onSubmit={enviar} noValidate>
      <div className={authForm.field}>
        <label className={authForm.label} htmlFor="token-aula">Token da aula</label>
        <input
          className={`${authForm.input} ${styles.tokenInput}`}
          id="token-aula"
          name="token"
          type="text"
          placeholder="TNK-XXXX"
          maxLength={8}
          required
          autoComplete="one-time-code"
          value={token}
          onChange={editar}
          aria-invalid={Boolean(erro)}
          aria-describedby={erro ? "token-aula-erro" : undefined}
        />
      </div>
      {erro && <p className={authForm.alert} id="token-aula-erro" role="alert">{erro}</p>}
      <button className={authForm.button} type="submit" disabled={enviando}>
        {enviando ? "Enviando..." : "Solicitar acesso à bancada"}
      </button>
    </form>
  );
}
