"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./loading.module.css";

const TEMPO_CARREGANDO = 1000;

// alternando 点 e 検 (ten ken)
const SIMBOLOS = ["点", "検", "点", "検", "点", "検", "点", "検"];

export default function InitialLoader() {
  const pathname = usePathname();
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    setVisivel(true);
    const tempo = window.setTimeout(() => {
      window.dispatchEvent(new Event("tenken:loader-complete"));
      setVisivel(false);
    }, TEMPO_CARREGANDO);
    return () => window.clearTimeout(tempo);
  }, []);

  if (pathname !== "/" || !visivel) return null;

  return <LoadingIndicator />;
}

export function LoadingIndicator() {
  return (
    <div
      className={styles.overlay}
      role="status"
      aria-label="Carregando o sistema Tenken"
    >
      <div className={styles.conteudo}>
        <div className={styles.spinner} aria-hidden="true">
          {SIMBOLOS.map((simbolo, i) => (
            <div key={i} className={styles.item}>
              <span>{simbolo}</span>
            </div>
          ))}
        </div>
        <span className={styles.legenda}>CARREGANDO</span>
      </div>
    </div>
  );
}
