"use client";

import { useState } from "react";
import styles from "./EstadoAguardando.module.css";
import { ResumoAula } from "./AulaContexto";

export default function EstadoAguardando({ sessao, token, mensagem, agendamento, onCancelar, onVerificar }) {
  const [verificando, setVerificando] = useState(false);

  async function verificarNovamente() {
    if (verificando) return;
    setVerificando(true);
    try {
      await onVerificar();
    } finally {
      setVerificando(false);
    }
  }

  return (
    <section className={styles.painel} aria-labelledby="titulo-aguardando">
      <p className={styles.badge} role="status"><span className={styles.ponto} aria-hidden="true" /> Aguardando aprovação do professor</p>
      <h1 className={styles.titulo} id="titulo-aguardando">Solicitação enviada</h1>
      <p className={styles.descricao}>Aguarde a liberação do professor para iniciar a atividade no laboratório.</p>
      {mensagem && <p className={styles.aviso} role="status">{mensagem}</p>}
      <dl className={styles.dados}>
        <div className={styles.item}><dt>Aluno</dt><dd>{sessao.nome}</dd></div>
        <div className={styles.item}><dt>Turma</dt><dd>{sessao.turma}</dd></div>
        {sessao.equipamentos?.map((item) => <div className={styles.item} key={item.id}><dt>Equipamento</dt><dd>{item.nome}</dd></div>)}
        {agendamento && <div className={`${styles.item} ${styles.agendamento}`}><dt>Agendamento</dt><dd><ResumoAula agendamento={agendamento} /></dd></div>}
      {token && <div className={`${styles.item} ${styles.token}`}><dt>Token enviado</dt><dd>{token}</dd></div>}
      </dl>
      <div className={styles.acoes}>
        <button className={styles.verificar} type="button" onClick={verificarNovamente} disabled={verificando}>
          {verificando ? "Verificando…" : "Verificar novamente"}
        </button>
        <button className={styles.cancelar} type="button" onClick={onCancelar}>Voltar</button>
      </div>
    </section>
  );
}
