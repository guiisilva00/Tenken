"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import styles from "./page.module.css";
import { chamarApi } from "../lib/adminApi";
import { useModalExit } from "../../useModalExit";
import FeedbackModal from "../components/FeedbackModal";

const STATUS = [
  "ABERTO",
  "EM_ATENDIMENTO",
  "AGUARDANDO_PECAS",
  "CONCLUIDO",
  "CANCELADO",
];

const SEVERIDADES = ["BAIXA", "MEDIA", "ALTA", "CRITICA"];
const ITENS_POR_PAGINA = 10;

const ROTULO_STATUS = {
  ABERTO: "Aberto",
  EM_ATENDIMENTO: "Em Atendimento",
  AGUARDANDO_PECAS: "Aguardando Peças",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

function normalizarStatus(status) {
  return String(status ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}

function podeEmitirOS(status) {
  return !["EM_ATENDIMENTO", "AGUARDANDO_PECAS", "CONCLUIDO", "CANCELADO"].includes(
    normalizarStatus(status),
  );
}

export default function PaginaChamados() {
  return <AdminLayout>{({ token }) => <Conteudo token={token} />}</AdminLayout>;
}

function Conteudo({ token }) {
  const [itens, setItens] = useState([]);
  const [tiposEquipamento, setTiposEquipamento] = useState({});
  const [status, setStatus] = useState("");
  const [severidade, setSeveridade] = useState("");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notificacao, setNotificacao] = useState(null);
  const [
    selecionado,
    setSelecionado,
    fechandoDetalhes,
    finalizarFechamentoDetalhes,
  ] = useModalExit(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ pagina: "1", limite: "100" });
      if (status) q.set("status", status);
      if (severidade) q.set("severidade", severidade);
      const [data, equipamentos] = await Promise.all([
        chamarApi(`/chamados?${q}`, token),
        chamarApi("/equipamentos?pagina=1&limite=100", token).catch(() => []),
      ]);
      setItens(data.dados ?? data ?? []);
      setTiposEquipamento(
        Object.fromEntries(
          (equipamentos.dados ?? equipamentos ?? []).map((equipamento) => [
            equipamento.id,
            equipamento.tipo,
          ]),
        ),
      );
    } catch (e) {
      setNotificacao({ tipo: "erro", mensagem: e.message });
    } finally {
      setLoading(false);
    }
  }, [token, status, severidade]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    setPagina(1);
  }, [busca, status, severidade]);

  async function atualizarStatus(item, value) {
    try {
      await chamarApi(`/chamados/${item.id}/status`, token, {
        method: "PATCH",
        body: { status: value },
      });
      setSelecionado((atual) =>
        atual?.id === item.id ? { ...atual, status: value } : atual,
      );
      setNotificacao({
        tipo: "sucesso",
        mensagem: `Status do chamado #${item.id} atualizado para ${value}.`,
      });
      await carregar();
    } catch (e) {
      setNotificacao({ tipo: "erro", mensagem: e.message });
    }
  }

  async function emitirOS(item) {
    if (!podeEmitirOS(item.status)) return;
    try {
      const os = await chamarApi(`/chamados/${item.id}/ordem-servico`, token, {
        method: "POST",
        body: {},
      });
      setSelecionado(null);
      setNotificacao({
        tipo: "sucesso",
        mensagem: `Ordem de serviço ${os.numero ?? os.id} criada e enviada ao painel do técnico.`,
      });
      await carregar();
    } catch (e) {
      setNotificacao({ tipo: "erro", mensagem: e.message });
    }
  }

  const filtrados = itens.filter((item) => {
    const termo =
      `${item.titulo} ${item.equipamento_nome ?? ""} ${item.id}`.toLowerCase();
    return termo.includes(busca.toLowerCase());
  });
  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / ITENS_POR_PAGINA),
  );
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const chamadosPagina = filtrados.slice(inicio, inicio + ITENS_POR_PAGINA);

  return (
    <div className={styles.container}>
      {/* Top Utility Bar */}
      <div className={styles.topUtilityBar}>
        <div className={styles.headerTitleBlock}>
          <h1 className={styles.title}>Chamados e Ordens de Serviço</h1>
          <p className={styles.subtitle}>
            Acompanhe problemas relatados nos equipamentos e atualize o
            andamento do atendimento.
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshBtn}
          onClick={carregar}
          aria-label="Atualizar lista"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "18px", color: "var(--accent-tertiary)" }}
          >
            refresh
          </span>
          <span className={styles.refreshLabel}>Atualizar lista</span>
        </button>
      </div>

      {/* Filters inspired by the Stitch work order screen */}
      <div className={styles.filterBar}>
        <div className={styles.filterTopRow}>
          <div className={styles.searchBox}>
            <span className={`material-symbols-outlined ${styles.searchIcon}`}>
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por título, equipamento ou número..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className={styles.searchInput}
            />
            {busca && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => setBusca("")}
                aria-label="Limpar busca"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Severidade:</span>
            <button
              type="button"
              className={`${styles.filterPill} ${!severidade ? styles.filterPillActive : ""}`}
              onClick={() => setSeveridade("")}
            >
              Todas
            </button>
            {SEVERIDADES.map((value) => (
              <button
                key={value}
                type="button"
                className={`${styles.filterPill} ${severidade === value ? styles.filterPillActive : ""}`}
                onClick={() => setSeveridade(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.filterBottomRow}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Status:</span>
            <button
              type="button"
              className={`${styles.filterPill} ${!status ? styles.filterPillActive : ""}`}
              onClick={() => setStatus("")}
            >
              Todos
            </button>
            {STATUS.map((value) => (
              <button
                key={value}
                type="button"
                className={`${styles.filterPill} ${status === value ? styles.filterPillActive : ""}`}
                onClick={() => setStatus(value)}
              >
                {ROTULO_STATUS[value] || value}
              </button>
            ))}
          </div>
          <span className={styles.resultsCount}>
            Exibindo <strong>{filtrados.length}</strong> itens
          </span>
        </div>
      </div>

      <div className={styles.ticketList}>
        {chamadosPagina.map((item) => {
          const tipoEquipamento = tiposEquipamento[item.equipamento_id];
          const iconeEquipamento =
            tipoEquipamento === "BANCADA"
              ? "table_restaurant"
              : tipoEquipamento === "ROBO"
                ? "smart_toy"
                : "precision_manufacturing";
          const severidadeAtual = String(item.severidade || "").toUpperCase();
          const severidadeClass =
            severidadeAtual === "CRITICA"
              ? styles.sevCritica
              : severidadeAtual === "ALTA"
                ? styles.sevAlta
                : severidadeAtual === "MEDIA"
                  ? styles.sevMedia
                  : styles.sevBaixa;
          const statusClass =
            item.status === "CONCLUIDO"
              ? styles.statusDone
              : item.status === "EM_ATENDIMENTO"
                ? styles.statusActive
                : item.status === "AGUARDANDO_PECAS"
                  ? styles.statusParts
                  : item.status === "CANCELADO"
                    ? styles.statusCancelled
                    : styles.statusWaiting;
          const dataAbertura = item.aberto_em
            ? new Date(item.aberto_em).toLocaleString("pt-BR")
            : "Data não informada";

          return (
            <article key={item.id} className={styles.ticketCard}>
              <span className={`${styles.ticketAccent} ${severidadeClass}`} />
              <div className={styles.ticketIdentity}>
                <div className={styles.ticketIcon}>
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    {iconeEquipamento}
                  </span>
                </div>
                <div className={styles.ticketIdBlock}>
                  <strong className={styles.ticketCode}>
                    #CH-{String(item.id).padStart(4, "0")}
                  </strong>
                  <span className={styles.ticketPlace}>
                    Equipamento #{item.equipamento_id}
                  </span>
                </div>
              </div>
              <div className={styles.ticketDetails}>
                <span className={styles.ticketEquipment}>
                  <span className="material-symbols-outlined">token</span>
                  {item.equipamento_nome ||
                    `Equipamento #${item.equipamento_id}`}
                </span>
                <h2 className={styles.ticketTitle}>{item.titulo}</h2>
                <div className={styles.ticketMeta}>
                  <span>
                    <span className="material-symbols-outlined">
                      account_circle
                    </span>
                    Solicitante #{item.solicitante_id ?? "—"}
                  </span>
                  <span>
                    <span className="material-symbols-outlined">schedule</span>
                    {dataAbertura}
                  </span>
                </div>
              </div>
              <div className={styles.ticketActions}>
                <div className={styles.ticketBadges}>
                  <span className={`${styles.sevBadge} ${severidadeClass}`}>
                    <span className={styles.sevDot} />
                    {item.severidade}
                  </span>
                  <span className={`${styles.statusBadge} ${statusClass}`}>
                    {ROTULO_STATUS[item.status] || item.status}
                  </span>
                </div>
                {!["CANCELADO", "CONCLUIDO", "AGUARDANDO_PECAS"].includes(
                  item.status,
                ) && (
                  <button
                    type="button"
                    className={styles.openTicketBtn}
                    onClick={() => setSelecionado(item)}
                  >
                    Abrir{" "}
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </button>
                )}
              </div>
            </article>
          );
        })}
        {loading ? (
          <div className={styles.emptyState}>Carregando chamados...</div>
        ) : filtrados.length === 0 ? (
          <div className={styles.emptyState}>Nenhum chamado encontrado.</div>
        ) : null}
      </div>
      <div className={styles.listFooter}>
        <span>
          Exibindo{" "}
          <strong>
            {filtrados.length === 0 ? 0 : inicio + 1}–
            {Math.min(inicio + ITENS_POR_PAGINA, filtrados.length)}
          </strong>{" "}
          de <strong>{filtrados.length}</strong> chamados
        </span>
        <nav
          className={styles.paginationButtons}
          aria-label="Paginação dos chamados"
        >
          <button
            type="button"
            className={styles.pageBtn}
            disabled={paginaAtual === 1}
            onClick={() => setPagina(paginaAtual - 1)}
            aria-label="Página anterior"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
            (numero) => (
              <button
                key={numero}
                type="button"
                className={`${styles.pageBtn} ${numero === paginaAtual ? styles.pageBtnActive : ""}`}
                aria-current={numero === paginaAtual ? "page" : undefined}
                onClick={() => setPagina(numero)}
              >
                {numero}
              </button>
            ),
          )}
          <button
            type="button"
            className={styles.pageBtn}
            disabled={paginaAtual === totalPaginas}
            onClick={() => setPagina(paginaAtual + 1)}
            aria-label="Próxima página"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </nav>
      </div>
      {selecionado && (
        <div
          className={`${styles.modalOverlay} abrir-modal-fundo ${fechandoDetalhes ? "fechar-modal-fundo" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ticket-detail-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelecionado(null);
          }}
        >
          <section
            className={`${styles.modalCard} abrir-modal ${fechandoDetalhes ? "fechar-modal" : ""}`}
            onAnimationEnd={finalizarFechamentoDetalhes}
          >
            <header className={styles.modalHeader}>
              <div className={styles.modalHeading}>
                <div className={styles.modalIcon}>
                  <span className="material-symbols-outlined">
                    assignment_late
                  </span>
                </div>
                <div>
                  <div className={styles.modalBadges}>
                    <strong className={styles.modalCode}>
                      #CH-{String(selecionado.id).padStart(4, "0")}
                    </strong>
                    <span
                      className={`${styles.sevBadge} ${String(selecionado.severidade).toUpperCase() === "CRITICA" ? styles.sevCritica : String(selecionado.severidade).toUpperCase() === "ALTA" ? styles.sevAlta : String(selecionado.severidade).toUpperCase() === "MEDIA" ? styles.sevMedia : styles.sevBaixa}`}
                    >
                      {selecionado.severidade}
                    </span>
                    <span
                      className={`${styles.statusBadge} ${selecionado.status === "CONCLUIDO" ? styles.statusDone : selecionado.status === "EM_ATENDIMENTO" ? styles.statusActive : selecionado.status === "AGUARDANDO_PECAS" ? styles.statusParts : selecionado.status === "CANCELADO" ? styles.statusCancelled : styles.statusWaiting}`}
                    >
                      {ROTULO_STATUS[selecionado.status] || selecionado.status}
                    </span>
                  </div>
                  <span className={styles.modalEyebrow}>
                    Ficha técnica do chamado
                  </span>
                </div>
              </div>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setSelecionado(null)}
                aria-label="Fechar detalhes"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>
            <div className={styles.modalBody}>
              <div className={styles.modalMetaGrid}>
                <div>
                  <span>Equipamento</span>
                  <strong>
                    {selecionado.equipamento_nome ||
                      `Equipamento #${selecionado.equipamento_id}`}
                  </strong>
                </div>
                <div>
                  <span>Solicitante</span>
                  <strong>Usuário #{selecionado.solicitante_id ?? "—"}</strong>
                </div>
                <div>
                  <span>Abertura</span>
                  <strong>
                    {selecionado.aberto_em
                      ? new Date(selecionado.aberto_em).toLocaleString("pt-BR")
                      : "Data não informada"}
                  </strong>
                </div>
              </div>
              <section className={styles.modalDescription}>
                <span>Descrição técnica</span>
                <h2 id="ticket-detail-title">{selecionado.titulo}</h2>
                <p>
                  {selecionado.descricao ||
                    "Nenhuma descrição adicional foi informada."}
                </p>
              </section>
              <div className={styles.modalActionPanel}>
                <div className={styles.modalActionHeader}>
                  <div>
                    <span className={styles.modalEyebrow}>
                      Ações de atendimento
                    </span>
                    <h3>Atualização e ordem de serviço</h3>
                  </div>
                  <label className={styles.statusControl}>
                    <span>Status</span>
                    <select
                      aria-label={`Status do chamado ${selecionado.id}`}
                      className={styles.statusSelect}
                      value={selecionado.status}
                      onChange={(e) =>
                        atualizarStatus(selecionado, e.target.value)
                      }
                    >
                      {STATUS.map((value) => (
                        <option key={value} value={value}>
                          {ROTULO_STATUS[value] || value}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className={styles.modalActions}>
                  {podeEmitirOS(selecionado.status) && (
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                      onClick={() => emitirOS(selecionado)}
                    >
                      <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                      >
                        build_circle
                      </span>
                      Emitir ordem de serviço (OS)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
      <FeedbackModal
        feedback={notificacao}
        onClose={() => setNotificacao(null)}
      />
    </div>
  );
}
