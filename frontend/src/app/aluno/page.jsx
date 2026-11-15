"use client";

import { useState } from "react";
import FormularioVinculo from "@/components/aluno/FormularioVinculo";
import EstadoAguardando from "@/components/aluno/EstadoAguardando";
import EstadoLiberado from "@/components/aluno/EstadoLiberado";
import { apiFetch } from "@/lib/api";
import { getUsuario } from "@/lib/session";
import styles from "./aluno.module.css";

export default function PaginaVinculacaoAluno() {
  const [etapa, setEtapa] = useState("FORM");
  const [solicitacao, setSolicitacao] = useState(null);
  const [equipamentos, setEquipamentos] = useState([]);
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

  async function verificarCheckinAtual() {
    try {
      const resposta = await apiFetch("/api/checkins/atual");
      const dados = resposta?.dados;
      if (!dados?.aprovado) {
        setMensagemAguardando("Ainda aguardando aprovação do professor.");
        return;
      }
      const equipamentosLiberados = (dados.equipamentos || []).map((equipamento) => ({
        id: equipamento.codigo_patrimonio || String(equipamento.id),
        tipo: "Equipamento do laboratório",
        nome: equipamento.nome,
        detalhe: equipamento.localizacao ? `Localização: ${equipamento.localizacao}` : "Localização não informada",
      }));
      setEquipamentos(equipamentosLiberados);
      setSolicitacao((atual) => ({ ...atual, turma: dados.turma?.nome || atual?.turma }));
      window.sessionStorage.setItem("tenken-aluno-bancada-liberada", "true");
      window.sessionStorage.setItem("tenken-aluno-equipamentos", JSON.stringify(dados.equipamentos || []));
      setMensagemAguardando("");
      setEtapa("APPROVED");
    } catch (erro) {
      if (erro.status === 404) {
        setErroFormulario("Não encontramos sua solicitação de acesso. Envie uma nova solicitação.");
        cancelarSolicitacao();
        return;
      }
      setMensagemAguardando(erro.message || "Não foi possível verificar sua solicitação agora.");
    }
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
          <EstadoLiberado sessao={solicitacao} equipamentos={equipamentos} />
        )}
      </div>
    </main>
  );
}
