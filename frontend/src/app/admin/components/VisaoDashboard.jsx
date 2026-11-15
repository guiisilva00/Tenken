"use client";

import { useEffect, useState } from "react";
import CartaoMetrica from "./CartaoMetrica";
import {
  somarTotais,
  nomeItem,
  valorItem,
  formatarPercentual,
} from "../lib/formatadores";
import { dataPorExtenso, saudacaoPorHorario } from "@/lib/saudacao";
import styles from "./VisaoDashboard.module.css";

const SEVERIDADES = [
  {
    chave: "critica",
    nomes: ["CRITICA", "CRÍTICA"],
    rotulo: "Crítica",
    tom: "critica",
    icone: "warning",
    dica: "Atenda este chamado primeiro.",
  },
  {
    chave: "alta",
    nomes: ["ALTA"],
    rotulo: "Alta",
    tom: "alta",
    icone: "schedule",
    dica: "Atenda assim que possível.",
  },
  {
    chave: "media",
    nomes: ["MEDIA", "MÉDIA"],
    rotulo: "Média",
    tom: "media",
    icone: "build",
    dica: "Atendimento dentro do fluxo normal.",
  },
  {
    chave: "baixa",
    nomes: ["BAIXA"],
    rotulo: "Baixa",
    tom: "baixa",
    icone: "checklist",
    dica: "Pode ser atendido após os demais.",
  },
];

function normalizar(texto) {
  return String(texto ?? "")
    .trim()
    .toUpperCase();
}

