"use client";

import { useState } from "react";

const marcas = [
  { nome: "ABB", src: "/assets/img/logo-patrocinadores/abb.png", href: "https://www.abb.com/global/en" },
  { nome: "FANUC", src: "/assets/img/logo-patrocinadores/fanuc.webp", href: "https://www.fanuc.com/?lang=en" },
  { nome: "KUKA", src: "/assets/img/logo-patrocinadores/kuka.png", href: "https://www.kuka.com/" },
  { nome: "Mitsubishi Electric", src: "/assets/img/logo-patrocinadores/mitsubishi.webp", href: "https://www.mitsubishielectric.com/en/" },
  { nome: "OMRON", src: "/assets/img/logo-patrocinadores/omron.webp", href: "https://www.ia.omron.com/" },
  { nome: "SENAI", src: "/assets/img/logo-patrocinadores/senai.png", href: "https://www.sp.senai.br/" },
  { nome: "SESI", src: "/assets/img/logo-patrocinadores/sesi.jpg", href: "https://www.sesisp.org.br/" },
  { nome: "Schneider Electric", src: "/assets/img/logo-patrocinadores/schneider_eletric.webp", href: "https://www.se.com/ww/en/" },
  { nome: "Siemens", src: "/assets/img/logo-patrocinadores/siemens.webp", href: "https://www.siemens.com/" },
  { nome: "Universal Robots", src: "/assets/img/logo-patrocinadores/universal_robots.svg", href: "https://www.universal-robots.com/" },
  { nome: "WEG", src: "/assets/img/logo-patrocinadores/weg.svg", href: "https://www.weg.net/" },
  { nome: "Yaskawa", src: "/assets/img/logo-patrocinadores/yaskawa.webp", href: "https://www.yaskawa-global.com/" },
];

function GrupoMarcas({ duplicado = false }) {
  return (
    <div className="grupo-marcas" aria-hidden={duplicado ? "true" : undefined}>
      {marcas.map(({ nome, src, href }) => (
        <div className="marca-patrocinadora" key={nome}>
          <a href={href} target="_blank" rel="noreferrer" aria-label={duplicado ? undefined : `Visitar o site de ${nome}`} tabIndex={duplicado ? -1 : undefined}>
            <img src={src} alt={duplicado ? "" : nome} />
          </a>
        </div>
      ))}
    </div>
  );
}

export default function Patrocinadores() {
  const [marcaAtual, setMarcaAtual] = useState(0);
  const navegar = (direcao) => setMarcaAtual((atual) => (atual + direcao + marcas.length) % marcas.length);

  return (
    <section id="parceiros" className="secao-patrocinadores" aria-labelledby="titulo-patrocinadores">
      <div className="container py-5 py-lg-6">
        <div className="mb-3">
          <p className="sobretitulo">Quem caminha com a gente</p>
          <h2 id="titulo-patrocinadores">Instituições e tecnologias que inspiram a Tenken</h2>
        </div>
        <div className="faixa-patrocinadores" aria-label="Instituições e tecnologias que inspiram a Tenken">
          <div className="trilho-patrocinadores trilho-patrocinadores--desktop">
            <GrupoMarcas />
            <GrupoMarcas duplicado />
          </div>
          <div className="carrossel-patrocinadores" aria-roledescription="carrossel">
            <button className="seta-patrocinadores" type="button" onClick={() => navegar(-1)} aria-label="Ver parceiro anterior"><span aria-hidden="true">←</span></button>
            <div className="janela-patrocinadores" aria-live="polite">
              <div className="trilho-patrocinadores-mobile" style={{ transform: `translateX(-${marcaAtual * 100}%)` }}>
                {marcas.map(({ nome, src, href }, indice) => (
                  <div className="marca-patrocinadora" key={nome} aria-hidden={indice !== marcaAtual}>
                    <a href={href} target="_blank" rel="noreferrer" aria-label={`Visitar o site de ${nome}`} tabIndex={indice === marcaAtual ? 0 : -1}>
                      <img src={src} alt={nome} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
            <button className="seta-patrocinadores" type="button" onClick={() => navegar(1)} aria-label="Ver próximo parceiro"><span aria-hidden="true">→</span></button>
          </div>
        </div>
      </div>
    </section>
  );
}

