"use client";

import { useEffect, useState } from "react";
import styles from "./Carrossel.module.css";

const slides = [
  {
    title: (
      <>
        A prática que <span className="destaque-vermelho">inspira</span> o
        próximo passo.
      </>
    ),
    text: (
      <>
        O{" "}
        <span className="destaque-vermelho" style={{ fontWeight: 700 }}>
          SENAI
        </span>{" "}
        é uma das raízes da Tenken. É no encontro entre educação técnica,
        tecnologia e prática que nasce o cuidado com os equipamentos e com quem
        aprende com eles.
      </>
    ),
    image: "/assets/img/home-img/senai_frente.jpg",
    alt: "Fachada de uma unidade do SENAI sob o céu azul",
  },
  {
    title: (
      <>
        Conhecimento que ganha forma no{" "}
        <span className="destaque-vermelho">laboratório</span>.
      </>
    ),
    text: (
      <>
        Bancadas, ferramentas e equipamentos aproximam a teoria dos desafios
        reais. A{" "}
        <span className="destaque-vermelho" style={{ fontWeight: 700 }}>
          Tenken
        </span>{" "}
        ajuda a manter esse ambiente organizado e pronto para a próxima
        descoberta.
      </>
    ),
    image: "/assets/img/home-img/abb_oficina.jpg",
    alt: "Oficina com equipamentos",
  },
  {
    title: (
      <>
        Cada uso <span className="destaque-vermelho">prepara</span> o caminho
        para o próximo.
      </>
    ),
    text: "Inspecionar, registrar e cuidar dos equipamentos cria uma rotina mais segura para explorar novas ideias e construir o futuro da automação.",
    image: "/assets/img/home-img/mulher_tablet_mecatronica.webp",
    alt: "Pessoa usando tablet em um laboratório",
  },
];

export default function Carrossel() {
  const [indice, setIndice] = useState(0);
  const atual = slides[indice];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const temporizador = window.setTimeout(() => {
      setIndice((atual) => (atual + 1) % slides.length);
    }, 3500);

    return () => window.clearTimeout(temporizador);
  }, [indice]);

  return (
    <section
      className={styles.secao}
      aria-label="História e propósito da Tenken"
    >
      <div className={styles.visual}>
        <img
          key={`imagem-${indice}`}
          className={styles.imagem}
          src={atual.image}
          alt={atual.alt}
          onError={(evento) => {
            evento.currentTarget.style.display = "none";
            evento.currentTarget.nextElementSibling.style.display = "flex";
          }}
        />
        <div className={styles.placeholder} style={{ display: "none" }}>
          <span className={styles.marca} aria-hidden="true">
            T
          </span>
          <span className={styles.aviso}>Imagem indisponível</span>
        </div>
        <div className={styles.conteudo} key={indice}>
          <h2>{atual.title}</h2>
          <p className={styles.texto}>{atual.text}</p>
        </div>
        <span className={styles.contador} aria-live="polite">
          {String(indice + 1).padStart(2, "0")} <span>/</span>{" "}
          {String(slides.length).padStart(2, "0")}
        </span>
        <div className={styles.controles} aria-label="Controles do carrossel">
          <button
            type="button"
            onClick={() =>
              setIndice((indice - 1 + slides.length) % slides.length)
            }
            aria-label="Slide anterior"
          >
            ‹
          </button>
          <div className={styles.indicadores} aria-label="Selecionar slide">
            {slides.map((item, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir para slide ${i + 1}`}
                aria-current={i === indice ? "true" : undefined}
                onClick={() => setIndice(i)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIndice((indice + 1) % slides.length)}
            aria-label="Próximo slide"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
