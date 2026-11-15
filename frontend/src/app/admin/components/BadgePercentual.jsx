import styles from "./BadgePercentual.module.css";

export default function BadgePercentual({
  cor,
  rotulo,
  percentual,
  quantidade,
}) {
  return (
    <div className={styles.linha}>
      <span className={styles.marcador} style={{ background: cor }} />
      <span className={styles.rotulo}>{rotulo}</span>
      <span className={styles.percentual}>{percentual}</span>
      <span className={styles.quantidade}>{quantidade}</span>
    </div>
  );
}
