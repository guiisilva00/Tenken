"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "./loading.css";

const TEMPO_CARREGAMENTO = 1000;

// alternando 点 e 検 (ten ken)
const SIMBOLOS = ["点", "検", "点", "検", "点", "検", "点", "検"];

export default function InitialLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const temporizador = window.setTimeout(() => {
      setVisible(false);
    }, TEMPO_CARREGAMENTO);

    return () => {
      window.clearTimeout(temporizador);
    };
  }, []);

  if (pathname !== "/" || !visible) return null;

  return (
    <div className="overlay" role="status" aria-label="Carregando o sistema Tenken">
      <div className="content">
        <div className="kanji-spinner" aria-hidden="true">
          {SIMBOLOS.map((simbolo, indice) => (
            <div key={indice} className="kanji-spinner__item">
              <span>{simbolo}</span>
            </div>
          ))}
        </div>
        <span className="loader-subtitle">CARREGANDO</span>
      </div>
    </div>
  );
}
