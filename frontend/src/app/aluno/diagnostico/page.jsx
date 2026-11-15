"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { aulaHoje, episObrigatorios, sessaoAluno } from "@/mocks/aluno";
import styles from "./page.module.css";

function formatarTempo(segundos) {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const restantes = segundos % 60;
  return [horas, minutos, restantes]
    .map((valor) => String(valor).padStart(2, "0"))
    .join(":");
}

export default function DiagnosticoAluno() {
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const bancadaLiberada = true;

  useEffect(() => {
    function atualizarCronometro() {
      const fim = new Date(sessaoAluno.fimDaAula).getTime();
      setSegundosRestantes(
        Number.isNaN(fim)
          ? 0
          : Math.max(0, Math.floor((fim - Date.now()) / 1000)),
      );
    }
    atualizarCronometro();
    const intervalo = window.setInterval(atualizarCronometro, 1000);
    return () => window.clearInterval(intervalo);
  }, []);

  return (
    <section className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <p className={styles.sobretitulo}>ÁREA DO ALUNO / PLANO DE AULA</p>
          <h1 className={styles.titulo}>Diagnóstico da aula</h1>
          <p className={styles.subtitulo}>{sessaoAluno.turma}</p>
        </div>
        <div
          className={`${styles.status} ${bancadaLiberada ? styles.statusAtivo : styles.statusEspera}`}
          role="status"
        >
          <span
            className={`${styles.led} ${bancadaLiberada ? styles.ledAtivo : ""}`}
            aria-hidden="true"
          />
          Bancada liberada
        </div>
      </header>

      <div className={styles.grade}>
        <div className={styles.colunaAula}>
          <section className={styles.cartaoAula} aria-labelledby="titulo-aula">
            <span className={styles.numeroEtapa}>AULA DE HOJE</span>
            <h2 id="titulo-aula">{aulaHoje.tema}</h2>
            <p>
              Durante a atividade, você vai praticar o controle de atuadores
              pneumáticos usando um CLP, identificar os componentes da bancada e
              seguir os procedimentos de inspeção e segurança do laboratório.
            </p>
            <dl className={styles.dadosAula}>
              <div>
                <dt>DOCENTE</dt>
                <dd>{aulaHoje.professor}</dd>
              </div>
              <div>
                <dt>LOCAL</dt>
                <dd>Laboratório LAB-AUT-01</dd>
              </div>
              <div>
                <dt>POSTO</dt>
                <dd>PAT-204</dd>
              </div>
              <div>
                <dt>TEMPO RESTANTE</dt>
                <dd className={styles.tempo}>
                  {formatarTempo(segundosRestantes)}
                </dd>
              </div>
            </dl>
          </section>

          <section className={styles.secaoEpis} aria-labelledby="titulo-epis">
            <h2 id="titulo-epis">Antes de começar</h2>
            <p>Utilize os EPIs obrigatórios durante toda a atividade:</p>
            <ul>
              {episObrigatorios.map((epi) => (
                <li key={epi}>{epi}</li>
              ))}
            </ul>
          </section>

          <Link className={styles.linkEquipamentos} href="/aluno/equipamentos">
            Ver equipamentos desta aula <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <aside className={styles.colunaAcesso}>
          {bancadaLiberada && (
            <section className={styles.liberacao}>
              <span className={styles.numeroEtapa}>ACESSO CONFIRMADO</span>
              <h2>Bancada liberada</h2>
              <p>
                Você já pode consultar os equipamentos e iniciar a inspeção da
                aula.
              </p>
              <Link
                className={styles.botaoEquipamentos}
                href="/aluno/equipamentos"
              >
                Abrir equipamentos
              </Link>
            </section>
          )}
        </aside>
      </div>
    </section>
  );
}
