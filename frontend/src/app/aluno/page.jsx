"use client";

import { useState } from "react";
import FormularioVinculo from "@/components/aluno/FormularioVinculo";
import EstadoAguardando from "@/components/aluno/EstadoAguardando";
import { apiFetch } from "@/lib/api";
import { getUsuario } from "@/lib/session";
import styles from "./aluno.module.css";

export default function PaginaVinculacaoAluno() {
  const [etapa, setEtapa] = useState("FORM");
  const [solicitacao, setSolicitacao] = useState(null);

  async function enviarSolicitacao(token) {
    const resposta = await apiFetch("/api/alunos/solicitar-acesso", {
      method: "POST",
      body: { token },
    });
    const usuario = getUsuario();
    setSolicitacao({
      nome: usuario?.nome || usuario?.matricula || "Aluno",
      turma: resposta.turma.nome,
      token,
    });
    setEtapa("WAITING");
  }

  function cancelarSolicitacao() {
    setSolicitacao(null);
    setEtapa("FORM");
  }

  return (
    <main className={styles.pagina}>
      <div className={`${styles.conteudo} ${styles.compacto}`}>
        {etapa === "FORM" && (
          <section className={styles.formulario}>
            <h1 className={styles.titulo}>Acesso à bancada do laboratório</h1>
            <p className={styles.descricao}>
              Informe o token compartilhado pelo professor para solicitar acesso aos ativos da aula.
            </p>
            <FormularioVinculo onEnviar={enviarSolicitacao} />
          </section>
        )}
        {etapa === "WAITING" && solicitacao && (
          <EstadoAguardando
            sessao={solicitacao}
            token={solicitacao.token}
            onCancelar={cancelarSolicitacao}
          />
        )}
      </div>
    </main>
  );
}
