"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import styles from "@/components/auth/authForm.module.css";
import { apiFetch } from "@/lib/api";
import { saveSession } from "@/lib/session";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [alerta, setAlerta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const cadastroConcluido = searchParams.get("cadastro") === "ok";

  async function enviarFormulario(event) {
    event.preventDefault();
    setAlerta("");
    setEnviando(true);

    try {
      const resultado = await apiFetch("/api/usuarios/login", {
        method: "POST",
        body: { matricula: matricula.trim().toUpperCase(), senha },
      });

      saveSession(resultado.token, resultado.usuario);
      router.replace("/dashboard");
    } catch (error) {
      const mensagens = {
        401: "Matrícula ou senha inválidas",
        403: "Conta inativa. Procure a coordenação.",
      };
      setAlerta(mensagens[error.status] ?? "Não foi possível entrar agora. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout title="Entrar" subtitle="Acesse com sua matrícula e senha">
      {cadastroConcluido && <p className={styles.success}>Conta criada. Faça login.</p>}
      <form className={styles.form} onSubmit={enviarFormulario}>
        {alerta && <p className={styles.alert} role="alert">{alerta}</p>}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="matricula">Matrícula</label>
          <input
            className={styles.input}
            id="matricula"
            name="matricula"
            type="text"
            placeholder="MAT-XXXXX"
            required
            value={matricula}
            onChange={(event) => {
              setMatricula(event.target.value);
              setAlerta("");
            }}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="senha">Senha</label>
          <input
            className={styles.input}
            id="senha"
            name="senha"
            type="password"
            value={senha}
            onChange={(event) => {
              setSenha(event.target.value);
              setAlerta("");
            }}
          />
        </div>
        <p style={{ margin: "-12px 0 0", textAlign: "right" }}>
          <Link href="/esqueci-senha" style={{ color: "var(--silver)" }}>Esqueci minha senha</Link>
        </p>

        <button className={styles.button} type="submit" disabled={enviando}>
          {enviando ? "Entrando" : "Entrar"}
        </button>
        <p className={styles.linkRow}>
          Ainda não tem matrícula? <Link className={styles.linkStrong} href="/cadastro">Cadastre-se</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
