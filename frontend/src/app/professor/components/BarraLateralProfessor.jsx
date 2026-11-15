"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./BarraLateralProfessor.module.css";

const itens = [
  { href: "/professor", label: "Visão geral", icon: "dashboard", pronto: true },
  {
    href: "/professor/agendamentos",
    label: "Agendamentos",
    icon: "calendar_month",
    pronto: true,
  },
  {
    href: "/professor/turmas",
    label: "Minhas turmas",
    icon: "groups",
    pronto: true,
  },
  {
    href: "/professor/aprovacoes",
    label: "Aprovações",
    icon: "how_to_reg",
    pronto: true,
  },
  {
    href: "/professor/inspecoes",
    label: "Inspeções",
    icon: "fact_check",
    pronto: true,
  },
  {
    href: "/professor/chamados",
    label: "Chamados",
    icon: "build",
    pronto: true,
  },
  {
    href: "/professor/equipamentos",
    label: "Equipamentos",
    icon: "precision_manufacturing",
    pronto: true,
  },
];

export default function BarraLateralProfessor({ usuario, aberta, onFechar }) {
  const pathname = usePathname();
  const nome = usuario?.nome || "Professora";

  return (
    <aside
      className={`${styles.sidebar} ${aberta ? styles.sidebarAberta : ""}`}
    >
      <div className={styles.topSection}>
        <div className={styles.brandHeader}>
          <Link
            href="/"
            className={styles.brandLink}
            aria-label="Tenken início"
          >
            <Image
              src="/assets/img/logo-site/logo_horizontal.svg"
              alt="Tenken"
              width={150}
              height={36}
              priority
              className={styles.brandLogo}
            />
          </Link>
        </div>

        <div className={styles.sectionHeading}>Espaço do professor</div>
        <nav className={styles.navMenu} aria-label="Navegação do professor">
          {itens.map((item) => {
            const ativo =
              item.href === "/professor"
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            if (!item.pronto) {
              return (
                <span
                  key={item.href}
                  className={`${styles.navItem} ${styles.navItemPending}`}
                  aria-disabled="true"
                  title="Tela será estruturada na próxima etapa"
                >
                  <span
                    className={`material-symbols-outlined ${styles.navIcon}`}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  <span className={styles.pendingLabel}>EM BREVE</span>
                </span>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${ativo ? styles.navItemActive : ""}`}
                aria-current={ativo ? "page" : undefined}
                onClick={onFechar}
              >
                <span
                  className={`material-symbols-outlined ${styles.navIcon}`}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={styles.sidebarFooter}>
        <div className={styles.profileAvatar} aria-hidden="true">
          {nome
            .split(/\s+/)
            .map((parte) => parte[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className={styles.profileInfo}>
          <strong>{nome}</strong>
          <span>Área do professor</span>
        </div>
      </div>
    </aside>
  );
}
