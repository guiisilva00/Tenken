"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FormularioVinculo from "@/components/aluno/FormularioVinculo";
import EstadoAguardando from "@/components/aluno/EstadoAguardando";
import styles from "./aluno.module.css";

export default function PaginaVinculacaoAluno() {
  const router = useRouter();
  const [etapa, setEtapa] = useState("FORM");
  const [solicitacao, setSolicitacao] = useState(null);

  useEffect(() => {
    if (etapa !== "APPROVED") return;
    window.sessionStorage.setItem("tenken-aluno-bancada-liberada", "true");
    router.replace("/aluno/bem-vindo");
  }, [etapa, router]);

  function enviarSolicitacao(dados) {
    setSolicitacao(dados);
    setEtapa("WAITING");
  }

  return (
    <main className={styles.pagina}>
      <div className={`${styles.conteudo} ${styles.compacto}`}>
        {etapa === "FORM" && (
          <section className={styles.formulario}>
            <p className={styles.eyebrow}>VINCULAÇÃO DE SESSÃO</p>
            <h1 className={styles.titulo}>Acesso à bancada do laboratório</h1>
            <p className={styles.descricao}>
              Insira seu nome, turma e o token compartilhado pelo professor para
              solicitar acesso aos equipamentos da aula.
            </p>
            <FormularioVinculo onEnviar={enviarSolicitacao} />
          </section>
        )}
        {etapa === "WAITING" && solicitacao && (
          <EstadoAguardando
            sessao={solicitacao}
            token={solicitacao.token}
            onCancelar={() => setEtapa("FORM")}
            onSimularAprovacao={() => setEtapa("APPROVED")}
          />
        )}
      </div>
    </main>
  );
}
