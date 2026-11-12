"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import styles from "./page.module.css";
import EmptyState from "@/components/EmptyState";

const STATUS = [
  ["ABERTO", "Aberto"],
  ["EM_ATENDIMENTO", "Em atendimento"],
];
const SEVERIDADES = [["CRITICA", "Crítica"], ["ALTA", "Alta"], ["MEDIA", "Média"], ["BAIXA", "Baixa"]];
const ROTULO_STATUS = Object.fromEntries(STATUS);
const ROTULO_SEVERIDADE = Object.fromEntries(SEVERIDADES);
const STATUS_ORDEM_POR_CHAMADO = {
  ABERTO: "EMITIDA",
  EM_ATENDIMENTO: "EM_EXECUCAO",
  CANCELADO: "CANCELADA",
};

function formatarData(valor) {
  if (!valor) return "Data não informada";
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "Data não informada" : data.toLocaleDateString("pt-BR");
}

export default function PaginaChamadosTecnico() {
  const [chamados, setChamados] = useState([]);
  const [status, setStatus] = useState("");
  const [severidade, setSeveridade] = useState("");
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);
  const [descricaoServico, setDescricaoServico] = useState("");
  const [pecasTrocadas, setPecasTrocadas] = useState("");
  const [custoServico, setCustoServico] = useState("");
  const [historico, setHistorico] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [aviso, setAviso] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const params = new URLSearchParams({ pagina: "1", limite: "100" });
      if (status) params.set("status", status);
      if (severidade) params.set("severidade", severidade);
      const resposta = await apiFetch(`/api/ordens-servico?${params}`);
      const ordens = Array.isArray(resposta?.dados) ? resposta.dados : [];
      const ordensExibidas = ordens.filter((ordem) => !["CONCLUIDO", "CANCELADO"].includes(ordem.chamado_status));
      setChamados(ordensExibidas.map((ordem) => ({
        ...ordem,
        os_id: ordem.id,
        os_numero: ordem.numero,
        os_status: ordem.status,
        id: ordem.chamado_id,
        status: ordem.chamado_status,
      })));
    } catch (error) {
      setErro(error.message || "Não foi possível carregar os chamados.");
    } finally {
      setCarregando(false);
    }
  }, [status, severidade]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    const intervalo = window.setInterval(carregar, 30000);
    const atualizarAoVoltar = () => {
      if (document.visibilityState === "visible") carregar();
    };
    window.addEventListener("focus", atualizarAoVoltar);
    document.addEventListener("visibilitychange", atualizarAoVoltar);
    return () => {
      window.clearInterval(intervalo);
      window.removeEventListener("focus", atualizarAoVoltar);
      document.removeEventListener("visibilitychange", atualizarAoVoltar);
    };
  }, [carregar]);

  function abrirDetalhes(chamado) {
    setChamadoSelecionado(chamado);
    setDescricaoServico("");
    setPecasTrocadas("");
    setCustoServico("");
    setHistorico([]);
    setCarregandoHistorico(true);
    setErro("");
    setAviso("");
    apiFetch(`/api/chamados/${chamado.id}/historico`)
      .then((resposta) => setHistorico(Array.isArray(resposta?.dados) ? resposta.dados : []))
      .catch((error) => setErro(error.message || "Não foi possível carregar o histórico."))
      .finally(() => setCarregandoHistorico(false));
  }

  async function atualizarStatus(novoStatus) {
    if (!chamadoSelecionado || atualizandoStatus) return;
    setAtualizandoStatus(true);
    setErro("");
    setAviso("");
    try {
      const resposta = await apiFetch(`/api/chamados/${chamadoSelecionado.id}/status`, {
        method: "PATCH",
        body: { status: novoStatus },
      });
      const chamadoAtualizado = resposta?.dados ?? { ...chamadoSelecionado, status: novoStatus };
      const statusOrdem = STATUS_ORDEM_POR_CHAMADO[novoStatus];
      setChamadoSelecionado((atual) => ({
        ...atual,
        ...chamadoAtualizado,
        ...(statusOrdem ? { os_status: statusOrdem } : {}),
      }));
      setChamados((atuais) => atuais.map((chamado) =>
        chamado.id === chamadoAtualizado.id
          ? { ...chamado, ...chamadoAtualizado, ...(statusOrdem ? { os_status: statusOrdem } : {}) }
          : chamado,
      ));
      setAviso("Status do chamado atualizado.");
    } catch (error) {
      setErro(error.message || "Não foi possível atualizar o chamado.");
    } finally {
      setAtualizandoStatus(false);
    }
  }

  async function concluirOrdem() {
    if (!chamadoSelecionado || atualizandoStatus) return;
    setAtualizandoStatus(true);
    setErro("");
    setAviso("");
    try {
      await apiFetch(`/api/ordens-servico/${chamadoSelecionado.os_id}/concluir`, {
        method: "POST",
        body: { descricao: descricaoServico, pecas_trocadas: pecasTrocadas, custo: custoServico === "" ? 0 : Number(custoServico) },
      });
      setChamados((atuais) => atuais.filter((chamado) => chamado.os_id !== chamadoSelecionado.os_id));
      setChamadoSelecionado(null);
      setDescricaoServico("");
      setAviso("Ordem de serviço concluída com sucesso.");
    } catch (error) {
      setErro(error.message || "Não foi possível concluir a ordem de serviço.");
    } finally {
      setAtualizandoStatus(false);
    }
  }

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return chamados;
    return chamados.filter((chamado) =>
      [chamado.os_numero, chamado.id, chamado.titulo, chamado.descricao, chamado.equipamento_id, chamado.tipo]
        .some((valor) => String(valor ?? "").toLocaleLowerCase("pt-BR").includes(termo)),
    );
  }, [busca, chamados]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.sobretitulo}>Atendimento técnico</p>
          <h1 className={styles.titulo}>Ordens de Serviço</h1>
          <p className={styles.descricao}>Consulte as ordens de serviços atribuídos a você e acompanhe suas prioridades.</p>
        </div>
        <button type="button" className={styles.atualizar} onClick={carregar} disabled={carregando}>
          <span className={`material-symbols-outlined ${carregando ? styles.girando : ""}`}>sync</span>
          {carregando ? "Atualizando" : "Atualizar"}
        </button>
      </header>

      <section className={styles.filtros} aria-label="Filtros dos chamados">
        <label className={styles.busca}>
          <span className="material-symbols-outlined" aria-hidden="true">search</span>
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar chamado, equipamento ou descrição" />
        </label>
        <label className={styles.filtro}>
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos</option>
            {STATUS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className={styles.filtro}>
          <span>Prioridade</span>
          <select value={severidade} onChange={(e) => setSeveridade(e.target.value)}>
            <option value="">Todas</option>
            {SEVERIDADES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </section>

      {erro && !chamadoSelecionado && <p className={styles.erro} role="alert">{erro}</p>}
      {aviso && !chamadoSelecionado && <p className={styles.aviso} role="status">{aviso}</p>}
      <p className={styles.contagem}>{carregando ? "Carregando ordens de serviço…" : `${filtrados.length} ordens de serviço encontradas`}</p>

      {!carregando && !erro && filtrados.length === 0 && (
        <EmptyState
          icone="inbox"
          titulo={chamados.length ? "Nenhum resultado para esses filtros" : "Nenhuma OS recebida"}
          mensagem={chamados.length ? "Tente alterar a busca ou os filtros." : "Ordens de serviço emitidas pelo administrador para seus chamados aparecerão aqui."}
        />
      )}

      <section className={styles.lista} aria-label="Lista de chamados">
        {filtrados.map((chamado) => {
          const prioridade = String(chamado.severidade || "").toUpperCase();
          const statusAtual = String(chamado.status || "").toUpperCase();
          return (
            <article className={styles.cartao} key={chamado.os_id}>
              <div className={styles.cartaoTopo}>
                <span className={`${styles.prioridade} ${styles[`prioridade_${prioridade.toLowerCase()}`] || ""}`}>
                  {ROTULO_SEVERIDADE[prioridade] || "Prioridade não informada"}
                </span>
                <span className={`${styles.status} ${styles[`status_${statusAtual.toLowerCase()}`] || ""}`}>
                  {chamado.os_numero || `OS #${chamado.os_id}`} · {chamado.os_status}
                </span>
              </div>
              <h2 className={styles.tituloChamado}>{chamado.titulo || `Chamado #${chamado.id}`}</h2>
              <p className={styles.resumo}>{chamado.descricao || "Sem descrição informada."}</p>
              <div className={styles.detalhes}>
                <span><strong>Chamado</strong> #{String(chamado.id).padStart(4, "0")}</span>
                <span><strong>Equipamento</strong> {chamado.equipamento_nome || (chamado.equipamento_id ? `#${chamado.equipamento_id}` : "Não informado")}</span>
                <span><strong>Aberto em</strong> {formatarData(chamado.aberto_em)}</span>
              </div>
              <button type="button" className={styles.botaoDetalhes} onClick={() => abrirDetalhes(chamado)}>
                Resolver OS
                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </button>
            </article>
          );
        })}
      </section>

      {chamadoSelecionado && (
        <div
          className={styles.modalFundo}
          role="presentation"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) setChamadoSelecionado(null);
          }}
        >
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="titulo-detalhes-chamado">
            <header className={styles.modalCabecalho}>
              <div>
                <p className={styles.sobretitulo}>Resolução da ordem de serviço</p>
                <h2 className={styles.modalTitulo} id="titulo-detalhes-chamado">
                  {chamadoSelecionado.titulo || `Chamado #${chamadoSelecionado.id}`}
                </h2>
              </div>
              <button type="button" className={styles.fecharModal} onClick={() => setChamadoSelecionado(null)} aria-label="Fechar detalhes">
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </header>
            {erro && <p className={styles.erro} role="alert">{erro}</p>}
            {aviso && <p className={styles.aviso} role="status">{aviso}</p>}
            <div className={styles.modalEtiquetas}>
              <span className={`${styles.prioridade} ${styles[`prioridade_${String(chamadoSelecionado.severidade || "").toLowerCase()}`] || ""}`}>
                {ROTULO_SEVERIDADE[chamadoSelecionado.severidade] || "Prioridade não informada"}
              </span>
              <span className={`${styles.status} ${styles[`status_${String(chamadoSelecionado.status || "").toLowerCase()}`] || ""}`}>
            {chamadoSelecionado.status === "AGUARDANDO_PECAS" ? "Em atendimento" : ROTULO_STATUS[chamadoSelecionado.status] || chamadoSelecionado.status}
              </span>
            </div>
            <dl className={styles.modalDados}>
              <div>
                <dt>Equipamento</dt>
                <dd>{chamadoSelecionado.equipamento_nome || `Equipamento #${chamadoSelecionado.equipamento_id}`}</dd>
              </div>
              <div>
                <dt>Tipo de manutenção</dt>
                <dd>{chamadoSelecionado.tipo === "PREVENTIVO" ? "Preventiva" : "Corretiva"}</dd>
              </div>
              <div>
                <dt>Aberto em</dt>
                <dd>{formatarData(chamadoSelecionado.aberto_em)}</dd>
              </div>
            </dl>
            <div className={styles.modalDescricao}>
              <h3>Descrição</h3>
              <p>{chamadoSelecionado.descricao || "Sem descrição informada."}</p>
            </div>
            <div className={styles.historico}>
              <h3>Histórico de manutenção</h3>
              {carregandoHistorico ? <p>Carregando histórico…</p> : historico.length === 0 ? <p>Nenhum serviço registrado anteriormente.</p> : (
                <ul>{historico.map((item) => (
                  <li key={item.id}>
                    <strong>{formatarData(item.registrado_em)}</strong>
                    <span>{item.descricao}</span>
                    {item.pecas_trocadas && <small>Peças: {item.pecas_trocadas}</small>}
                    {Number(item.custo) > 0 && <small>Custo: {Number(item.custo).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</small>}
                  </li>
                ))}</ul>
              )}
            </div>
            {chamadoSelecionado.status === "ABERTO" && (
              <div className={styles.modalAcoes}>
                <button type="button" className={styles.botaoAcao} onClick={() => atualizarStatus("EM_ATENDIMENTO")} disabled={atualizandoStatus}>
                  {atualizandoStatus ? "Atualizando..." : "Iniciar atendimento"}
                </button>
              </div>
            )}
            {["EM_ATENDIMENTO", "AGUARDANDO_PECAS"].includes(chamadoSelecionado.status) && (
              <div className={styles.modalAcoes}>
                <label className={styles.campoDescricaoServico}>
                  <span>Descrição do serviço realizado</span>
                  <textarea value={descricaoServico} onChange={(evento) => setDescricaoServico(evento.target.value)} rows={5} placeholder="Descreva o serviço realizado" required />
                </label>
                <label className={styles.campoComplementar}>
                  <span>Peças trocadas (opcional)</span>
                  <input value={pecasTrocadas} onChange={(evento) => setPecasTrocadas(evento.target.value)} placeholder="Ex.: cabo USB, fusível" />
                </label>
                <label className={styles.campoComplementar}>
                  <span>Custo do serviço (R$)</span>
                  <input type="number" min="0" step="0.01" value={custoServico} onChange={(evento) => setCustoServico(evento.target.value)} placeholder="0,00" />
                </label>
                <button type="button" className={styles.botaoAcao} onClick={concluirOrdem} disabled={atualizandoStatus || !descricaoServico.trim()}>
                  {atualizandoStatus ? "Concluindo..." : "Concluir ordem de serviço"}
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
