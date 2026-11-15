"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import FormularioVinculo from "@/components/aluno/FormularioVinculo";
import styles from "../aluno.module.css";

export default function PaginaAcessoAluno() {
  const router = useRouter();
  const [step, setStep] = useState("FORM");
  const compacto = step !== "APPROVED";

  useEffect(() => {
    if (step === "APPROVED") {
      window.sessionStorage.setItem("tenken-aluno-bancada-liberada", "true");
      router.replace("/aluno/diagnostico");
    }
  }, [step, router]);

  function enviarSolicitacao() {
    setStep("APPROVED");
  }

  return (
    <AuthGuard>
      <main className={styles.pagina}>
        <div
          className={`${styles.conteudo} ${compacto ? styles.compacto : styles.largo}`}
        >
          {step === "FORM" && (
            <section className={styles.formulario}>
              <p className={styles.eyebrow}>Vinculação de sessão</p>
              <h1 className={styles.titulo}>Acesso à bancada do laboratório</h1>
              <p className={styles.descricao}>
                Insira seu nome, turma e o token compartilhado pelo professor
                para solicitar acesso aos ativos da aula.
              </p>
              <FormularioVinculo onEnviar={enviarSolicitacao} />
            </section>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
