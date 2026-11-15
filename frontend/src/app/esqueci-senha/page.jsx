"use client";

import Link from "next/link";
import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import styles from "@/components/auth/authForm.module.css";
import { apiFetch } from "@/lib/api";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviarFormulario(event) {
    event.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await apiFetch("/api/usuarios/esqueci-senha", { method: "POST", body: { email } });
      setEnviado(true);
    } catch (error) {
      setErro(error.message || "Não foi possível processar a solicitação.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout title="Esqueci minha senha" subtitle="Enviaremos instruções para redefinir sua senha">
      <Link className={styles.backHome} href="/login">← Voltar para login</Link>
      {enviado ? (
        <p className={styles.success} role="status">Se o e-mail estiver cadastrado, você receberá as instruções.</p>
      ) : (
        <form className={styles.form} onSubmit={enviarFormulario}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">E-mail da conta</label>
            <input className={styles.input} id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          {erro && <p className={styles.alert} role="alert">{erro}</p>}
          <button className={styles.button} type="submit" disabled={enviando}>{enviando ? "Enviando..." : "Enviar instruções"}</button>
        </form>
      )}
    </AuthLayout>
  );
}
