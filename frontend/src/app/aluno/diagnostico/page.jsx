"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import styles from "./page.module.css";

const INTERVALO_CHECKIN = 15_000;
const FUSO_LABORATORIO = "America/Sao_Paulo";

function dataHojeNoLaboratorio() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_LABORATORIO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const valores = Object.fromEntries(partes.map(({ type, value }) => [type, value]));
  return `${valores.year}-${valores.month}-${valores.day}`;
}

function chaveDataHora(data, horario) {
  if (!data || !horario) return null;
  return `${data}T${horario}`;
}

function agoraNoLaboratorio() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_LABORATORIO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const valores = Object.fromEntries(partes.map(({ type, value }) => [type, value]));
  return `${valores.year}-${valores.month}-${valores.day}T${valores.hour}:${valores.minute}`;
}

function avaliarHorario(atividade, agora = agoraNoLaboratorio()) {
  const inicio = chaveDataHora(atividade?.data, atividade?.inicio);
  const fim = chaveDataHora(atividade?.data, atividade?.fim);
  if (inicio === null || fim === null) return "futuro";
  if (atividade.status === "CONCLUIDO") return "encerrada";
  if (agora < inicio) return "futuro";
  if (agora >= fim) return "encerrada";
  return "andamento";
}

function formatarData(data) {
  if (!data) return "Data não informada";
  const [ano, mes, dia] = data.split("-").map(Number);
  if (![ano, mes, dia].every(Number.isFinite)) return data;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    .format(new Date(ano, mes - 1, dia));
}

function calcularDuracao(inicio, fim) {
  if (!inicio || !fim) return "";
  const [horaInicio, minutoInicio] = inicio.split(":").map(Number);
  const [horaFim, minutoFim] = fim.split(":").map(Number);
  const minutos = horaFim * 60 + minutoFim - (horaInicio * 60 + minutoInicio);
  if (!Number.isFinite(minutos) || minutos <= 0) return "";
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return [horas ? `${horas}h` : "", resto ? `${resto}min` : ""].filter(Boolean).join(" ");
}

function escolherAtividade(agendamentos = []) {
  const deHoje = agendamentos.filter((item) => item.data === dataHojeNoLaboratorio());
  if (!deHoje.length) return null;
  const agora = agoraNoLaboratorio();
  return [...deHoje].sort((a, b) => {
    const prioridade = (item) => {
      const estado = avaliarHorario(item, agora);
      return estado === "andamento" ? 0 : estado === "futuro" ? 1 : 2;
    };
    return prioridade(a) - prioridade(b) || (a.inicio || "").localeCompare(b.inicio || "");
  })[0];
}

function Icone({ nome, className, ariaHidden = true }) {
  return <span className={`material-symbols-outlined ${className || ""}`} aria-hidden={ariaHidden}>{nome}</span>;
}

