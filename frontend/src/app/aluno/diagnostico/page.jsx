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

  return (
    <section className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div><h1 className={styles.titulo}>Diagnóstico da aula</h1><p className={styles.subtitulo}>{turma}</p></div>
        <div className={`${styles.status} ${aprovado ? styles.statusAtivo : styles.statusEspera}`} role="status">
          <span className={`${styles.led} ${aprovado ? styles.ledAtivo : ""}`} aria-hidden="true" />
          {aprovado ? "Acesso aprovado" : "Aguardando aprovação"}
        </div>
        <span className={`${styles.status} ${styles.statusAtivo}`} role="status">Acesso aprovado pelo professor</span>
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
