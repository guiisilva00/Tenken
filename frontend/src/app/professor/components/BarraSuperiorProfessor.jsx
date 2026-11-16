"use client";

import styles from "./BarraSuperiorProfessor.module.css";

export default function BarraSuperiorProfessor({
  titulo,
  usuario,
  onSair,
  onAbrirMenu,
}) {
  const iniciais =
    usuario?.nome
      ?.split(/\s+/)
      .map((parte) => parte[0])
      .slice(0, 2)
      .join("") || "PR";

  return (
    <header className={styles.barra}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={onAbrirMenu}
        aria-label="Abrir menu"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>
      <nav className={styles.trilha} aria-label="Trilha de navegação">
        <span>TENKEN</span>
        <span className="material-symbols-outlined" aria-hidden="true">
          chevron_right
        </span>
        <span>Espaço do professor</span>
        <span className="material-symbols-outlined" aria-hidden="true">
          chevron_right
        </span>
        <strong>{titulo}</strong>
      </nav>
      <div className={styles.conta}>
        <div className={styles.identificacao}>
          <span className={styles.avatar} aria-hidden="true">
            {iniciais}
          </span>
          <span className={styles.dadosUsuario}>
            <span className={styles.nome}>{usuario?.nome || "Professor"}</span>
            <span className={styles.status}>PROFESSOR</span>
          </span>
        </div>
        <button
          type="button"
          className={styles.sair}
          onClick={onSair}
          aria-label="Sair da sessão"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            power_settings_new
          </span>
          Sair
        </button>
      </div>
    </header>
  );
}