export default function DiagnosticoAluno() {
  const [dados, setDados] = useState(null);
  const [checkin, setCheckin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [agora, setAgora] = useState(agoraNoLaboratorio());

  const atualizarCheckin = useCallback(async (signal) => {
    try {
      const resposta = await apiFetch("/api/checkins/atual", { signal });
      setCheckin(resposta?.dados ?? resposta);
    } catch (falha) {
      if (signal?.aborted) return;
      if (falha.status === 404) {
        setCheckin(null);
        return;
      }
      // Mantém o último estado conhecido se a consulta temporária falhar.
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      apiFetch("/api/alunos/area", { signal: controller.signal }),
      apiFetch("/api/checkins/atual", { signal: controller.signal })
        .catch((falha) => falha.status === 404 ? null : Promise.reject(falha)),
    ]).then(([area, checkin]) => {
      setDados(area?.dados ?? area);
      setCheckin(checkin?.dados ?? checkin);
      setErro("");
    }).catch((falha) => {
      if (!controller.signal.aborted) setErro(falha.message || "Não foi possível carregar seus dados.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });

    const intervalo = window.setInterval(() => {
      if (document.visibilityState === "visible") atualizarCheckin();
    }, INTERVALO_CHECKIN);
    const aoVoltar = () => {
      if (document.visibilityState === "visible") atualizarCheckin();
    };
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      controller.abort();
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, [atualizarCheckin]);

  useEffect(() => {
    const intervalo = window.setInterval(() => setAgora(agoraNoLaboratorio()), 30_000);
    return () => window.clearInterval(intervalo);
  }, []);

  const atividade = useMemo(() => escolherAtividade(dados?.agendamentos), [dados, agora]);
  const checkinDaTurma = !atividade?.turma_id || !checkin?.turma?.id || Number(checkin.turma.id) === Number(atividade.turma_id);
  const aprovado = Boolean(atividade && checkin?.aprovado && checkinDaTurma);
  const statusHorario = atividade ? avaliarHorario(atividade, agora) : null;
  const turma = atividade?.turma || dados?.turmas?.[0]?.nome || "Nenhuma turma vinculada";
  const horario = atividade ? `${atividade.inicio}–${atividade.fim}` : "Horário não informado";
  const duracao = calcularDuracao(atividade?.inicio, atividade?.fim);

  let statusPrincipal = "Carregando diagnóstico";
  let detalheStatus = "Buscando sua aula e o estado do check-in.";
  let classeStatus = "statusNeutro";
  if (!loading && erro) {
    statusPrincipal = "Não foi possível carregar";
    detalheStatus = "Verifique sua conexão e tente novamente.";
    classeStatus = "statusErro";
  } else if (!loading && !atividade) {
    statusPrincipal = "Sem aula hoje";
    detalheStatus = "Não há agendamento para sua turma nesta data.";
    classeStatus = "statusNeutro";
  } else if (!loading && atividade) {
    if (statusHorario === "encerrada") {
      statusPrincipal = "Aula encerrada";
      detalheStatus = aprovado ? "Seu check-in foi aprovado." : "O check-in não foi aprovado durante esta aula.";
      classeStatus = "statusEncerrado";
    } else if (statusHorario === "futuro") {
      statusPrincipal = "Aula ainda não começou";
      detalheStatus = aprovado ? "Seu acesso está aprovado para o horário agendado." : "Aguardando aprovação do professor.";
      classeStatus = aprovado ? "statusAprovado" : "statusPendente";
    } else {
      statusPrincipal = aprovado ? "Acesso confirmado" : "Check-in pendente";
      detalheStatus = aprovado ? "Você está liberado para usar a bancada." : "Aguardando aprovação do professor.";
      classeStatus = aprovado ? "statusAprovado" : "statusPendente";
    }
  }

  const mostrarErro = !loading && Boolean(erro);
  const semAula = !loading && !erro && !atividade;

  return (
    <section className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <h1 className={styles.titulo}>Diagnóstico</h1>
          <p className={styles.subtitulo}>Resumo da sua aula de hoje e liberação de acesso.</p>
        </div>
      </header>

      <section className={`${styles.faixaStatus} ${styles[classeStatus]}`} role="status" aria-live="polite" aria-busy={loading}>
        <span className={styles.iconeStatus} aria-hidden="true">
          <Icone nome={loading ? "progress_activity" : mostrarErro ? "error" : semAula ? "event_busy" : aprovado ? "check_circle" : "schedule"} />
        </span>
        <div className={styles.statusTexto}>
          <strong>{statusPrincipal}</strong>
          <span>{atividade ? `${atividade.equipamento || "Equipamento não informado"} · ${horario}${duracao ? ` · ${duracao}` : ""}` : detalheStatus}</span>
        </div>
      </section>

      <div className={styles.grade}>
        <div className={styles.colunaAula}>
          <section className={styles.cartaoAula} aria-labelledby="titulo-aula" aria-busy={loading}>
            <div className={styles.cabecalhoAula}>
              <div>
                <h2 id="titulo-aula">{loading ? "Carregando sua aula…" : atividade?.atividade || (semAula ? "Sua agenda está livre" : "Detalhes da aula")}</h2>
                <p>{loading ? "Estamos consultando os agendamentos da sua turma." : atividade ? "Confira o equipamento e o período reservados para você." : semAula ? "Quando houver uma aula agendada, os detalhes aparecerão aqui." : "Os detalhes da aula serão exibidos assim que estiverem disponíveis."}</p>
              </div>
              {atividade && <span className={styles.dataAula}>{formatarData(atividade.data)}</span>}
            </div>

            {mostrarErro ? <div className={styles.mensagemErro} role="alert"><strong>O diagnóstico não carregou.</strong><span>{erro}</span><button type="button" onClick={() => window.location.reload()}>Tentar novamente</button></div> : null}
            {loading ? <div className={styles.esqueleto} aria-hidden="true"><span /><span /><span /></div> : null}
            {semAula ? <p className={styles.mensagemVazia}>Você não tem aula marcada para hoje. Consulte seus próximos agendamentos na área do aluno.</p> : null}

            {atividade && <div className={styles.detalhesAula}>
              <div className={styles.equipamento}>
                <span className={styles.iconeEquipamento} aria-hidden="true"><Icone nome="precision_manufacturing" /></span>
                <div><span className={styles.rotulo}>EQUIPAMENTO</span><strong>{atividade.equipamento || "Equipamento não informado"}</strong>{atividade.patrimonio && <small>Patrimônio {atividade.patrimonio}</small>}</div>
              </div>
              <div className={styles.horario}>
                <span className={styles.rotulo}>HORÁRIO DA AULA</span>
                <strong>{horario}</strong>
                {duracao && <small>{duracao} de atividade</small>}
              </div>
              <dl className={styles.dadosSecundarios}>
                <div><dt>Turma</dt><dd>{turma}</dd></div>
                <div><dt>Data</dt><dd>{formatarData(atividade.data)}</dd></div>
              </dl>
            </div>}
          </section>
        </div>

        <aside className={styles.colunaAcesso} aria-label="Acesso à bancada">
          <section className={styles.cartaoAcesso}>
            <div className={styles.estadoCheckin}>
              <span className={`${styles.pontoEstado} ${aprovado ? styles.pontoAprovado : styles.pontoPendente}`} aria-hidden="true" />
              <div><span className={styles.rotulo}>CHECK-IN</span><strong>{loading ? "Consultando…" : erro ? "Indisponível" : !atividade ? "Sem aula hoje" : aprovado ? "Aprovado" : "Aguardando professor"}</strong></div>
            </div>
            {atividade?.localizacao && <div className={styles.localizacao}><Icone nome="location_on" /><div><span className={styles.rotulo}>LOCALIZAÇÃO</span><strong>{atividade.localizacao}</strong></div></div>}
            {!loading && !erro && atividade && (aprovado ? <Link className={styles.botaoEquipamentos} href="/aluno/equipamentos">Abrir equipamentos<Icone nome="arrow_forward" /></Link> : <Link className={styles.botaoSecundario} href="/aluno">Solicitar acesso<Icone nome="arrow_forward" /></Link>)}
            {!loading && !erro && atividade && <p className={styles.ajudaAcesso}>{aprovado ? "Consulte os equipamentos disponíveis para sua turma." : "Peça acesso usando o token compartilhado pelo professor."}</p>}
          </section>
        </aside>
      </div>
    </section>
  );
}
