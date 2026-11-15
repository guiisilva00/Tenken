"use client";

import Link from "next/link";
import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import styles from "@/components/auth/authForm.module.css";
import { apiFetch } from "@/lib/api";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function enviarFormulario(event) {
    event.preventDefault();
    setErro("");
    if (senha.length < 8)
      return setErro("A senha deve ter pelo menos 8 caracteres.");
    if (senha !== confirmarSenha) return setErro("As senhas não coincidem.");

    setSalvando(true);
    try {
      await apiFetch("/api/usuarios/redefinir-senha", {
        method: "POST",
        body: { email, senha, confirmarSenha },
      });
      setSalvo(true);
    } catch (error) {
      setErro(error.message || "Não foi possível atualizar a senha.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AuthLayout
      title="Redefinir senha"
      subtitle="Informe seu e-mail e escolha uma nova senha"
    >
      <Link className={styles.backHome} href="/login">
        <span aria-hidden="true">←</span> Voltar para login
      </Link>
      {salvo ? (
        <div className={styles.form}>
          <p className={styles.success} role="status">
            Senha atualizada. Você já pode entrar com a nova senha.
          </p>
          <Link className={styles.button} href="/login">
            Ir para login
          </Link>
        </div>
      ) : (
        <form className={styles.form} onSubmit={enviarFormulario}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              E-mail da conta
            </label>
            <input
              className={styles.input}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="senha">
              Nova senha
            </label>
            <input
              className={styles.input}
              id="senha"
              name="senha"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirmarSenha">
              Confirmar nova senha
            </label>
            <input
              className={styles.input}
              id="confirmarSenha"
              name="confirmarSenha"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmarSenha}
              onChange={(event) => setConfirmarSenha(event.target.value)}
              required
            />
          </div>
          {erro && (
            <p className={styles.alert} role="alert">
              {erro}
            </p>
          )}
          <button className={styles.button} type="submit" disabled={salvando}>
            {salvando ? "Atualizando..." : "Atualizar senha"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
