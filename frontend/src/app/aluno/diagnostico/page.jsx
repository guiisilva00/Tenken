"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAulaAtual, ResumoAula } from "@/components/aluno/AulaContexto";
import styles from "./page.module.css";

function formatarTempo(segundos) {
  return [Math.floor(segundos / 3600), Math.floor((segundos % 3600) / 60), segundos % 60]
    .map((valor) => String(valor).padStart(2, "0")).join(":");
}

export default function DiagnosticoAluno() {
  const aula = useAulaAtual();
  const [segundos, setSegundos] = useState(aula?.segundos_restantes || 0);
  useEffect(() => {
    const limite = Date.now() + (aula?.segundos_restantes || 0) * 1000;
    const atualizar = () => setSegundos(Math.max(0, Math.ceil((limite - Date.now()) / 1000)));
    atualizar();
    const timer = window.setInterval(atualizar, 1000);
    return () => window.clearInterval(timer);
  }, [aula]);

  return (
    <section className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <p className={styles.sobretitulo}>ÁREA DO ALUNO / AULA ATUAL</p>
          <h1 className={styles.titulo}>Diagnóstico da aula</h1>
          <p className={styles.subtitulo}>{aula?.turma?.nome}</p>
        </div>
        <span className={`${styles.status} ${styles.statusAtivo}`} role="status">Acesso aprovado pelo professor</span>
      </header>
      <div className={styles.grade}>
        <div className={styles.colunaAula}>
          <section className={styles.cartaoAula} aria-labelledby="titulo-aula">
            <h2 id="titulo-aula">{aula?.agendamento?.atividade || "Atividade não informada"}</h2>
            <ResumoAula agendamento={aula?.agendamento} />
            <dl className={styles.dadosAula}>
              <div><dt>DOCENTE</dt><dd>{aula?.agendamento?.professor || "Não informado"}</dd></div>
              <div><dt>TEMPO RESTANTE</dt><dd className={styles.tempo}>{formatarTempo(segundos)}</dd></div>
              {aula?.equipamentos?.map((item) => (
                <div key={item.id}><dt>EQUIPAMENTO / LOCAL</dt><dd>{item.nome} / {item.localizacao || "Não informado"}</dd></div>
              ))}
            </dl>
          </section>
          <section className={styles.secaoEpis}>
            <h2>Antes de começar</h2>
            <p>Consulte o professor sobre os procedimentos de segurança e os EPIs exigidos para esta atividade. As inspeções são realizadas pelo professor.</p>
          </section>
          <Link className={styles.linkEquipamentos} href="/aluno/equipamentos">Ver equipamentos desta aula ↗</Link>
        </div>
        <aside className={styles.colunaAcesso}>
          <section className={styles.liberacao}>
            <span className={styles.numeroEtapa}>ACESSO CONFIRMADO</span>
            <h2>Consulte sua reserva</h2>
            <p>Seu acesso permite consultar os equipamentos associados à aula durante o período ativo do agendamento.</p>
            <Link className={styles.botaoEquipamentos} href="/aluno/equipamentos">Abrir equipamentos</Link>
          </section>
        </aside>
      </div>
    </section>
  );
}
