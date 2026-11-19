"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import styles from "./page.module.css";
import { chamarApi } from "../lib/adminApi";
import { formatarNumero } from "../lib/formatadores";

const META_MTTR_HORAS = 5;

function calcularDatasPeriodo(opcao) {
  const agora = new Date();
  const dataLocal = (data) =>
    `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
  const hojeStr = dataLocal(agora);

  if (opcao === "30d") {
    const d = new Date(agora);
    d.setDate(d.getDate() - 29);
    return { inicio: dataLocal(d), fim: hojeStr };
  }
  if (opcao === "90d") {
    const d = new Date(agora);
    d.setDate(d.getDate() - 89);
    return { inicio: dataLocal(d), fim: hojeStr };
  }
  if (opcao === "year") {
    const ano = agora.getFullYear();
    return { inicio: `${ano}-01-01`, fim: hojeStr };
  }
  return { inicio: `${agora.getFullYear()}-01-01`, fim: hojeStr };
}

export default function PaginaRelatorios() {
  return <AdminLayout>{({ token }) => <Conteudo token={token} />}</AdminLayout>;
}

function Conteudo({ token }) {
  const [periodoChave, setPeriodoChave] = useState("30d");
  const [tipoFiltro, setTipoFiltro] = useState("all");
  const [menuExportarAberto, setMenuExportarAberto] = useState(false);

  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const datas = calcularDatasPeriodo(periodoChave);

  const carregarRelatorio = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const q = new URLSearchParams({
        periodo_inicio: datas.inicio,
        periodo_fim: datas.fim,
      });
      if (tipoFiltro !== "all") q.set("tipo", tipoFiltro);
      const data = await chamarApi(`/admin/relatorios?${q}`, token);
      setRelatorio(data?.dados ?? data);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, datas.inicio, datas.fim, tipoFiltro]);

  useEffect(() => {
    carregarRelatorio();
  }, [carregarRelatorio]);

  // Mostra apenas dados recebidos do relatório.
  const equipamentosPorStatus = Array.isArray(
    relatorio?.equipamentos_por_status,
  )
    ? relatorio.equipamentos_por_status
    : [];
  const coresStatus = {
    DISPONIVEL: "#2ec4b6",
    RESERVADO: "#f4b740",
    EM_USO: "#61a9ff",
    EM_MANUTENCAO: "#f07878",
    INATIVO: "#827b83",
  };
  const circunferenciaRosca = 2 * Math.PI * 42;
  const fatiasStatus = equipamentosPorStatus.reduce((fatias, item) => {
    const total = Number(item.total ?? 0);
    const anterior = fatias.at(-1)?.acumulado ?? 0;
    fatias.push({
      ...item,
      total,
      acumulado: anterior + total,
      inicio: anterior,
      cor: coresStatus[String(item.status).toUpperCase()] || "#b1a7a6",
    });
    return fatias;
  }, []);
  const totalAtivosMonitorados = equipamentosPorStatus.reduce(
    (soma, item) => soma + Number(item.total ?? 0),
    0,
  );
  const equipamentosOperacionais = equipamentosPorStatus.find((item) =>
    ["OPERACIONAL", "DISPONIVEL"].includes(String(item.status).toUpperCase()),
  );
  const eficienciaGeral =
    totalAtivosMonitorados && equipamentosOperacionais
      ? (Number(equipamentosOperacionais.total ?? 0) / totalAtivosMonitorados) *
      100
      : null;

  const mttrValor = relatorio?.mttr_horas ?? null;
  const mttrPercentualSla =
    mttrValor === null ? 0 : Math.min(100, (mttrValor / META_MTTR_HORAS) * 100);

  function exportarCsv() {
    setMenuExportarAberto(false);
    if (!relatorio) return;

    const linhas = [];
    linhas.push(["Relatório Tenken - Indicadores Operacionais"]);
    linhas.push([`Período: ${datas.inicio} a ${datas.fim}`]);
    linhas.push([`Tipo: ${tipoFiltro === "all" ? "Todos" : tipoFiltro}`]);
    linhas.push([]);
    linhas.push(["Tempo médio para conserto (horas)", mttrValor ?? ""]);
    linhas.push([
      "Equipamentos disponíveis (%)",
      eficienciaGeral === null ? "" : eficienciaGeral.toFixed(1),
    ]);
    linhas.push(["Total Ativos", totalAtivosMonitorados]);
    linhas.push([]);

    function bloco(titulo, rows, cols) {
      linhas.push([titulo]);
      linhas.push(cols.map(([c]) => c));
      (rows ?? []).forEach((r) => linhas.push(cols.map(([, k]) => r[k] ?? "")));
      linhas.push([]);
    }

    bloco("Status de Equipamentos", relatorio.equipamentos_por_status, [
      ["Status", "status"],
      ["Total", "total"],
    ]);
    bloco("Falhas por Equipamento", relatorio.ranking_falhas, [
      ["Equipamento", "equipamento_nome"],
      ["Total Falhas", "total"],
    ]);
    bloco("Uso por Equipamento", relatorio.ranking_uso, [
      ["Equipamento", "equipamento_nome"],
      ["Agendamentos", "total_agendamentos"],
      ["Horas Reservadas (h)", "horas_reservadas"],
    ]);
    bloco("Taxa de Ocupação", relatorio.taxa_ocupacao, [
      ["Equipamento", "equipamento_nome"],
      ["Horas Reservadas", "horas_reservadas"],
      ["Ocupação (%)", "taxa_ocupacao_percentual"],
    ]);

    const csv = linhas
      .map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-tenken-${datas.inicio}-a-${datas.fim}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setAviso("Relatório CSV gerado e descarregado com sucesso.");
  }

  function exportarPdf() {
    setMenuExportarAberto(false);
    window.print();
  }

  // Lista de falhas para o gráfico de barras.
  const listaFalhas = Array.isArray(relatorio?.ranking_falhas)
    ? relatorio.ranking_falhas
    : [];

  const maxFalhas =
    listaFalhas.reduce((m, item) => Math.max(m, Number(item.total ?? 0)), 0) ||
    1;

  // Lista de uso em horas
  const listaUso = Array.isArray(relatorio?.ranking_uso)
    ? relatorio.ranking_uso
    : [];

  const maxUso =
    listaUso.reduce(
      (m, item) => Math.max(m, Number(item.horas_reservadas ?? 0)),
      0,
    ) || 1;

  // Taxa de ocupação
  const listaOcupacao = Array.isArray(relatorio?.taxa_ocupacao)
    ? relatorio.taxa_ocupacao
    : [];

  return (
    <div className={styles.container}>
      {/* SECTION 1: HEADER & OPERATIONAL CONTROLS */}
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <div className={styles.headerTitles}>
            <h1 className={styles.title}>Relatórios e Indicadores</h1>
            <p className={styles.subtitle}>
              Consulte o uso, a situação e os chamados dos equipamentos no
              período escolhido.
            </p>
          </div>

          {/* Export Controls Dropdown */}
          <div className={styles.exportWrapper}>
            <button
              type="button"
              className={styles.exportBtn}
              onClick={() => setMenuExportarAberto(!menuExportarAberto)}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px" }}
              >
                file_download
              </span>
              <span>Exportar Relatório (PDF/CSV)</span>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "16px" }}
              >
                expand_more
              </span>
            </button>

            {menuExportarAberto && (
              <div className={styles.exportMenu}>
                <button
                  type="button"
                  className={styles.exportMenuItem}
                  onClick={exportarPdf}
                >
                  <span>Documento PDF (.pdf)</span>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px", color: "var(--mahogany-red)" }}
                  >
                    picture_as_pdf
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.exportMenuItem}
                  onClick={exportarCsv}
                >
                  <span>Planilha CSV (.csv)</span>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "16px",
                      color: "var(--accent-tertiary)",
                    }}
                  >
                    table_view
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Control Bar */}
        <div className={styles.filterBar}>
          <p className={styles.printSummary}>
            Período: {datas.inicio} a {datas.fim} · Tipo:{" "}
            {tipoFiltro === "all" ? "Todos" : tipoFiltro}
          </p>
          {/* Period Selector */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Período:</span>
            <button
              type="button"
              className={`${styles.periodBtn} ${periodoChave === "30d" ? styles.periodBtnActive : ""}`}
              onClick={() => setPeriodoChave("30d")}
            >
              Últimos 30 dias
            </button>
            <button
              type="button"
              className={`${styles.periodBtn} ${periodoChave === "90d" ? styles.periodBtnActive : ""}`}
              onClick={() => setPeriodoChave("90d")}
            >
              Últimos 90 dias
            </button>
            <button
              type="button"
              className={`${styles.periodBtn} ${periodoChave === "year" ? styles.periodBtnActive : ""}`}
              onClick={() => setPeriodoChave("year")}
            >
              Ano atual
            </button>
          </div>

          {/* Equipment Type Tabs */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Tipo:</span>
            <button
              type="button"
              className={`${styles.typeBtn} ${tipoFiltro === "all" ? styles.typeBtnActive : ""}`}
              onClick={() => setTipoFiltro("all")}
            >
              Todos
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${tipoFiltro === "BANCADA" ? styles.typeBtnActive : ""}`}
              onClick={() => setTipoFiltro("BANCADA")}
            >
              Bancada
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${tipoFiltro === "ROBO" ? styles.typeBtnActive : ""}`}
              onClick={() => setTipoFiltro("ROBO")}
            >
              Robô
            </button>
          </div>
        </div>
      </header>

      {erro && (
        <div className={styles.alertError} role="alert">
          {erro}
        </div>
      )}
      {aviso && <div className={styles.alertSuccess}>{aviso}</div>}

      {/* SECTION 2: TELEMETRY OVERVIEW BENTO (MTTR + CORE METRICS) */}
      <div className={styles.bentoSection}>
        {/* MTTR Focus Card (Featured) */}
        <div className={styles.mttrCard}>
          <div className={styles.mttrCardGlow} />
          <div className={styles.mttrHeader}>
            <div className={styles.mttrHeaderLeft}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "20px", color: "#ffb4ac" }}
              >
                build_circle
              </span>
              <span className={styles.mttrCardTag}>
                Tempo médio para conserto
              </span>
            </div>
            <span className={styles.mttrSubtitle}>
              Tempo médio entre o início e a conclusão do chamado
            </span>
          </div>

          <div className={styles.mttrValueRow}>
            <span className={styles.mttrNumber}>
              {typeof mttrValor === "number" ? mttrValor.toFixed(1) : "—"}
            </span>
            <span className={styles.mttrUnit}>horas</span>
          </div>

          <div className={styles.mttrFooterBox}>
            <div className={styles.mttrFooterRow}>
              <div className={styles.mttrTrend}>
                <span>Indicador calculado no período selecionado</span>
              </div>
              <span className={styles.mttrGoal}>
                {mttrValor === null
                  ? "Sem dados no período"
                  : `Referência: até ${META_MTTR_HORAS}h`}
              </span>
            </div>
            <div className={styles.slaTrack}>
              <div
                className={styles.slaFill}
                style={{ width: `${mttrPercentualSla}%` }}
                title="Tempo médio para conserto"
              />
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className={styles.secondaryGrid}>
          {/* Disponibilidade atual */}
          <div className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiTag}>Disponibilidade atual</span>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px", color: "var(--silver)" }}
              >
                speed
              </span>
            </div>
            <div className={styles.kpiValueRow}>
              <span className={styles.kpiValue}>
                {eficienciaGeral === null ? "—" : eficienciaGeral.toFixed(1)}
                <span className={styles.kpiPercent}>%</span>
              </span>
              <span className={styles.kpiDesc}>
                Equipamentos operacionais no tipo selecionado
              </span>
            </div>
            <div className={styles.kpiStatusRow}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "14px", color: "var(--status-ok)" }}
              >
                done_all
              </span>
              <span style={{ color: "#a7f3d0" }}>
                Status atual dos equipamentos
              </span>
            </div>
          </div>

          {/* Total Ativos Monitorados */}
          <div className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiTag}>Equipamentos Cadastrados</span>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px", color: "var(--silver)" }}
              >
                grid_view
              </span>
            </div>
            <div className={styles.kpiValueRow}>
              <span className={styles.kpiValue}>
                {totalAtivosMonitorados}
                <span className={styles.kpiPercent}> un</span>
              </span>
              <span className={styles.kpiDesc}>No sistema</span>
            </div>
            <div className={styles.kpiStatusRow}>
              <span className={styles.statusDotGreen} />
              <span>Equipamentos cadastrados no sistema</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: DETAILED CHARTS & TELEMETRY BREAKDOWN */}
      <div className={styles.chartsSection}>
        {/* 3.1 Donut Chart: Equipamentos por Status */}
        <div className={styles.chartCardLeft}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitles}>
              <h2 className={styles.chartTitle}>
                Status Geral de Equipamentos
              </h2>
              <span className={styles.chartSubtitle}>
                Total: {totalAtivosMonitorados} equipamentos
              </span>
            </div>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "20px", color: "var(--silver)" }}
            >
              pie_chart
            </span>
          </div>

          <div className={styles.donutBody}>
            {fatiasStatus.length > 0 ? (
              <>
                <div className={styles.donutWrapper}>
                  <svg className={styles.donutSvg} viewBox="0 0 120 120" role="img" aria-label="Distribuição dos equipamentos por status">
                    <circle className={styles.donutTrack} cx="60" cy="60" r="42" />
                    {fatiasStatus.map((fatia, indice) => {
                      const tamanho = totalAtivosMonitorados ? (fatia.total / totalAtivosMonitorados) * circunferenciaRosca : 0;
                      return <circle key={fatia.status || indice} className={styles.donutSegment} cx="60" cy="60" r="42" stroke={fatia.cor} strokeDasharray={`${tamanho} ${circunferenciaRosca - tamanho}`} strokeDashoffset={-((fatia.inicio / (totalAtivosMonitorados || 1)) * circunferenciaRosca)} style={{ animationDelay: `${indice * 90}ms` }} />;
                    })}
                  </svg>
                  <div className={styles.donutCenter}><strong className={styles.donutCenterNumber}>{totalAtivosMonitorados}</strong><span className={styles.donutCenterLabel}>ATIVOS</span></div>
                </div>
                <ul className={styles.legendList}>
                  {fatiasStatus.map((fatia, indice) => <li className={styles.legendRow} key={fatia.status || indice}><span className={styles.legendItemLeft}><span className={styles.legendDot} style={{ backgroundColor: fatia.cor }} /><span className={styles.legendText}>{String(fatia.status).replaceAll("_", " ")}</span></span><span className={styles.legendItemRight}><span className={styles.legendUnits}>{fatia.total}</span><strong className={styles.legendPct}>{totalAtivosMonitorados ? `${((fatia.total / totalAtivosMonitorados) * 100).toFixed(0)}%` : "0%"}</strong></span></li>)}
                </ul>
              </>
            ) : <p className={styles.chartSubtitle}>{loading ? "Carregando situação dos equipamentos…" : "Nenhum equipamento encontrado para os filtros selecionados."}</p>}
          </div>
        </div>

        {/* 3.2 Horizontal Bar Chart: Falhas por Equipamento */}
        <div className={styles.chartCardRight}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitles}>
              <h2 className={styles.chartTitle}>Falhas por Equipamento</h2>
              <span className={styles.chartSubtitle}>
                Equipamentos que mais apresentaram problemas
              </span>
            </div>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "20px", color: "var(--status-critical)" }}
            >
              warning
            </span>
          </div>

          <div className={styles.barsList}>
            {listaFalhas.slice(0, 5).map((item, idx) => {
              const val = Number(item.total ?? 0);
              const pct = (val / maxFalhas) * 100;
              return (
                <div key={idx} className={styles.barItem}>
                  <div className={styles.barItemHeader}>
                    <span className={styles.barItemName}>
                      {item.equipamento_nome ||
                        `Equipamento ${item.equipamento_id}`}
                    </span>
                    <span className={styles.barItemVal}>{val} falhas</span>
                  </div>
                  <div className={styles.barItemTrack}>
                    <div
                      className={styles.barItemFill}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.barsFooter}>
            <span>Chamados por equipamento no período</span>
          </div>
        </div>
      </div>

      {/* SECTION 4: DUAL ANALYSIS BARS (USO EM HORAS vs TAXA DE OCUPAÇÃO) */}
      <div className={styles.dualSection}>
        {/* 4.1 Uso por Equipamento */}
        <div className={styles.analysisCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitles}>
              <h2 className={styles.chartTitle}>Uso por Equipamento</h2>
              <span className={styles.chartSubtitle}>
                Horas acumuladas no período selecionado
              </span>
            </div>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "20px", color: "var(--silver)" }}
            >
              schedule
            </span>
          </div>

          <div className={styles.barsList}>
            {listaUso.slice(0, 5).map((item, idx) => {
              const val = Number(item.horas_reservadas ?? 0);
              const pct = (val / maxUso) * 100;
              return (
                <div key={idx} className={styles.barItem}>
                  <div className={styles.barItemHeader}>
                    <span className={styles.barItemName}>
                      {item.equipamento_nome ||
                        `Equipamento ${item.equipamento_id}`}
                    </span>
                    <span className={styles.barItemValMuted}>{val} horas</span>
                  </div>
                  <div className={styles.barItemTrack}>
                    <div
                      className={styles.barItemFillBlue}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.barsFooter}>
            <span>Horas reservadas no período</span>
            <span className={styles.barsFooterActive}>
              No período escolhido
            </span>
          </div>
        </div>

        {/* 4.2 Taxa de Ocupação */}
        <div className={styles.analysisCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitles}>
              <h2 className={styles.chartTitle}>
                Taxa de Ocupação por Equipamento
              </h2>
              <span className={styles.chartSubtitle}>
                Horas reservadas ÷ horas do período
              </span>
            </div>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "20px", color: "var(--silver)" }}
            >
              percent
            </span>
          </div>

          <div className={styles.barsList}>
            {listaOcupacao.slice(0, 5).map((item, idx) => {
              const val = Number(
                item.taxa ?? item.taxa_ocupacao_percentual ?? 0,
              );
              const isOver = val >= 85;
              return (
                <div key={idx} className={styles.barItem}>
                  <div className={styles.barItemHeader}>
                    <span className={styles.barItemName}>
                      {item.equipamento_nome ||
                        `Equipamento ${item.equipamento_id}`}
                    </span>
                    <span
                      className={
                        isOver ? styles.barItemValCritical : styles.barItemVal
                      }
                    >
                      {val}% {isOver && "⚠️"}
                    </span>
                  </div>
                  <div className={styles.barItemTrack}>
                    <div
                      className={
                        isOver ? styles.barItemFillCritical : styles.barItemFill
                      }
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.barsFooter}>
            <span>Ocupação dos equipamentos</span>
            <span className={styles.barsFooterActive}>
              No período escolhido
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
