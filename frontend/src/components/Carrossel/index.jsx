"use client";

import { useState } from "react";
import "./Carrossel.css";

const slides = [
    {
        title: <>A prática que <span className="destaque-vermelho">inspira</span> o próximo passo.</>,
        text: <>O <span className="destaque-vermelho" style={{ fontWeight: 700 }}>SENAI</span> é uma das raízes da Tenken. É no encontro entre educação técnica, tecnologia e prática que nasce o cuidado com os equipamentos e com quem aprende com eles.</>,
        image: "/assets/img/home-img/senai_frente.jpg",
        alt: "Fachada de uma unidade do SENAI sob o céu azul",
    },
    {
        title: <>Conhecimento que ganha forma no <span className="destaque-vermelho">laboratório</span>.</>,
        text: <>Bancadas, ferramentas e equipamentos aproximam a teoria dos desafios reais. A <span className="destaque-vermelho" style={{ fontWeight: 700 }}>Tenken</span> ajuda a manter esse ambiente organizado e pronto para a próxima descoberta.</>,
        image: "/assets/img/home-img/abb_oficina.jpg",
        alt: "Oficina com equipamentos",
    },
    {
        title: <>Cada uso <span className="destaque-vermelho">prepara</span> o caminho para o próximo.</>,
        text: "Inspecionar, registrar e cuidar dos equipamentos cria uma rotina mais segura para explorar novas ideias e construir o futuro da automação.",
        image: "/assets/img/home-img/mulher_tablet_mecatronica.webp",
        alt: "Pessoa usando tablet em um laboratório",
    },
];

export default function Carrossel() {
    const [contador, setContador] = useState(0);
    const slide = slides[contador];

    return (
        <section className="carrossel" aria-label="História e propósito da Tenken">
            <div className="carrossel__visual carrossel__visual--foto">
                <img
                    className="carrossel__imagem"
                    src={slide.image}
                    alt={slide.alt}
                    onError={(event) => {
                        event.currentTarget.style.display = "none";
                        event.currentTarget.nextElementSibling.style.display = "flex";
                    }}
                />
                <div className="carrossel__placeholder" style={{ display: "none" }}>
                    <span className="placeholder__marca" aria-hidden="true">T</span>
                    <span className="placeholder__aviso">Imagem indisponível</span>
                </div>
                <div className="carrossel__conteudo" key={contador}>
                    <h2>{slide.title}</h2>
                    <p className="carrossel__texto">{slide.text}</p>
                </div>
                <span className="carrossel__contador" aria-live="polite">
                    {String(contador + 1).padStart(2, "0")} <span>/</span> {String(slides.length).padStart(2, "0")}
                </span>
                <div className="carrossel__controles" aria-label="Controles do carrossel">
                    <button type="button" onClick={() => setContador((contador - 1 + slides.length) % slides.length)} aria-label="Slide anterior">‹</button>
                    <div className="carrossel__indicadores" aria-label="Selecionar slide">
                        {slides.map((item, index) => (
                            <button key={index} type="button" aria-label={`Ir para slide ${index + 1}`} aria-current={index === contador ? "true" : undefined} onClick={() => setContador(index)} />
                        ))}
                    </div>
                    <button type="button" onClick={() => setContador((contador + 1) % slides.length)} aria-label="Próximo slide">›</button>
                </div>
            </div>
        </section>
    );
}
