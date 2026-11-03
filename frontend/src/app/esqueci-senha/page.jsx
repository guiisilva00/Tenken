"use client";

import { useState } from "react";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import styles from "@/components/auth/authForm.module.css";
import { apiFetch } from "@/lib/api";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(false);

  async function enviarFormulario(event) {
    event.preventDefault();
    setEnviando(true);
    setErro(false);

    try {
      await apiFetch("/api/usuarios/esqueci-senha", {
        method: "POST",
        body: { email },
      });
      setEnviado(true);
    } catch {
      setErro(true);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout title="Esqueci minha senha" subtitle="Informe seu e-mail para receber instruções">
      {enviado ? (
        <p className={styles.success} role="status">
          Se o e-mail estiver cadastrado, você receberá as instruções
        </p>
      ) : (
        <form className={styles.form} onSubmit={enviarFormulario}>
          {erro && <p className={styles.alert} role="alert">Não foi possível enviar as instruções agora. Tente novamente.</p>}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">E-mail</label>
            <input
              className={styles.input}
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <button className={styles.button} type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar instruções"}
          </button>
        </form>
      )}
      <p className={styles.linkRow}>
        <Link className={styles.linkStrong} href="/login">Voltar para o login</Link>
      </p>
    </AuthLayout>
  );
}
