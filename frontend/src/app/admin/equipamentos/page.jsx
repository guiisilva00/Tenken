"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import TabelaAdmin from "../components/TabelaAdmin";
import styles from "./page.module.css";
import { chamarApi } from "../lib/adminApi";
import { useModalExit } from "../../useModalExit";
import FeedbackModal from "../components/FeedbackModal";

const STATUS = [
  "DISPONIVEL",
  "RESERVADO",
  "EM_USO",
  "EM_MANUTENCAO",
  "INATIVO",
];
const ROTULO_STATUS = {
  DISPONIVEL: "Operacional",
  RESERVADO: "Reservado",
  EM_USO: "Em Uso",
  EM_MANUTENCAO: "Em Manutenção",
  INATIVO: "Inativo",
};
const TOM_STATUS = {
  DISPONIVEL: "ok",
  EM_USO: "ok",
  RESERVADO: "neutro",
  EM_MANUTENCAO: "atencao",
  INATIVO: "inativo",
};
const TRANSICOES = {
  DISPONIVEL: [
    ["RESERVADO", "Reservar"],
    ["EM_USO", "Marcar em uso"],
    ["EM_MANUTENCAO", "Enviar p/ manutenção"],
  ],
  EM_USO: [
    ["DISPONIVEL", "Disponibilizar"],
    ["EM_MANUTENCAO", "Enviar p/ manutenção"],
  ],
  RESERVADO: [
    ["DISPONIVEL", "Disponibilizar"],
    ["EM_USO", "Marcar em uso"],
  ],
  EM_MANUTENCAO: [["DISPONIVEL", "Disponibilizar"]],
  INATIVO: [["DISPONIVEL", "Reativar"]],
};

const ITENS_POR_PAGINA = 10;

function gerarPatrimonioInicial() {
  return `PAT-2024-${Math.floor(100 + Math.random() * 899)}`;
}

export default function PaginaEquipamentos() {
  return <AdminLayout>{({ token }) => <Conteudo token={token} />}</AdminLayout>;
}

