import styles from "./EmptyState.module.css";

export default function EmptyState({ icone, titulo, mensagem, acao }) {
  return (
    <div className={styles.vazio}>
      <span className="material-symbols-outlined" aria-hidden="true">
        {icone}
      </span>
      <h3>{titulo}</h3>
      <p>{mensagem}</p>
      {acao}
    </div>
  );
}
