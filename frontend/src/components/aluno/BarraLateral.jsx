"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  IconeCasa,
  IconeDiagnostico,
  IconeEquipamento,
} from "./IconesNavegacao";
import styles from "./BarraLateral.module.css";

const itens = [
  { href: "/aluno/bem-vindo", label: "Bem-vindo", Icone: IconeCasa },
  {
    href: "/aluno/diagnostico",
    label: "Diagnóstico",
    Icone: IconeDiagnostico,
  },
  {
    href: "/aluno/equipamentos",
    label: "Equipamentos",
    Icone: IconeEquipamento,
  },
];

export default function BarraLateral({ aberta = false, onNavegar, onFechar }) {
  const pathname = usePathname();

  return (
    <aside
      className={`${styles.barra} ${aberta ? styles.barraAberta : ""}`}
      aria-label="Navegação do aluno"
      aria-hidden={!aberta && undefined}
    >
      <div className={styles.topSection}>
        <div className={styles.brandHeader}>
          <Link
            href="/aluno/bem-vindo"
            className={styles.brandLink}
            aria-label="TENKEN início"
          >
            <Image
              src="/assets/img/logo-site/logo_horizontal.svg"
              alt="TENKEN"
              width={190}
              height={42}
              priority
              className={styles.brandLogo}
            />
          </Link>
          <button
            type="button"
            className={styles.mobileCloseBtn}
            onClick={onFechar}
            aria-label="Fechar menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className={styles.sectionHeading}>
          <span>Área do aluno</span>
        </div>
        <nav className={styles.navMenu} aria-label="Navegação do aluno">
          {itens.map(({ href, label, Icone }) => {
            const ativo = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.navItem} ${ativo ? styles.navItemActive : ""}`}
                aria-current={ativo ? "page" : undefined}
                onClick={onNavegar}
              >
                <Icone className={styles.navIcon} />
                <span className={styles.navLabel}>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

    </aside>
  );
}
