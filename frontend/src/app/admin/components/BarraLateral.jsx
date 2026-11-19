"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./BarraLateral.module.css";

const itens = [
  { href: "/admin", label: "Resumo", icon: "dashboard" },
  {
    href: "/admin/equipamentos",
    label: "Equipamentos",
    icon: "settings_input_component",
  },
  { href: "/admin/turmas", label: "Turmas", icon: "groups" },
  { href: "/admin/usuarios", label: "Usuários", icon: "manage_accounts" },
  { href: "/admin/relatorios", label: "Relatórios", icon: "analytics" },
];

export default function BarraLateral({
  statusApi,
  aberta = false,
  onNavegar,
  onFechar,
}) {
  const pathname = usePathname();
  const online = statusApi === "online";
  const textoStatus = online
    ? "Sistema conectado"
    : statusApi === "offline"
      ? "Sistema indisponível"
      : "Verificando conexão";

  return (
    <aside
      className={`${styles.sidebar} ${aberta ? styles.sidebarAberta : ""}`}
    >
      <div className={styles.topSection}>
        {/* Header / Brand */}
        <div className={styles.brandHeader}>
          <Link
            href="/"
            className={styles.brandLink}
            aria-label="Tenken Início"
          >
            <Image
              src="/assets/img/logo-site/logo_horizontal.svg"
              alt="Tenken"
              width={380}
              height={84}
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

        {/* Section Label */}
        <div className={styles.sectionHeading}>
          <span>Administração</span>
        </div>

        {/* Navigation */}
        <nav className={styles.navMenu} aria-label="Navegação administrativa">
          {itens.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                aria-current={isActive ? "page" : undefined}
                onClick={onNavegar}
              >
                <span className={`material-symbols-outlined ${styles.navIcon}`}>
                  {item.icon}
                </span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Telemetry */}
      <div className={styles.footer}>
        <div className={styles.telemetryCard}>
          <span
            className={`${styles.pulseDot} ${online ? styles.pulseDotOnline : styles.pulseDotOffline}`}
          />
          <span className={styles.telemetryText}>{textoStatus}</span>
        </div>
      </div>
    </aside>
  );
}
