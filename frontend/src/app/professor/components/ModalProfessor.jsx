"use client";

import { useEffect, useRef } from "react";
import styles from "./ModalProfessor.module.css";
import modalStyles from "../../admin/equipamentos/page.module.css";

export default function ModalProfessor({
  titulo,
  descricao,
  onClose,
  children,
  largura = "normal",
  icone,
  closing = false,
  onExitEnd,
}) {
  const modalRef = useRef(null);
  useEffect(() => {
    const focoAnterior = document.activeElement;
    const modal = modalRef.current;
    const seletor =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    (modal?.querySelector(seletor) || modal)?.focus();
    function fecharComEscape(evento) {
      if (evento.key === "Escape" && !closing) onClose();
      if (evento.key === "Tab" && modal) {
        const focaveis = [...modal.querySelectorAll(seletor)];
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        if (!primeiro || !ultimo) {
          evento.preventDefault();
          modal.focus();
        } else if (evento.shiftKey && document.activeElement === primeiro) {
          evento.preventDefault();
          ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
          evento.preventDefault();
          primeiro.focus();
        }
      }
    }
    window.addEventListener("keydown", fecharComEscape);
    return () => {
      window.removeEventListener("keydown", fecharComEscape);
      if (focoAnterior?.isConnected) focoAnterior.focus();
    };
  }, [onClose, closing]);

  return (
    <div
      className={`${styles.fundo} abrir-modal-fundo ${closing ? "fechar-modal-fundo" : ""}`}
      onMouseDown={(evento) =>
        evento.target === evento.currentTarget && !closing && onClose()
      }
    >
      <section
        ref={modalRef}
        onAnimationEnd={onExitEnd}
        tabIndex={-1}
        className={`${styles.modal} abrir-modal ${largura === "larga" ? styles.modalLargo : ""} ${closing ? "fechar-modal" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-professor"
      >
        <header className={styles.cabecalho}>
          <div className={styles.cabecalhoEsquerdo}>
            {icone && (
              <div className={modalStyles.modalHeaderIcon}>
                <span className="material-symbols-outlined" aria-hidden="true">
                  {icone}
                </span>
              </div>
            )}
            <div className={styles.titulos}>
              <h2 id="titulo-modal-professor">{titulo}</h2>
              {descricao && <p>{descricao}</p>}
            </div>
          </div>
          <button
            className={styles.fechar}
            type="button"
            onClick={onClose}
            disabled={closing}
            aria-label="Fechar janela"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </header>
        <div className={styles.conteudo}>{children}</div>
      </section>
    </div>
  );
}
