"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./FeedbackModal.module.css";

export default function FeedbackModal({ feedback, onClose }) {
  const [closing, setClosing] = useState(false);
  const buttonRef = useRef(null);
  const id = useId();
  const isError = feedback?.type === "error" || feedback?.tipo === "erro";
  const message = feedback?.message ?? feedback?.mensagem ?? "";

  useEffect(() => {
    setClosing(false);
    if (feedback) buttonRef.current?.focus();
  }, [feedback]);

  if (!feedback) return null;

  function close() {
    if (!closing) setClosing(true);
  }

  function finishClose(event) {
    if (event.target === event.currentTarget && closing) {
      setClosing(false);
      onClose?.();
    }
  }

  return (
    <div
      className={`${styles.overlay} ${closing ? styles.overlayClosing : ""}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section
        className={`${styles.dialog} ${isError ? styles.error : styles.success} ${closing ? styles.dialogClosing : ""}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-message`}
        onKeyDown={(event) => {
          if (event.key === "Escape") close();
        }}
        onAnimationEnd={finishClose}
      >
        <span className={styles.icon} aria-hidden="true">
          {isError ? (
            <span className="material-symbols-outlined">close</span>
          ) : (
            <svg className={styles.check} viewBox="0 0 24 24" fill="none">
              <path className={styles.checkPath} d="m4.5 12.5 5 5 10-10" />
            </svg>
          )}
        </span>
        <h2 id={`${id}-title`}>
          {feedback.title ||
            (isError ? "Não foi possível concluir" : "Ação concluída")}
        </h2>
        <p id={`${id}-message`}>{message}</p>
        <button
          ref={buttonRef}
          type="button"
          className={styles.button}
          onClick={close}
        >
          Entendi
        </button>
      </section>
    </div>
  );
}
