"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import styles from "./page.module.css";

export default function DiagnosticoAluno() {
  const [dados, setDados] = useState(null);
  const [aprovado, setAprovado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [dicaIndex, setDicaIndex] = useState(0);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/alunos/area"),
      apiFetch("/api/checkins/atual").catch((e) => e.status === 404 ? null : Promise.reject(e)),
    ]).then(([area, checkin]) => {
      setDados(area?.dados ?? area);
      setAprovado(Boolean(checkin?.dados?.aprovado));
    }).catch((e) => setErro(e.message || "Não foi possível carregar seus dados."))
      .finally(() => setLoading(false));
  }, []);

  const atividade = dados?.agendamentos?.find((a) => ["CONFIRMADO", "EM_ANDAMENTO"].includes(a.status));
  const turma = atividade?.turma || dados?.turmas?.[0]?.nome || "Nenhuma turma vinculada";
  const dataAula = atividade?.data
    ? /^\d{4}-\d{2}-\d{2}$/.test(atividade.data)
      ? atividade.data.split("-").reverse().join("/")
      : atividade.data
    : "";
  const dicas = loading
    ? ["Carregando as informações da sua aula."]
    : erro
      ? ["Tente atualizar a página para carregar os dados novamente.", "Se o problema continuar, avise o professor responsável."]
      : !atividade
        ? ["Quando houver uma reserva vinculada à sua turma, os detalhes aparecem aqui.", "Confirme com o professor se sua turma tem uma atividade agendada."]
        : aprovado
          ? ["Seu check-in foi aprovado. Confira a bancada e o horário reservado antes de começar.", "Use os EPIs indicados e siga as orientações de segurança do laboratório.", "Ao terminar, devolva o equipamento e complete a inspeção pós-uso."]
          : ["O token registra seu pedido de acesso; aguarde a aprovação do professor para entrar.", "Confira se a atividade e o horário correspondem à reserva da sua turma.", "Se o professor ainda não aprovou, peça ajuda diretamente a ele."];
  const dicaAtual = dicas[dicaIndex % dicas.length];

  return (
    <section className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <h1 className={styles.titulo}>Diagnóstico da aula</h1>
          <p className={styles.subtitulo}>{turma}</p>
          <p className={styles.resumoCabecalho}>
            {loading ? (
              "Buscando os detalhes da sua atividade e do acesso à bancada…"
            ) : erro ? (
              "Não foi possível carregar o resumo da aula. Tente atualizar a página."
            ) : atividade ? (
              <>
                A atividade <strong>{atividade.atividade || "da sua turma"}</strong>
                {dataAula && <> acontece em <strong>{dataAula}</strong></>}
                {atividade.inicio && atividade.fim && <>, das <strong>{atividade.inicio}–{atividade.fim}</strong></>}
                {atividade.equipamento && <> na <strong>{atividade.equipamento}</strong></>}
                {aprovado
                  ? ". Seu acesso está aprovado."
                  : ". Seu check-in aguarda aprovação do professor."}
              </>
            ) : (
              "Quando uma atividade for agendada para sua turma, você verá aqui o resumo do horário, equipamento e acesso."
            )}
          </p>
          <div className={styles.dica}>
            <svg className={styles.iconeDica} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M9 18h6M10 21h4M8.5 14.5a6 6 0 1 1 7 0c-.8.6-1.2 1.4-1.3 2.5h-4.4c-.1-1.1-.5-1.9-1.3-2.5Z" />
              <path d="M12 2v1M4.9 4.9l.7.7M2 12h1M20 12h1M18.4 5.6l.7-.7" />
            </svg>
            <p className={styles.textoDica} aria-live="polite">
              <strong>Dica da aula</strong>
              <span>{dicaAtual}</span>
            </p>
            <button
              className={styles.proximaDica}
              type="button"
              aria-label="Mostrar próxima dica"
              onClick={() => setDicaIndex((atual) => atual + 1)}
            >
              <span>Outra dica</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M20 7v5h-5M4.9 9a7.5 7.5 0 0 1 12.4-2L20 12M4 17v-5h5m10.1 3a7.5 7.5 0 0 1-12.4 2L4 12" />
              </svg>
            </button>
          </div>
        </div>

      </header>
      <div className={styles.grade}>
        <div className={styles.colunaAula}>
          <section className={styles.cartaoAula} aria-labelledby="titulo-aula" aria-busy={loading}>
            <h2 id="titulo-aula">{loading ? "Carregando atividade…" : atividade?.atividade || "Nenhuma atividade agendada"}</h2>
            {erro ? <p role="alert">{erro}</p> : !loading && !atividade ? <p>Quando houver um agendamento para sua turma, os detalhes aparecerão aqui.</p> : null}
            <dl className={styles.dadosAula}>
              <div><dt>TURMA</dt><dd>{turma}</dd></div>
              <div><dt>DATA</dt><dd>{atividade?.data || "—"}</dd></div>
              <div><dt>EQUIPAMENTO</dt><dd>{atividade?.equipamento || "—"}</dd></div>
              <div><dt>HORÁRIO</dt><dd>{atividade ? `${atividade.inicio}–${atividade.fim}` : "—"}</dd></div>
            </dl>
          </section>
          {!aprovado && <section className={styles.secaoEpis}><h2>Acesso pendente</h2><p>Solicite acesso com o token compartilhado pelo professor e aguarde a aprovação do check-in.</p><Link href="/aluno">Solicitar acesso</Link></section>}
          <Link className={styles.linkEquipamentos} href="/aluno/equipamentos">Ver equipamentos da turma <span aria-hidden="true">↗</span></Link>
        </div>
        <aside className={styles.colunaAcesso}>
          {aprovado && <section className={styles.liberacao}><h2>Acesso confirmado</h2><p>Seu check-in foi aprovado. Os equipamentos da sua turma estão disponíveis para consulta.</p><Link className={styles.botaoEquipamentos} href="/aluno/equipamentos">Abrir equipamentos</Link></section>}
        </aside>
      </div>
    </section>
  );
}
