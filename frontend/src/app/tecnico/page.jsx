"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import CartaoMetrica from "../admin/components/CartaoMetrica";
import ResumoChamados from "./components/ResumoChamados";
import { getUsuario } from "@/lib/session";
import { dataPorExtenso, saudacaoPorHorario } from "@/lib/saudacao";
import styles from "./page.module.css";

function totalPorChave(itens, chave, valor) {
  if (!Array.isArray(itens)) return 0;
  return Number(itens.find((item) => item[chave] === valor)?.total ?? 0);
}

function somarStatus(itens, statusDesejados) {
  return statusDesejados.reduce((total, status) => total + totalPorChave(itens, "status", status), 0);
}

export default function PaginaTecnico() {
  const [dashboard, setDashboard] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const usuario = getUsuario();
  const primeiroNome = usuario?.nome?.split(" ")[0] || "técnico";

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
    carregar();
  }, [carregar]);

  const chamados = dashboard?.chamados;
  const status = chamados?.por_status;
  const ativos = somarStatus(status, ["ABERTO", "EM_ATENDIMENTO"]);
  const criticos = totalPorChave(chamados?.por_severidade_em_aberto, "severidade", "CRITICA");
  const concluidos = totalPorChave(status, "status", "CONCLUIDO");
  const equipamentosEmManutencao = Number(dashboard?.equipamentos?.em_manutencao ?? 0);

  const indicadores = [
    {
      categoria: "Atendimento",
      titulo: "Chamados ativos",
      valor: ativos,
      unidade: "atribuídos a você",
      icone: "confirmation_number",
      contexto: { texto: "Abertos ou em atendimento" },
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
      unidade: "atribuídos a você",
      icone: "task_alt",
      contexto: { texto: "Total de chamados finalizados" },
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.dataHoje}>{dataPorExtenso()}</p>
          <p className={styles.saudacao}>{saudacaoPorHorario()}, {primeiroNome}.</p>
          <p className={styles.sobretitulo}>Operação técnica</p>
          <h1 className={styles.titulo}>Visão geral</h1>
          <p className={styles.descricao}>Acompanhe os chamados atribuídos e a condição dos equipamentos.</p>
          <p className={styles.atualizacao}>
            {atualizadoEm ? `Atualizado às ${atualizadoEm.toLocaleTimeString("pt-BR")}` : "Aguardando dados da API"}
          </p>
        </div>
        <button type="button" className={styles.botaoAtualizar} onClick={carregar} disabled={carregando}>
          <span className={`material-symbols-outlined ${carregando ? styles.girando : ""}`}>sync</span>
          {carregando ? "Atualizando" : "Atualizar"}
        </button>
      </header>

      {erro && <p className={styles.erro} role="alert">{erro}</p>}

      <section className={styles.gradeIndicadores} aria-label="Indicadores do técnico">
        {indicadores.map((indicador, indice) => (
          <CartaoMetrica
            key={indicador.titulo}
            estilo={{ animationDelay: `${indice * 0.05}s` }}
            icone={<span className="material-symbols-outlined">{indicador.icone}</span>}
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
      {criticos > 0 && (
        <Link className={styles.alertaCritico} href="/tecnico/chamados" role="status">
          <span className="material-symbols-outlined" aria-hidden="true">notification_important</span>
          <span><strong>{criticos} {criticos === 1 ? "chamado crítico aguarda" : "chamados críticos aguardam"} atendimento</strong><small>Priorize a avaliação e abra a ordem de serviço.</small></span>
          <span className={`material-symbols-outlined ${styles.alertaSeta}`} aria-hidden="true">arrow_forward</span>
        </Link>
      )}
      <ResumoChamados
        porStatus={status}
        porPrioridade={chamados?.por_severidade_em_aberto}
        porCategoria={dashboard?.equipamentos?.por_categoria}
        carregando={carregando}
      />
    </div>
  );
}
