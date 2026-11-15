"use client";

import { useState } from "react";
import styles from "./Patrocinadores.module.css";

const marcas = [
  {
    nome: "ABB",
    src: "/assets/img/logo-patrocinadores/abb.png",
    href: "https://www.abb.com/global/en",
  },
  {
    nome: "FANUC",
    src: "/assets/img/logo-patrocinadores/fanuc.webp",
    href: "https://www.fanuc.com/?lang=en",
  },
  {
    nome: "KUKA",
    src: "/assets/img/logo-patrocinadores/kuka.png",
    href: "https://www.kuka.com/",
  },
  {
    nome: "Mitsubishi Electric",
    src: "/assets/img/logo-patrocinadores/mitsubishi.webp",
    href: "https://www.mitsubishielectric.com/en/",
  },
  {
    nome: "OMRON",
    src: "/assets/img/logo-patrocinadores/omron.webp",
    href: "https://www.ia.omron.com/",
  },
  {
    nome: "SENAI",
    src: "/assets/img/logo-patrocinadores/senai.png",
    href: "https://www.sp.senai.br/",
  },
  {
    nome: "SESI",
    src: "/assets/img/logo-patrocinadores/sesi.jpg",
    href: "https://www.sesisp.org.br/",
  },
  {
    nome: "Schneider Electric",
    src: "/assets/img/logo-patrocinadores/schneider_eletric.webp",
    href: "https://www.se.com/ww/en/",
  },
  {
    nome: "Siemens",
    src: "/assets/img/logo-patrocinadores/siemens.webp",
    href: "https://www.siemens.com/",
  },
  {
    nome: "Universal Robots",
    src: "/assets/img/logo-patrocinadores/universal_robots.svg",
    href: "https://www.universal-robots.com/",
  },
  {
    nome: "WEG",
    src: "/assets/img/logo-patrocinadores/weg.svg",
    href: "https://www.weg.net/",
  },
  {
    nome: "Yaskawa",
    src: "/assets/img/logo-patrocinadores/yaskawa.webp",
    href: "https://www.yaskawa-global.com/",
  },
];

function Marcas({ repetida = false }) {
  return (
    <div className={styles.grupo} aria-hidden={repetida ? "true" : undefined}>
      {marcas.map(({ nome, src, href }) => (
        <div className={styles.marca} key={nome}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={repetida ? undefined : `Visitar o site de ${nome}`}
            tabIndex={repetida ? -1 : undefined}
          >
            <img src={src} alt={repetida ? "" : nome} />
          </a>
        </div>
      ))}
    </div>
  );
}

export default function Patrocinadores() {
  const [indice, setIndice] = useState(0);
  const ir = (direcao) =>
    setIndice((atual) => (atual + direcao + marcas.length) % marcas.length);

  return (
    <section
      id="parceiros"
      className={styles.secao}
      aria-labelledby="titulo-patrocinadores"
    >
      <div className="container py-5 py-lg-6">
        <div className="mb-3">
          <p className="sobretitulo">Quem caminha com a gente</p>
          <h2 id="titulo-patrocinadores">
            Instituições e tecnologias que inspiram a Tenken
          </h2>
        </div>
        <div
          className={styles.faixa}
          aria-label="Instituições e tecnologias que inspiram a Tenken"
        >
          <div className={`${styles.trilho} ${styles.trilhoDesktop}`}>
            <Marcas />
            <Marcas repetida />
          </div>
          <div className={styles.carrossel} aria-roledescription="carrossel">
            <button
              className={styles.seta}
              type="button"
              onClick={() => ir(-1)}
              aria-label="Ver parceiro anterior"
            >
              <span aria-hidden="true">←</span>
            </button>
            <div className={styles.janela} aria-live="polite">
              <div
                className={styles.trilhoMobile}
                style={{ transform: `translateX(-${indice * 100}%)` }}
              >
                {marcas.map(({ nome, src, href }, i) => (
                  <div
                    className={styles.marca}
                    key={nome}
                    aria-hidden={i !== indice}
                  >
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Visitar o site de ${nome}`}
                      tabIndex={i === indice ? 0 : -1}
                    >
                      <img src={src} alt={nome} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
            <button
              className={styles.seta}
              type="button"
              onClick={() => ir(1)}
              aria-label="Ver próximo parceiro"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
