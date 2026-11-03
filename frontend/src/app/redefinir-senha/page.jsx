"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import styles from "@/components/auth/authForm.module.css";
import { apiFetch } from "@/lib/api";

function RedefinirSenhaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [erroConfirmacao, setErroConfirmacao] = useState("");
  const [erroToken, setErroToken] = useState(!token);
  const [erroServidor, setErroServidor] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviarFormulario(event) {
    event.preventDefault();
    setErroSenha(senha.length < 8 ? "A senha deve ter pelo menos 8 caracteres." : "");
    setErroConfirmacao(senha !== confirmarSenha ? "As senhas não coincidem." : "");

    if (!token || senha.length < 8 || senha !== confirmarSenha) {
      if (!token) setErroToken(true);
      return;
    }

    setEnviando(true);
    setErroToken(false);
    try {
      await apiFetch("/api/usuarios/redefinir-senha", {
        method: "POST",
        body: { token, senha, confirmarSenha },
      });
      router.replace("/login");
    } catch (error) {
      if ([400, 404, 410].includes(error.status)) setErroToken(true);
      else setErroServidor(true);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout title="Redefinir senha" subtitle="Escolha uma nova senha para sua conta">
      {erroToken ? (
        <div className={styles.form}>
          <p className={styles.alert} role="alert">Este link expirou. Peça um novo.</p>
          <p className={styles.linkRow}><Link className={styles.linkStrong} href="/esqueci-senha">Solicitar novo link</Link></p>
        </div>
      ) : (
        <form className={styles.form} onSubmit={enviarFormulario} noValidate>
          {erroServidor && <p className={styles.alert} role="alert">Não foi possível redefinir a senha agora. Tente novamente.</p>}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="senha">Nova senha</label>
            <input
              className={`${styles.input} ${erroSenha ? styles.inputError : ""}`}
              id="senha"
              name="senha"
              type="password"
              value={senha}
              onChange={(event) => {
                setSenha(event.target.value);
                setErroSenha(event.target.value.length < 8 ? "A senha deve ter pelo menos 8 caracteres." : "");
                if (confirmarSenha) setErroConfirmacao(event.target.value !== confirmarSenha ? "As senhas não coincidem." : "");
              }}
              aria-invalid={Boolean(erroSenha)}
            />
            {erroSenha && <span className={styles.fieldError}>{erroSenha}</span>}
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirmarSenha">Confirmar senha</label>
            <input
              className={`${styles.input} ${erroConfirmacao ? styles.inputError : ""}`}
              id="confirmarSenha"
              name="confirmarSenha"
              type="password"
              value={confirmarSenha}
              onChange={(event) => {
                setConfirmarSenha(event.target.value);
                setErroConfirmacao(senha !== event.target.value ? "As senhas não coincidem." : "");
              }}
              aria-invalid={Boolean(erroConfirmacao)}
            />
            {erroConfirmacao && <span className={styles.fieldError}>{erroConfirmacao}</span>}
          </div>
          <button className={styles.button} type="submit" disabled={enviando}>
            {enviando ? "Salvando..." : "Redefinir senha"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={null}>
      <RedefinirSenhaContent />
    </Suspense>
  );
}
