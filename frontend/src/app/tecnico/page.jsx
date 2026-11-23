"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import CartaoMetrica from "../admin/components/CartaoMetrica";
import ResumoChamados from "./components/ResumoChamados";
import { getUsuario } from "@/lib/session";
import { dataPorExtenso, saudacaoPorHorario } from "@/lib/saudacao";
import styles from "./page.module.css";

function totalPorChave(itens, chave, valor) {
  if (!Array.isArray(itens)) return 0;
  const normalizar = (texto) =>
    String(texto ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toUpperCase();
  const item = itens.find(
    (linha) => normalizar(linha[chave]) === normalizar(valor),
  );
  return Number(item?.total ?? item?.quantidade ?? item?.count ?? 0);
}

function somarStatus(itens, statusDesejados) {
  return statusDesejados.reduce(
    (total, status) => total + totalPorChave(itens, "status", status),
    0,
  );
}

export default function PaginaTecnico() {
  const [dashboard, setDashboard] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [dataAtual, setDataAtual] = useState(null);
  const usuario = getUsuario();
  const primeiroNome = usuario?.nome?.trim().split(/\s+/)[0] || "técnico";

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const resposta = await apiFetch("/api/tecnico/dashboard");
      setDashboard(resposta?.dados ?? null);
      setAtualizadoEm(new Date());
    } catch (error) {
      setErro(error.message || "Não foi possível carregar os indicadores.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    setDataAtual(new Date());
    carregar();
  }, [carregar]);

  const chamados = dashboard?.chamados;
  const status = chamados?.por_status;
  const ativos = somarStatus(status, [
    "ABERTO",
    "EM_ATENDIMENTO",
    "AGUARDANDO_PECAS",
  ]);
  const criticos = totalPorChave(
    chamados?.por_severidade_em_aberto,
    "severidade",
    "CRITICA",
  );
  const concluidos = totalPorChave(status, "status", "CONCLUIDO");
  const equipamentosEmManutencao = Number(
    dashboard?.equipamentos?.em_manutencao ?? 0,
  );

  const indicadores = [
    {
      categoria: "Atendimento",
      titulo: "Chamados ativos",
      valor: ativos,
      unidade: "na fila técnica",
      icone: "confirmation_number",
      contexto: { texto: "Abertos, em atendimento ou aguardando peças" },
    },
    {
      categoria: "Prioridade",
      titulo: "Chamados críticos",
      valor: criticos,
      unidade: "em aberto",
      icone: "warning",
      critico: criticos > 0,
      contexto: { texto: "Priorize a avaliação desses chamados" },
    },
    {
      categoria: "Laboratório",
      titulo: "Equipamentos em manutenção",
      valor: equipamentosEmManutencao,
      unidade: "no total",
      icone: "build",
      contexto: { texto: "Ativos atualmente marcados para manutenção" },
    },
    {
      categoria: "Histórico",
      titulo: "Chamados concluídos",
      valor: concluidos,
      unidade: "no seu fluxo",
      icone: "task_alt",
      contexto: { texto: "Total de chamados finalizados" },
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          {dataAtual ? (
            <p className={styles.dataHoje}>{dataPorExtenso(dataAtual)}</p>
          ) : null}
          <h1 className={styles.titulo}>
            {dataAtual
              ? `${saudacaoPorHorario(dataAtual)}, ${primeiroNome}.`
              : "Visão geral"}
          </h1>
          <p className={styles.atualizacao}>
            <span className="material-symbols-outlined" aria-hidden="true">
              schedule
            </span>
            <span>Dados atualizados:</span>
            <strong>
              {atualizadoEm
                ? atualizadoEm.toLocaleTimeString("pt-BR")
                : "Aguardando dados"}
            </strong>
          </p>
          <p className={styles.descricao}>
            Acompanhe os chamados atribuídos e a condição dos equipamentos.
          </p>
        </div>
        <button
          type="button"
          className={styles.botaoAtualizar}
          onClick={carregar}
          disabled={carregando}
        >
          <span
            className={`material-symbols-outlined ${carregando ? styles.girando : ""}`}
          >
            sync
          </span>
          {carregando ? "Atualizando..." : "Atualizar resumo"}
        </button>
      </header>

      {erro && (
        <p className={styles.erro} role="alert">
          {erro}
        </p>
      )}

      <section
        className={styles.gradeIndicadores}
        aria-label="Indicadores do técnico"
      >
        {indicadores.map((indicador, indice) => (
          <CartaoMetrica
            key={indicador.titulo}
            estilo={{ animationDelay: `${indice * 0.05}s` }}
            icone={
              <span className="material-symbols-outlined">
                {indicador.icone}
              </span>
            }
            categoria={indicador.categoria}
            titulo={indicador.titulo}
            valor={carregando && !dashboard ? "—" : indicador.valor}
            unidade={indicador.unidade}
            contexto={indicador.contexto}
            critico={indicador.critico}
            badge={indicador.critico ? { texto: "Atenção" } : undefined}
          />
        ))}
      </section>
      <ResumoChamados
        porStatus={status}
        porPrioridade={chamados?.por_severidade_em_aberto}
        carregando={carregando}
      />
    </div>
  );
}