export default function VisaoDashboard({
  usuario,
  dashboard,
  loading,
  error,
  updatedAt,
  onRefresh,
}) {
  const [dataAtual, setDataAtual] = useState(null);
  useEffect(() => setDataAtual(new Date()), []);
  const primeiroNome = usuario?.nome?.trim().split(/\s+/)[0] || "administrador";
  const equipamentos = dashboard?.equipamentos;
  const chamados = dashboard?.chamados;
  const semDados = loading && !dashboard;

  const totalEquipamentos = equipamentos?.total ?? 0;
  const criticos = equipamentos?.criticos ?? 0;
  const naoCriticos = Math.max(totalEquipamentos - criticos, 0);
  const pctCriticos = totalEquipamentos
    ? formatarPercentual(criticos, totalEquipamentos)
    : "0%";
  const pctNaoCriticos = totalEquipamentos
    ? formatarPercentual(naoCriticos, totalEquipamentos)
    : "0%";

  const totalChamados = somarTotais(chamados?.por_status);
  const totalAbertos = somarTotais(chamados?.por_severidade_em_aberto);
  const totalConcluidos = Math.max(totalChamados - totalAbertos, 0);

  const severidadePorChave = new Map();
  const itensSeveridade = Array.isArray(chamados?.por_severidade_em_aberto)
    ? chamados.por_severidade_em_aberto
    : [];
  itensSeveridade.forEach((item, index) => {
    const nome = normalizar(nomeItem(item, index));
    const definicao = SEVERIDADES.find((severidade) =>
      severidade.nomes.includes(nome),
    );
    if (definicao) severidadePorChave.set(definicao.chave, valorItem(item));
  });

  const comprimentoCirculo = 2 * Math.PI * 60;
  let deslocamentoSegmento = 0;
  const segmentosSeveridade = SEVERIDADES.map((def) => {
    const quantidade = severidadePorChave.get(def.chave) ?? 0;
    const percentual = totalAbertos ? (quantidade / totalAbertos) * 100 : 0;
    const comprimento = (comprimentoCirculo * percentual) / 100;
    const segmento = {
      ...def,
      quantidade,
      percentual,
      comprimento,
      deslocamento: deslocamentoSegmento,
    };
    deslocamentoSegmento += comprimento;
    return segmento;
  });

  return (
    <div className={styles.container}>
      {/* Top Header Bar */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {dataAtual ? (
            <p className={styles.dataHoje}>{dataPorExtenso(dataAtual)}</p>
          ) : null}
          <h1 className={styles.pageTitle}>
            {dataAtual
              ? `${saudacaoPorHorario(dataAtual)}, ${primeiroNome}.`
              : "Visão geral"}
          </h1>
          <div className={styles.syncRow}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "16px", color: "var(--silver)" }}
            >
              schedule
            </span>
            <span className={styles.syncLabel}>Dados atualizados:</span>
            <span className={styles.syncValue}>
              {updatedAt
                ? updatedAt.toLocaleTimeString("pt-BR")
                : "Aguardando dados"}
            </span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={onRefresh}
            disabled={loading}
          >
            <span
              className={`material-symbols-outlined ${loading ? styles.refreshIconSpinning : ""}`}
              style={{ fontSize: "18px" }}
            >
              sync
            </span>
            <span>{loading ? "Atualizando..." : "Atualizar resumo"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          {error}
        </div>
      )}

      {/* 4 Bento Metrics Strip */}
      <div className={styles.metricsGrid}>
        <CartaoMetrica
          icone={
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "22px" }}
            >
              developer_board
            </span>
          }
          categoria="Equipamentos"
          titulo="Total cadastrado"
          valor={equipamentos ? totalEquipamentos : "—"}
          unidade="unidades ativas"
          contexto={{
            texto: "No sistema",
          }}
        />

        <CartaoMetrica
          icone={
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "22px" }}
            >
              confirmation_number
            </span>
          }
          categoria="Atendimento"
          titulo="Total de chamados"
          valor={chamados ? totalChamados : "—"}
          unidade="registrados"
          contexto={{
            icone: (
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "14px", color: "var(--accent-tertiary)" }}
              >
                moving
              </span>
            ),
            destaque: `${totalAbertos} abertos`,
            texto: `• ${totalConcluidos} concluídos`,
          }}
        />

        <CartaoMetrica
          icone={
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "22px", color: "var(--mahogany-red-2)" }}
            >
              warning
            </span>
          }
          categoria="Nível de Risco"
          titulo="Equipamentos Críticos"
          valor={equipamentos ? criticos : "—"}
          unidade="equipamentos"
          critico
          badge={{ texto: "Alerta Crítico" }}
          contexto={{
            icone: (
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "14px", color: "#ffb4ac" }}
              >
                warning
              </span>
            ),
            destaque: pctCriticos,
            texto: "dos equipamentos cadastrados",
          }}
        />

        <CartaoMetrica
          icone={
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "22px", color: "var(--accent-tertiary)" }}
            >
              verified
            </span>
          }
          categoria="Equipamentos"
          titulo="Demais equipamentos"
          valor={equipamentos ? naoCriticos : "—"}
          unidade="equipamentos"
          badge={{ texto: "Padrão", tom: "neutro" }}
          contexto={{
            icone: (
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "14px", color: "var(--accent-tertiary)" }}
              >
                verified
              </span>
            ),
            destaque: `${pctNaoCriticos} estáveis`,
            texto: "sem prioridade crítica",
          }}
        />
      </div>

      <section
        className={styles.severitySection}
        aria-labelledby="severity-title"
      >
        <div className={styles.severityHeader}>
          <div className={styles.severityTitleBlock}>
            <div className={styles.severityTitleRow}>
              <span className={styles.severityTitleDot} aria-hidden="true" />
              <h2 id="severity-title" className={styles.severityTitle}>
                Distribuição Percentual de Severidade
              </h2>
            </div>
            <p className={styles.severitySubtitle}>
              Proporção dos {totalAbertos} chamados ativos por nível de impacto.
            </p>
          </div>
        </div>

        <div className={styles.severityGrid}>
          <div className={styles.donutColumn}>
            <div
              className={styles.donutWrap}
              role="img"
              aria-label={`Distribuição de severidade entre ${totalAbertos} chamados ativos`}
            >
              <svg
                className={styles.donutSvg}
                viewBox="0 0 160 160"
                aria-hidden="true"
              >
                <circle className={styles.donutTrack} cx="80" cy="80" r="60" />
                {segmentosSeveridade.map((segmento) => (
                  <circle
                    key={segmento.chave}
                    className={`${styles.donutSlice} ${styles[`donut_${segmento.tom}`]}`}
                    cx="80"
                    cy="80"
                    r="60"
                    strokeDasharray={`${segmento.comprimento} ${comprimentoCirculo - segmento.comprimento}`}
                    strokeDashoffset={-segmento.deslocamento}
                    transform="rotate(-90 80 80)"
                  />
                ))}
              </svg>
              <div className={styles.donutCenter}>
                <span>Chamados ativos</span>
                <strong>{totalAbertos}</strong>
                <span>no total</span>
              </div>
            </div>
            <span className={styles.donutCaption}>
              Percentual do total ativo
            </span>
          </div>

          <div className={styles.severityDetails}>
            <div className={styles.severityCards}>
              {segmentosSeveridade.map((segmento) => (
                <article
                  key={segmento.chave}
                  className={`${styles.severityCard} ${styles[`severityCard_${segmento.tom}`]}`}
                >
                  <div className={styles.severityCardInfo}>
                    <span
                      className={`${styles.legendDot} ${styles[`legendDot_${segmento.tom}`]}`}
                      aria-hidden="true"
                    />
                    <div className={styles.severityLabels}>
                      <strong>{segmento.rotulo}</strong>
                      <span>
                        {segmento.quantidade}{" "}
                        {segmento.quantidade === 1 ? "chamado" : "chamados"}
                      </span>
                    </div>
                  </div>
                  <div className={styles.severityValues}>
                    <strong>{segmento.percentual.toFixed(1)}%</strong>
                    <span>{segmento.dica}</span>
                  </div>
                </article>
              ))}
            </div>
            <div className={styles.severityNote}>
              <span className="material-symbols-outlined" aria-hidden="true">
                analytics
              </span>
              <span>
                Percentuais calculados sobre <strong>{totalAbertos}</strong>{" "}
                chamados ativos.
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
