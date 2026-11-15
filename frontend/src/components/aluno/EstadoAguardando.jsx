import styles from "./EstadoAguardando.module.css";

export default function EstadoAguardando({
  sessao,
  token,
  onCancelar,
  onSimularAprovacao,
}) {
  return (
    <section className={styles.painel} aria-labelledby="titulo-aguardando">
      <p className={styles.badge} role="status">
        <span className={styles.ponto} aria-hidden="true" />
        Aguardando aprovação do professor no painel central...
      </p>

      <h1 className={styles.titulo} id="titulo-aguardando">
        Solicitação enviada
      </h1>
      <p className={styles.descricao}>
        Sua solicitação foi enviada ao painel do laboratório. Aguarde a
        liberação para iniciar a inspeção.
      </p>

      <dl className={styles.dados}>
        <div className={styles.item}>
          <dt>Aluno</dt>
          <dd>{sessao.nome}</dd>
        </div>
        <div className={styles.item}>
          <dt>Turma</dt>
          <dd>{sessao.turma}</dd>
        </div>
        <div className={`${styles.item} ${styles.token}`}>
          <dt>Token enviado</dt>
          <dd>{token}</dd>
        </div>
      </dl>

      <div className={styles.acoes}>
        <button className={styles.cancelar} type="button" onClick={onCancelar}>
          Cancelar solicitação
        </button>
        {process.env.NODE_ENV === "development" && (
          <button
            className={styles.simular}
            type="button"
            onClick={onSimularAprovacao}
          >
            Simular aprovação
          </button>
        )}
      </div>
    </section>
  );
}
