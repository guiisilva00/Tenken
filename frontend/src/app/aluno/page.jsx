"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FormularioVinculo from "@/components/aluno/FormularioVinculo";
import EstadoAguardando from "@/components/aluno/EstadoAguardando";
import { apiFetch } from "@/lib/api";
import { getUsuario } from "@/lib/session";
import styles from "./aluno.module.css";

export default function PaginaVinculacaoAluno() {
  const router = useRouter();
  const [etapa, setEtapa] = useState("CHECKING");
  const [solicitacao, setSolicitacao] = useState(null);
  const [mensagemAguardando, setMensagemAguardando] = useState("");
  const [erroFormulario, setErroFormulario] = useState("");

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
    setMensagemAguardando("");
    setEtapa("WAITING");
  }

  function cancelarSolicitacao() {
    setSolicitacao(null);
    setMensagemAguardando("");
    setEtapa("FORM");
  }

  const verificarCheckinAtual = useCallback(async () => {
    try {
      const resposta = await apiFetch("/api/checkins/atual");
      const dados = resposta?.dados;
      const usuario = getUsuario();
      setSolicitacao((atual) => ({
        ...atual,
        nome: atual?.nome || usuario?.nome || usuario?.matricula || "Aluno",
        turma: dados?.turma?.nome || atual?.turma || "Turma",
        token: atual?.token || "",
      }));

      if (!dados?.aprovado) {
        setMensagemAguardando("");
        setEtapa("WAITING");
        return;
      }

      setMensagemAguardando("");
      router.replace("/aluno/bem-vindo");
    } catch (erro) {
      if (erro.status === 404) {
        setErroFormulario("Não encontramos sua solicitação de acesso. Envie uma nova solicitação.");
        setSolicitacao(null);
        setMensagemAguardando("");
        setEtapa("FORM");
        return;
      }
      setErroFormulario(
        erro.message || "Não foi possível verificar seu acesso agora. Tente novamente.",
      );
      setEtapa("FORM");
    }
  }, [router]);

  useEffect(() => {
    verificarCheckinAtual();
  }, [verificarCheckinAtual]);

  return (
    <main className={styles.pagina}>
      <div className={`${styles.conteudo} ${styles.compacto}`}>
        {etapa === "CHECKING" && (
          <p className={styles.verificando} role="status">
            Verificando seu acesso…
          </p>
        )}
        {etapa === "FORM" && (
          <section className={styles.formulario}>
            <Link className={styles.voltarLogin} href="/login">
              Voltar para login
            </Link>
            <h1 className={styles.titulo}>Acesso à bancada do laboratório</h1>
            <p className={styles.descricao}>
              Informe o token compartilhado pelo professor para solicitar acesso aos ativos da aula.
            </p>
            {erroFormulario && <p className={styles.erroFormulario} role="alert">{erroFormulario}</p>}
            <FormularioVinculo onEnviar={enviarSolicitacao} />
          </section>
        )}
        {etapa === "WAITING" && solicitacao && (
          <EstadoAguardando
            sessao={solicitacao}
            token={solicitacao.token}
            onCancelar={cancelarSolicitacao}
            mensagem={mensagemAguardando}
            onVerificar={verificarCheckinAtual}
          />
        )}
      </div>
    </main>
  );
}
