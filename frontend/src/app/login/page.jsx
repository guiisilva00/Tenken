"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import styles from "@/components/auth/authForm.module.css";
import { apiFetch } from "@/lib/api";
import { saveSession } from "@/lib/session";

function LoginContent() {
  const searchParams = useSearchParams();
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
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

      const destinosPorPerfil = {
        ALUNO: "/aluno",
        ADMIN: "/admin",
        PROFESSOR: "/professor",
        TECNICO: "/tecnico",
      };

      const destino = destinosPorPerfil[resultado.dados.usuario?.perfil];
      if (!destino) {
        setAlerta(
          "Esta conta não tem acesso ao login de usuários. Procure a coordenação.",
        );
        return;
      }

      saveSession(resultado.dados.token, resultado.dados.usuario);
      window.location.assign(destino);
    } catch (error) {
      const mensagens = {
        401: "Matrícula ou senha inválidas",
        403: "Conta inativa. Procure a coordenação.",
      };
      setAlerta(
        mensagens[error.status] ??
          "Não foi possível entrar agora. Tente de novo.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout title="Entrar" subtitle="Acesse com sua matrícula e senha">
      {cadastroConcluido && (
        <p className={styles.success}>Conta criada. Faça login.</p>
      )}
      <Link className={styles.backHome} href="/">
        <span aria-hidden="true">←</span> Início
      </Link>
      <form className={styles.form} onSubmit={enviarFormulario}>
        {alerta && (
          <p className={styles.alert} role="alert">
            {alerta}
          </p>
        )}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="matricula">
            Matrícula
          </label>
          <input
            className={styles.input}
            id="matricula"
            name="matricula"
            type="text"
            placeholder="Sua matrícula"
            value={matricula}
            onChange={(event) => {
              setMatricula(event.target.value);
              setAlerta("");
            }}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="senha">
            Senha
          </label>
          <div className={styles.passwordField}>
            <input
              className={`${styles.input} ${styles.passwordInput}`}
              id="senha"
              name="senha"
              type={mostrarSenha ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(event) => {
                setSenha(event.target.value);
                setAlerta("");
              }}
            />
            <button
              className={styles.passwordToggle}
              type="button"
              onClick={() => setMostrarSenha((visivel) => !visivel)}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={mostrarSenha}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {mostrarSenha ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>
        <p className={styles.linkAuxiliary}>
          <Link className={styles.linkStrong} href="/esqueci-senha">
            Esqueci minha senha
          </Link>
        </p>

        <button className={styles.button} type="submit" disabled={enviando}>
          {enviando ? "Entrando" : "Entrar"}
        </button>
        <p className={styles.linkRow}>
          Ainda não tem matrícula?{" "}
          <Link className={styles.linkStrong} href="/cadastro">
            Cadastre-se
          </Link>
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
