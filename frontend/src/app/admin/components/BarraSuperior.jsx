"use client";

import styles from "./BarraSuperior.module.css";

export default function BarraSuperior({
  usuario,
  logado,
  onSair,
  titulo = "Visão Geral",
}) {
  return (
    <header className={styles.barra}>
      <div className={styles.trilhaBloco}>
        <nav className={styles.trilha} aria-label="Trilha de navegação">
          <span>TENKEN</span>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "14px" }}
          >
            chevron_right
          </span>
          <span>Administração</span>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "14px" }}
          >
            chevron_right
          </span>
          <span className={styles.trilhaAtual}>{titulo}</span>
        </nav>
      </div>

      {logado && (
        <div className={styles.conta}>
          <div className={styles.avatar} aria-hidden="true">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              person
            </span>
          </div>
          <div className={styles.identidade}>
            <span className={styles.nome}>
              {usuario?.nome || usuario?.matricula || "Administrador"}
            </span>
            <span className={styles.cargo}>ADMINISTRADOR</span>
          </div>
          <button
            className={styles.sair}
            onClick={onSair}
            type="button"
            aria-label="Sair"
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: "18px",
                color: "var(--status-critical, #ef4444)",
              }}
            >
              power_settings_new
            </span>
            <span>Sair</span>
          </button>
        </div>
      )}
    </header>
  );
}
