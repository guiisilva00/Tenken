import styles from "./StatusConexao.module.css";

export default function StatusConexao({ estado }) {
  const liberado = estado === "liberado";
  const aguardando = estado === "aguardando";
  const texto = liberado
    ? "Conectado"
    : aguardando
      ? "Sincronizando"
      : "Desconectado";

  return (
    <div
      className={`${styles.status} ${liberado ? styles.liberado : aguardando ? styles.aguardando : styles.desconectado}`}
      role="status"
      aria-label={texto}
    >
      <span className={styles.ponto} aria-hidden="true" />
      <span>{texto}</span>
    </div>
  );
}
