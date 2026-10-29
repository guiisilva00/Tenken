"use client";

import { useEffect, useRef } from "react";
import "./Header.css";

const REVEAL_DISTANCE = 140;

export default function Header() {
  const headerRef = useRef(null);

  useEffect(() => {
    let animationFrame = null;

    const updateReveal = () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }

      animationFrame = window.requestAnimationFrame(() => {
        const header = headerRef.current;
        if (!header) return;

        const progress = Math.min(Math.max(window.scrollY / REVEAL_DISTANCE, 0), 1);
        header.style.opacity = String(progress);
        header.style.transform = `translateY(${(progress - 1) * 100}%)`;
        header.style.pointerEvents = progress >= 0.98 ? "auto" : "none";
        header.setAttribute("aria-hidden", progress >= 0.98 ? "false" : "true");
        header.inert = progress < 0.98;
      });
    };

    window.addEventListener("scroll", updateReveal, { passive: true });
    updateReveal();

    return () => {
      window.removeEventListener("scroll", updateReveal);
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="cabecalho cabecalho--oculto"
      aria-hidden="true"
      inert={true}
    >
      <div className="cabecalho__conteudo">
        <a className="cabecalho__logo" href="#inicio" aria-label="Tenken - inicio">
          <img src="/assets/img/logo-site/logo_horizontal.svg" alt="Tenken" />
        </a>

        <nav className="cabecalho__navegacao" aria-label="Navegacao principal">
          <a className="cabecalho__link" href="#parceiros">Parceiros</a>
          <a className="cabecalho__link" href="#sobre">Sobre</a>
          <a className="cabecalho__link" href="#fluxo">Fluxo</a>
          <a className="cabecalho__link" href="/login/">Acessar</a>
        </nav>
      </div>
    </header>
  );
}
