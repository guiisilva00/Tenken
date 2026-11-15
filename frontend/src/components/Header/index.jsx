"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.css";

const DISTANCIA_PARA_MOSTRAR = 140;

export default function Header() {
  const [visivel, setVisivel] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function verificarScroll() {
      setVisivel(window.scrollY > DISTANCIA_PARA_MOSTRAR);
    }

    verificarScroll();
    window.addEventListener("scroll", verificarScroll, { passive: true });
    return () => window.removeEventListener("scroll", verificarScroll);
  }, []);

  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/tecnico" ||
    pathname.startsWith("/tecnico/")
  )
    return null;

  return (
    <header
      className={`${styles.header} ${visivel ? styles.visivel : ""}`}
      aria-hidden={!visivel}
      inert={!visivel}
    >
      <div className={styles.conteudo}>
        <a className={styles.logo} href="#inicio" aria-label="Tenken - início">
          <Image
            src="/assets/img/logo-site/logo_horizontal.svg"
            alt="Tenken"
            width={360}
            height={82}
          />
        </a>

        <nav className={styles.menu} aria-label="Navegação principal">
          <a className={styles.link} href="#parceiros">
            Parceiros
          </a>
          <a className={styles.link} href="#sobre">
            Sobre
          </a>
          <a className={styles.link} href="#fluxo">
            Fluxo
          </a>
          <Link className={styles.link} href="/login/">
            Acessar
          </Link>
        </nav>
      </div>
    </header>
  );
}
