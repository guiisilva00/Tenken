"use client";

import { useEffect, useState } from "react";
import "./loading.css";

const PRELOADER_DURATION = 2200;

// alternando 点 e 検 (ten ken)
const KANJI_ITEMS = ["点", "検", "点", "検", "点", "検", "点", "検"];

export default function InitialLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), PRELOADER_DURATION);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="overlay" role="status" aria-label="Carregando o sistema Tenken">
      <div className="content">
        <div className="kanji-spinner" aria-hidden="true">
          {KANJI_ITEMS.map((kanji, index) => (
            <div key={index} className="kanji-spinner__item">
              <span>{kanji}</span>
            </div>
          ))}
        </div>
        <span className="loader-subtitle">CARREGANDO</span>
      </div>
    </div>
  );
}