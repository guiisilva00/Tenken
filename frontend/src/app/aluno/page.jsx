"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import FormularioVinculo from "@/components/aluno/FormularioVinculo";
import EstadoAguardando from "@/components/aluno/EstadoAguardando";
import EstadoLiberado from "@/components/aluno/EstadoLiberado";
import { ResumoAula } from "@/components/aluno/AulaContexto";
import { apiFetch } from "@/lib/api";
import { getUsuario } from "@/lib/session";
import styles from "./aluno.module.css";

export default function PaginaVinculacaoAluno() {
  const [etapa, setEtapa] = useState("LOADING");
  const consultando = useRef(false);
  const montado = useRef(false);
  const [solicitacao, setSolicitacao] = useState(null);
  const [equipamentos, setEquipamentos] = useState([]);
  const [mensagemAguardando, setMensagemAguardando] = useState("");
  const [erroFormulario, setErroFormulario] = useState("");
  const [validade, setValidade] = useState(null);

  async function enviarSolicitacao(token) {
    let resposta;
    try {
      resposta = await apiFetch("/api/alunos/solicitar-acesso", {
      method: "POST",
      body: { token },
      });
    } catch (erro) {
      if (erro.status !== 409) throw erro;
      await verificarCheckinAtual();
      return;
    }
    const usuario = getUsuario();
    setSolicitacao({
      nome: usuario?.nome || usuario?.matricula || "Aluno",
      turma: resposta.turma.nome,
      token,
    });
    setMensagemAguardando("");
    setEtapa("WAITING");
    await verificarCheckinAtual();
  }

  function cancelarSolicitacao() {
    setSolicitacao(null);
    setMensagemAguardando("");
    setEtapa("FORM");
  }

  const verificarCheckinAtual = useCallback(async () => {
    if (consultando.current) return;
    consultando.current = true;
    try {
      const resposta = await apiFetch("/api/checkins/atual", { cache: "no-store" });
      if (!montado.current) return;
      const dados = resposta?.dados;
      const usuario = getUsuario();
      setSolicitacao((atual) => ({
        ...atual,
        nome: atual?.nome || usuario?.nome || usuario?.matricula || "Aluno",
        turma: dados?.turma?.nome || atual?.turma || "Turma",
        token: dados?.agendamento?.token || "",
        agendamento: dados?.agendamento,
        equipamentos: dados?.equipamentos,
      }));
      setValidade(Date.now() + dados.segundos_restantes * 1000);

      if (!dados?.aprovado) {
        setMensagemAguardando("");
        setEtapa("WAITING");
        return;
      }

      const equipamentosLiberados = (dados.equipamentos || []).map((equipamento) => ({
        id: equipamento.codigo_patrimonio || String(equipamento.id),
        tipo: "Equipamento do laborat\u00f3rio",
        nome: equipamento.nome,
        detalhe: equipamento.localizacao ? "Localiza\u00e7\u00e3o: " + equipamento.localizacao : "Localiza\u00e7\u00e3o n\u00e3o informada",
      }));
      setEquipamentos(equipamentosLiberados);
      setSolicitacao((atual) => ({ ...atual, turma: dados.turma?.nome || atual?.turma }));
      setMensagemAguardando("");
      setEtapa("APPROVED");
    } catch (erro) {
      if (!montado.current) return;
      if (erro.status === 404) {
        setErroFormulario("Não há solicitação válida para uma reserva ativa. Peça ao professor o token da reserva atual para solicitar acesso.");
        setSolicitacao(null);
        setMensagemAguardando("");
        setEtapa("FORM");
        setValidade(null);
        return;
      }
      setMensagemAguardando(erro.message || "N\u00e3o foi poss\u00edvel verificar sua solicita\u00e7\u00e3o agora.");
      setEtapa((atual) => atual === "LOADING" ? "ERROR" : atual);
    } finally {
      consultando.current = false;
    }
  }, []);

  useEffect(() => {
    montado.current = true;
    const motivo = new URLSearchParams(window.location.search).get("motivo");
    if (motivo) setErroFormulario(motivo === "pendente"
      ? "Seu acesso ainda aguarda aprovação do professor."
      : "Você precisa de uma aprovação válida para uma reserva ativa. Solicite o token ao professor.");
    verificarCheckinAtual();
    return () => { montado.current = false; };
  }, [verificarCheckinAtual]);

  useEffect(() => {
    if (validade === null) return;
    const timer = window.setTimeout(() => {
      setEtapa("LOADING");
      verificarCheckinAtual();
    }, Math.max(0, validade - Date.now()) + 1000);
    return () => window.clearTimeout(timer);
  }, [validade, verificarCheckinAtual]);

  return (
    <main className={styles.pagina}>
      <div className={`${styles.conteudo} ${styles.compacto}`}>
        {etapa === "LOADING" && <p role="status">Consultando sua solicitação de acesso…</p>}
        {etapa === "ERROR" && <section><p role="alert">{mensagemAguardando}</p><button type="button" onClick={verificarCheckinAtual}>Tentar novamente</button></section>}
        {solicitacao?.agendamento && etapa !== "FORM" && <ResumoAula agendamento={solicitacao.agendamento} />}
        {etapa === "FORM" && (
          <section className={styles.formulario}>
            <Link className={styles.voltarLogin} href="/login">
              Voltar para login
            </Link>
            <h1 className={styles.titulo}>Acesso à bancada do laboratório</h1>
            <p className={styles.descricao}>
              O token é fornecido pelo professor responsável. Peça a ele o token da sua reserva.
              Cada token corresponde a uma reserva específica de turma, equipamento e horário
              e só é válido durante o período ativo do agendamento.
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
        {etapa === "APPROVED" && solicitacao && (
          <><EstadoLiberado sessao={solicitacao} equipamentos={equipamentos} />
            {mensagemAguardando && <div><p role="alert">{mensagemAguardando}</p><button type="button" onClick={verificarCheckinAtual}>Tentar novamente</button></div>}
          </>
        )}
      </div>
    </main>
  );
}