function Conteudo({ token }) {
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [pagina, setPagina] = useState(1);
  const [modalAberto, setModalAberto, fechandoModal, finalizarFechamentoModal] =
    useModalExit(false);
  const [form, setForm] = useState({
    codigo_patrimonio: gerarPatrimonioInicial(),
    nome: "",
    tipo: "BANCADA",
    localizacao: "",
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [menuStatusId, setMenuStatusId] = useState(null);
  const [historico, setHistorico] = useState([]);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const q = new URLSearchParams({ pagina: "1", limite: "100" });
      const dados = await chamarApi(`/equipamentos?${q}`, token);
      setItens(dados.dados ?? dados ?? []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    setPagina(1);
  }, [busca, statusFiltro, tipoFiltro]);

  // Contagem por status
  const contagemPorStatus = Object.fromEntries(
    STATUS.map((status) => [
      status,
      itens.filter((item) => item.status === status).length,
    ]),
  );

  // Métricas do topo (Stitch strip)
  const total = itens.length;
  const calcPct = (valor) => (total ? Math.round((valor / total) * 100) : 0);
  const metricas = [
    {
      rotulo: "Operacionais",
      valor: contagemPorStatus.DISPONIVEL + contagemPorStatus.EM_USO,
      pct: calcPct(contagemPorStatus.DISPONIVEL + contagemPorStatus.EM_USO),
      icone: "check_circle",
      classeTom: styles.tomOperacional,
      progressoCor: "#10b981",
    },
    {
      rotulo: "Em Manutenção",
      valor: contagemPorStatus.EM_MANUTENCAO,
      pct: calcPct(contagemPorStatus.EM_MANUTENCAO),
      icone: "engineering",
      classeTom: styles.tomManutencao,
      progressoCor: "#f59e0b",
    },
    {
      rotulo: "Reservados",
      valor: contagemPorStatus.RESERVADO,
      pct: calcPct(contagemPorStatus.RESERVADO),
      icone: "pause_circle",
      classeTom: styles.tomReservado,
      progressoCor: "#aa8986",
    },
    {
      rotulo: "Inativos",
      valor: contagemPorStatus.INATIVO,
      pct: calcPct(contagemPorStatus.INATIVO),
      icone: "do_not_disturb_on",
      classeTom: styles.tomInativo,
      progressoCor: "#6b7280",
    },
  ];

  // Filtro de busca
  const termoBusca = busca.trim().toLocaleLowerCase("pt-BR");
  const visiveis = itens.filter((item) => {
    const correspondeBusca =
      `${item.nome} ${item.codigo_patrimonio} ${item.localizacao}`
        .toLocaleLowerCase("pt-BR")
        .includes(termoBusca);
    return (
      correspondeBusca &&
      (!statusFiltro || item.status === statusFiltro) &&
      (!tipoFiltro || item.tipo === tipoFiltro)
    );
  });

  // Paginação
  const totalPaginas = Math.max(
    1,
    Math.ceil(visiveis.length / ITENS_POR_PAGINA),
  );
  const paginaAtual = Math.min(pagina, totalPaginas);
  const paginados = visiveis.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA,
  );

  function abrirModalCadastro() {
    setForm({
      codigo_patrimonio: gerarPatrimonioInicial(),
      nome: "",
      tipo: "BANCADA",
      localizacao: "",
    });
    setModalAberto(true);
  }

  async function salvarEquipamento(event) {
    event.preventDefault();
    setErro("");
    try {
      await chamarApi("/equipamentos", token, {
        method: "POST",
        body: form,
      });
      setModalAberto(false);
      setFeedback({
        type: "success",
        message: "Equipamento cadastrado com sucesso.",
      });
      await carregar();
    } catch (e) {
      setFeedback({ type: "error", message: e.message });
    }
  }

  async function mudarStatus(item, status) {
    setMenuStatusId(null);
    try {
      await chamarApi(`/equipamentos/${item.id}/status`, token, {
        method: "PATCH",
        body: { status },
      });
      setHistorico((atual) =>
        [
          {
            id: `${item.id}-${Date.now()}`,
            codigo: item.codigo_patrimonio,
            nome: item.nome,
            de: item.status,
            para: status,
            quando: new Date(),
          },
          ...atual,
        ].slice(0, 6),
      );
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function inativar(item) {
    if (!window.confirm(`Tem certeza que deseja inativar ${item.nome}?`))
      return;
    try {
      await chamarApi(`/equipamentos/${item.id}`, token, { method: "DELETE" });
      setHistorico((atual) =>
        [
          {
            id: `${item.id}-${Date.now()}`,
            codigo: item.codigo_patrimonio,
            nome: item.nome,
            de: item.status,
            para: "INATIVO",
            quando: new Date(),
          },
          ...atual,
        ].slice(0, 6),
      );
      setAviso("Equipamento inativado.");
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  function limparFiltros() {
    setBusca("");
    setStatusFiltro("");
    setTipoFiltro("");
  }

  return (
    <div className={styles.container}>
      {/* Top Utility Bar */}
      <header className={styles.topUtilityBar}>
        <div className={styles.headerTitleBlock}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Equipamentos</h1>
            {loading && (
              <span className={styles.loadingBadge}>
                <span />
                Carregando inventário
              </span>
            )}
          </div>
          <p className={styles.subtitle}>
            Inventário e monitoramento operacional de ativos.
          </p>
        </div>

        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={carregar}
            title="Atualizar lista de equipamentos"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px", color: "var(--accent-tertiary)" }}
            >
              refresh
            </span>
            <span>Atualizar dados</span>
          </button>

          <button
            type="button"
            className={styles.newEquipmentBtn}
            onClick={abrirModalCadastro}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              add
            </span>
            <span>Cadastrar equipamento</span>
          </button>
        </div>
      </header>

      {erro && (
        <div className={styles.alertError} role="alert">
          <span>{erro}</span>
          <button type="button" onClick={carregar}>
            Tentar novamente
          </button>
        </div>
      )}
      {aviso && <div className={styles.alertSuccess}>{aviso}</div>}

      {/* Metric Badges Strip */}
      <section className={styles.metricStrip} aria-label="Resumo do inventário">
        {metricas.map((m) => (
          <div key={m.rotulo} className={styles.metricCard}>
            <div className={styles.metricCardTop}>
              <span className={styles.metricLabel}>{m.rotulo}</span>
              <span
                className={`material-symbols-outlined ${m.classeTom}`}
                style={{ fontSize: "18px" }}
              >
                {m.icone}
              </span>
            </div>
            <div className={styles.metricValueRow}>
              {loading ? (
                <span
                  className={styles.metricSkeletonNumber}
                  aria-label="Carregando"
                />
              ) : (
                <>
                  <span className={styles.metricNumber}>{m.valor}</span>
                  <span className={styles.metricSubNumber}>/ {m.pct}%</span>
                </>
              )}
            </div>
            <div className={styles.metricBarTrack}>
              <div
                className={`${styles.metricBarFill} ${loading ? styles.metricBarLoading : ""}`}
                style={
                  loading
                    ? undefined
                    : { width: `${m.pct}%`, backgroundColor: m.progressoCor }
                }
              />
            </div>
          </div>
        ))}
      </section>

      {/* Main Search, Filtering, and Primary Action Bar */}
      <section className={styles.filterBar} aria-label="Filtros do inventário">
        <div className={styles.filterControls}>
          {/* Search Box */}
          <label className={styles.searchBox}>
            <span className={`material-symbols-outlined ${styles.searchIcon}`}>
              search
            </span>
            <span className={styles.visuallyHidden}>
              Pesquisar equipamentos
            </span>
            <input
              type="search"
              placeholder="Pesquisar por nome, patrimônio ou localização..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className={styles.searchInput}
            />
            {busca && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setBusca("")}
                aria-label="Limpar pesquisa"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "16px" }}
                >
                  close
                </span>
              </button>
            )}
          </label>

          {/* Status Select */}
          <div className={styles.selectWrapper}>
            <span className={`material-symbols-outlined ${styles.selectIcon}`}>
              tune
            </span>
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className={styles.statusSelect}
            >
              <option value="">Todos os status ({itens.length})</option>
              {STATUS.map((s) => (
                <option key={s} value={s}>
                  {ROTULO_STATUS[s]} ({contagemPorStatus[s] ?? 0})
                </option>
              ))}
            </select>
            <span className={`material-symbols-outlined ${styles.selectArrow}`}>
              expand_more
            </span>
          </div>

          <div className={styles.selectWrapper}>
            <span className={`material-symbols-outlined ${styles.selectIcon}`}>
              layers
            </span>
            <select
              aria-label="Filtrar por tipo"
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className={styles.statusSelect}
            >
              <option value="">Todos os tipos ({itens.length})</option>
              <option value="BANCADA">
                Bancadas (
                {itens.filter((item) => item.tipo === "BANCADA").length})
              </option>
              <option value="ROBO">
                Robôs ({itens.filter((item) => item.tipo === "ROBO").length})
              </option>
            </select>
            <span className={`material-symbols-outlined ${styles.selectArrow}`}>
              expand_more
            </span>
          </div>

          {(busca || statusFiltro || tipoFiltro) && (
            <button
              type="button"
              className={styles.resetFiltersBtn}
              onClick={limparFiltros}
              title="Limpar busca e filtros"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "16px" }}
              >
                restart_alt
              </span>
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>
      </section>

      <section
        className={styles.inventorySection}
        aria-label="Inventário de equipamentos"
      >
        <div className={styles.inventoryHeader}>
          <div>
            <h2>Gestão de inventário</h2>
            <p>
              {loading
                ? "Sincronizando equipamentos..."
                : visiveis.length +
                  (visiveis.length === 1
                    ? " equipamento encontrado"
                    : " equipamentos encontrados")}
            </p>
          </div>
          {!loading && visiveis.length > 0 && <span>Ordem: mais recentes</span>}
        </div>

        {loading ? (
          <EquipmentSkeleton />
        ) : erro && itens.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={"material-symbols-outlined " + styles.emptyIcon}>
              cloud_off
            </span>
            <h2>Falha ao carregar o inventário</h2>
            <p>Verifique a conexão com o servidor e tente novamente.</p>
            <button
              type="button"
              className={styles.secondaryEmptyBtn}
              onClick={carregar}
            >
              <span className="material-symbols-outlined">refresh</span>Tentar
              novamente
            </button>
          </div>
        ) : visiveis.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={"material-symbols-outlined " + styles.emptyIcon}>
              precision_manufacturing
            </span>
            <h2>
              {itens.length === 0
                ? "Nenhum equipamento cadastrado"
                : "Nenhum equipamento encontrado"}
            </h2>
            <p>
              {itens.length === 0
                ? "Cadastre o primeiro equipamento para iniciar o monitoramento do inventário."
                : "Nenhum item corresponde aos filtros selecionados. Ajuste a busca ou limpe os filtros para ver todos os equipamentos."}
            </p>
            <div className={styles.emptyActions}>
              {itens.length === 0 && (
                <button
                  type="button"
                  className={styles.emptyPrimaryBtn}
                  onClick={abrirModalCadastro}
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Cadastrar primeiro equipamento
                </button>
              )}
              {(itens.length === 0 || busca || statusFiltro || tipoFiltro) && (
                <button
                  type="button"
                  className={styles.secondaryEmptyBtn}
                  onClick={limparFiltros}
                >
                  <span className="material-symbols-outlined">
                    filter_alt_off
                  </span>
                  Limpar filtros de busca
                </button>
              )}
            </div>
          </div>
        ) : (
          <TabelaAdmin
            columns={[
              "Código",
              "Nome do Equipamento",
              "Tipo",
              "Localização",
              "Status",
              { label: "Ações", align: "right" },
            ]}
            tableClassName={styles.table}
            minWidth="900px"
            loading={false}
            empty={false}
            pagination={{
              page: paginaAtual,
              totalPages: totalPaginas,
              onChange: setPagina,
              info: `Página ${paginaAtual} de ${totalPaginas} (${visiveis.length} registros)`,
            }}
          >
            {paginados.map((item) => {
              const tom = TOM_STATUS[item.status] || "neutro";
              const rotuloStatus = ROTULO_STATUS[item.status] || item.status;
              const isRobo = item.tipo === "ROBO";

              return (
                <tr key={item.id}>
                  <td className={styles.codeCell}>
                    <code>{item.codigo_patrimonio}</code>
                  </td>

                  <td className={styles.nameCell}>
                    <span className={styles.equipmentName}>{item.nome}</span>
                  </td>

                  <td>
                    <span className={styles.typeBadge}>
                      <span
                        className={`material-symbols-outlined ${styles.typeIcon}`}
                        style={{
                          color: isRobo
                            ? "var(--mahogany-red)"
                            : "var(--accent-tertiary)",
                        }}
                      >
                        {isRobo ? "smart_toy" : "table_restaurant"}
                      </span>
                      <span>{isRobo ? "Robô" : "Bancada"}</span>
                    </span>
                  </td>

                  <td>
                    <div className={styles.locationCell}>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "16px", color: "var(--silver)" }}
                      >
                        pin_drop
                      </span>
                      <span>{item.localizacao}</span>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`${styles.statusBadge} ${styles[`status_${tom}`]}`}
                    >
                      <span
                        className={`${styles.statusDot} ${styles[`dot_${tom}`]}`}
                      />
                      <span>{rotuloStatus}</span>
                    </span>
                  </td>

                  <td style={{ textAlign: "right" }}>
                    <div className={styles.actionsCell}>
                      {/* Dropdown Mudar Status */}
                      <div className={styles.statusDropdownWrapper}>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() =>
                            setMenuStatusId(
                              menuStatusId === item.id ? null : item.id,
                            )
                          }
                        >
                          <span>Mudar Status</span>
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "14px" }}
                          >
                            arrow_drop_down
                          </span>
                        </button>

                        {menuStatusId === item.id && (
                          <div className={styles.actionMenu}>
                            {(TRANSICOES[item.status] ?? []).map(
                              ([novoStatus, rotulo]) => (
                                <button
                                  key={novoStatus}
                                  type="button"
                                  className={styles.actionMenuItem}
                                  onClick={() => mudarStatus(item, novoStatus)}
                                >
                                  <span className={styles.actionMenuDot} />
                                  <span>{rotulo}</span>
                                </button>
                              ),
                            )}
                            {(TRANSICOES[item.status] ?? []).length === 0 && (
                              <span className={styles.actionMenuEmpty}>
                                Nenhuma opção disponível
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Inativar / Reativar */}
                      {item.status !== "INATIVO" ? (
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          onClick={() => inativar(item)}
                          title="Inativar Equipamento"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "15px" }}
                          >
                            power_settings_new
                          </span>
                          <span>Inativar</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}
                          onClick={() => mudarStatus(item, "DISPONIVEL")}
                          title="Reativar Equipamento"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "15px" }}
                          >
                            restart_alt
                          </span>
                          <span>Reativar</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </TabelaAdmin>
        )}
      </section>

      <section
        className={styles.auditLogCard}
        aria-labelledby="historico-status-titulo"
      >
        <div className={styles.auditLogHeader}>
          <div className={styles.auditLogTitleRow}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "20px", color: "var(--mahogany-red)" }}
            >
              history
            </span>
            <h2 id="historico-status-titulo" className={styles.auditLogTitle}>
              Histórico de alterações de status
            </h2>
          </div>
          <span className={styles.auditLogMeta}>
            Últimos registros ({historico.length})
          </span>
        </div>

        <div className={styles.auditList}>
          {historico.length === 0 ? (
            <p className={styles.auditEmpty}>
              Nenhuma alteração de status realizada nesta sessão.
            </p>
          ) : (
            historico.map((h) => (
              <div key={h.id} className={styles.auditItem}>
                <div className={styles.auditItemLeft}>
                  <span className={styles.auditItemCode}>{h.codigo}</span>
                  <span className={styles.auditItemText}>
                    {h.nome}: alterado de{" "}
                    <span className={styles.auditOldStatus}>
                      {ROTULO_STATUS[h.de] ?? h.de}
                    </span>{" "}
                    para{" "}
                    <span className={styles.auditNewStatus}>
                      {ROTULO_STATUS[h.para] ?? h.para}
                    </span>
                  </span>
                </div>
                <div className={styles.auditItemTime}>
                  {h.quando.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* CADASTRO DE EQUIPAMENTO MODAL */}
      {modalAberto && (
        <div
          className={`${styles.modalOverlay} abrir-modal-fundo ${fechandoModal ? "fechar-modal-fundo" : ""}`}
          role="dialog"
          aria-modal="true"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalAberto(false);
          }}
        >
          <div
            className={`${styles.modalCard} abrir-modal ${fechandoModal ? "fechar-modal" : ""}`}
            onAnimationEnd={finalizarFechamentoModal}
          >
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={styles.modalHeaderIcon}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "20px" }}
                  >
                    add_box
                  </span>
                </div>
                <div className={styles.modalHeaderTitles}>
                  <h2 className={styles.modalTitle}>
                    Cadastrar Novo Equipamento
                  </h2>
                  <span className={styles.modalSubtitle}>
                    MÓDULO DE GESTÃO DE ATIVOS // TENKEN OS
                  </span>
                </div>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setModalAberto(false)}
                aria-label="Fechar modal"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "20px" }}
                >
                  close
                </span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={salvarEquipamento} className={styles.modalForm}>
              {/* Patrimônio */}
              <div className={styles.modalField}>
                <label htmlFor="modal-patrimonio" className={styles.modalLabel}>
                  <span>
                    Patrimônio{" "}
                    <strong style={{ color: "var(--mahogany-red)" }}>*</strong>
                  </span>
                  <span className={styles.modalLabelHint}>
                    Formato Obrigatório
                  </span>
                </label>
                <div className={styles.modalInputWrapper}>
                  <span
                    className={`material-symbols-outlined ${styles.modalInputIcon}`}
                  >
                    badge
                  </span>
                  <input
                    id="modal-patrimonio"
                    required
                    value={form.codigo_patrimonio}
                    onChange={(e) =>
                      setForm({ ...form, codigo_patrimonio: e.target.value })
                    }
                    placeholder="ex: PAT-2024-089"
                    className={styles.modalInput}
                  />
                </div>
              </div>

              {/* Nome */}
              <div className={styles.modalField}>
                <label htmlFor="modal-nome" className={styles.modalLabel}>
                  <span>
                    Nome do Equipamento{" "}
                    <strong style={{ color: "var(--mahogany-red)" }}>*</strong>
                  </span>
                </label>
                <div className={styles.modalInputWrapper}>
                  <span
                    className={`material-symbols-outlined ${styles.modalInputIcon}`}
                  >
                    precision_manufacturing
                  </span>
                  <input
                    id="modal-nome"
                    required
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="ex: Braço Robótico Articulado TK-6"
                    className={styles.modalInput}
                  />
                </div>
              </div>

              {/* Tipo Selector: Bancada vs Robô Cards */}
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>
                  <span>
                    Tipo de Equipamento{" "}
                    <strong style={{ color: "var(--mahogany-red)" }}>*</strong>
                  </span>
                </span>
                <div className={styles.typeCardsGrid}>
                  <label
                    className={`${styles.typeCard} ${form.tipo === "BANCADA" ? styles.typeCardSelected : ""}`}
                  >
                    <div className={styles.typeCardLeft}>
                      <input
                        type="radio"
                        name="equipment_type"
                        value="BANCADA"
                        checked={form.tipo === "BANCADA"}
                        onChange={() => setForm({ ...form, tipo: "BANCADA" })}
                        className={styles.typeRadio}
                      />
                      <div className={styles.typeCardTexts}>
                        <span className={styles.typeCardTitle}>Bancada</span>
                        <span className={styles.typeCardDesc}>
                          Posto de trabalho / CLP
                        </span>
                      </div>
                    </div>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "22px",
                        color: "var(--accent-tertiary)",
                      }}
                    >
                      table_restaurant
                    </span>
                  </label>

                  <label
                    className={`${styles.typeCard} ${form.tipo === "ROBO" ? styles.typeCardSelected : ""}`}
                  >
                    <div className={styles.typeCardLeft}>
                      <input
                        type="radio"
                        name="equipment_type"
                        value="ROBO"
                        checked={form.tipo === "ROBO"}
                        onChange={() => setForm({ ...form, tipo: "ROBO" })}
                        className={styles.typeRadio}
                      />
                      <div className={styles.typeCardTexts}>
                        <span className={styles.typeCardTitle}>Robô</span>
                        <span className={styles.typeCardDesc}>
                          Braço / Scara / AGV
                        </span>
                      </div>
                    </div>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "22px", color: "var(--mahogany-red)" }}
                    >
                      smart_toy
                    </span>
                  </label>
                </div>
              </div>

              {/* Localização */}
              <div className={styles.modalField}>
                <label htmlFor="modal-local" className={styles.modalLabel}>
                  <span>
                    Localização Física{" "}
                    <strong style={{ color: "var(--mahogany-red)" }}>*</strong>
                  </span>
                </label>
                <div className={styles.modalInputWrapper}>
                  <span
                    className={`material-symbols-outlined ${styles.modalInputIcon}`}
                  >
                    location_on
                  </span>
                  <input
                    id="modal-local"
                    required
                    value={form.localizacao}
                    onChange={(e) =>
                      setForm({ ...form, localizacao: e.target.value })
                    }
                    placeholder="ex: Sala B-104 - Lab Robótica"
                    className={styles.modalInput}
                  />
                </div>
              </div>

              {/* Status Inicial Notifier */}
              <div className={styles.initialStatusNotifier}>
                <div className={styles.notifierLeft}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px", color: "var(--status-ok)" }}
                  >
                    info
                  </span>
                  <span>Status inicial padrão:</span>
                </div>
                <span className={styles.notifierBadge}>Operacional</span>
              </div>

              {/* Footer Actions */}
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setModalAberto(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.saveBtn}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "18px" }}
                  >
                    save
                  </span>
                  <span>Salvar Equipamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <FeedbackModal feedback={feedback} onClose={() => setFeedback(null)} />
    </div>
  );
}

function EquipmentSkeleton() {
  return (
    <div
      className={styles.tableSkeleton}
      aria-label="Carregando equipamentos"
      aria-busy="true"
    >
      <div className={styles.skeletonTableHeader}>
        {[8, 15, 8, 11, 10, 12].map((width, index) => (
          <span
            key={index}
            className={styles.skeleton}
            style={{ width: width + "%" }}
          />
        ))}
      </div>
      {Array.from({ length: 6 }, (_, index) => (
        <div className={styles.skeletonTableRow} key={index}>
          <span className={styles.skeleton + " " + styles.skeletonCheckbox} />
          <span className={styles.skeleton + " " + styles.skeletonCode} />
          <span className={styles.skeletonName}>
            <i className={styles.skeleton} />
            <i className={styles.skeleton} />
          </span>
          <span className={styles.skeleton + " " + styles.skeletonType} />
          <span className={styles.skeleton + " " + styles.skeletonLocation} />
          <span className={styles.skeleton + " " + styles.skeletonStatus} />
          <span className={styles.skeleton + " " + styles.skeletonAction} />
        </div>
      ))}
      <div className={styles.skeletonFooter}>
        <span className={styles.skeleton} />
        <span className={styles.skeleton} />
      </div>
    </div>
  );
}
