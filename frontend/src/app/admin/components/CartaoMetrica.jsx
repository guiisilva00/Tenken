import styles from "./CartaoMetrica.module.css";

export default function CartaoMetrica({
  icone,
  categoria,
  titulo,
  valor,
  unidade,
  contexto,
  badge,
  critico,
  estilo,
}) {
  return (
    <article
      className={`${styles.cartao} ${critico ? styles.cartaoCritico : ""} tenken-entrada`}
      style={estilo}
    >
      <span
        className={`${styles.barraTopo} ${critico ? styles.barraTopoCritica : ""}`}
      />

      <div className={styles.topo}>
        <div className={styles.rotulos}>
          <span className={styles.categoria}>{categoria}</span>
          <span className={styles.titulo}>{titulo}</span>
        </div>

        {badge ? (
          <span
            className={`${styles.badge} ${badge.tom === "neutro" ? styles.badgeNeutro : styles.badgeCritico}`}
          >
            {critico && (
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "14px" }}
              >
                warning
              </span>
            )}
            {badge.texto}
          </span>
        ) : (
          <span className={styles.icone}>{icone}</span>
        )}
      </div>

      <div className={styles.valorLinha}>
        <strong
          className={`${styles.valor} ${critico ? styles.valorCritico : ""}`}
        >
          {valor}
        </strong>
        {unidade && <span className={styles.unidade}>{unidade}</span>}
      </div>

      {contexto && (
        <div className={styles.contexto}>
          {contexto.icone && (
            <span
              className={
                critico ? styles.contextoIconeCritico : styles.contextoIcone
              }
            >
              {contexto.icone}
            </span>
          )}
          {contexto.destaque && (
            <span className={styles.contextoDestaque}>{contexto.destaque}</span>
          )}
          {contexto.texto && (
            <span className={styles.contextoTexto}>{contexto.texto}</span>
          )}
        </div>
      )}
    </article>
  );
}
