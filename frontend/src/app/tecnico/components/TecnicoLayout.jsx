"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getToken, getUsuario } from "@/lib/session";
import styles from "./TecnicoLayout.module.css";

export default function TecnicoLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const tituloPagina = pathname.startsWith("/tecnico/chamados")
    ? "Ordens de serviço"
    : "Visão geral";
  const [usuario, setUsuario] = useState(null);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    const usuarioAtual = getUsuario();
    if (usuarioAtual?.perfil !== "TECNICO") {
      router.replace("/dashboard");
      return;
    }

    setUsuario(usuarioAtual);
  }, [router]);

  function sair() {
    clearSession();
    router.replace("/login");
  }

  if (!usuario) return null;

  return (
    <div className={styles.shell}>
      <aside
        className={`${styles.sidebar} ${menuAberto ? styles.sidebarAberta : ""}`}
      >
        <div className={styles.brand}>
          <Link href="/tecnico" aria-label="Tenken — painel técnico">
            <Image
              src="/assets/img/logo-site/logo_horizontal.svg"
              alt="Tenken"
              width={160}
              height={38}
              priority
            />
          </Link>
          <button
            type="button"
            className={styles.closeMenu}
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className={styles.sectionLabel}>Operação técnica</p>
        <nav className={styles.navigation} aria-label="Navegação técnica">
          <Link
            href="/tecnico"
            className={`${styles.navLink} ${pathname === "/tecnico" ? styles.navLinkAtivo : ""}`}
            aria-current={pathname === "/tecnico" ? "page" : undefined}
            onClick={() => setMenuAberto(false)}
          >
            <span className="material-symbols-outlined">monitoring</span>
            <span>Visão geral</span>
          </Link>
          <Link
            href="/tecnico/chamados"
            className={`${styles.navLink} ${pathname.startsWith("/tecnico/chamados") ? styles.navLinkAtivo : ""}`}
            aria-current={
              pathname.startsWith("/tecnico/chamados") ? "page" : undefined
            }
            onClick={() => setMenuAberto(false)}
          >
            <span className="material-symbols-outlined">
              confirmation_number
            </span>
            <span>Ordens de serviço</span>
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.statusDot} />
          <span>Painel do técnico</span>
        </div>
      </aside>

      {menuAberto && (
        <button
          type="button"
          className={styles.backdrop}
          onClick={() => setMenuAberto(false)}
          aria-label="Fechar menu"
        />
      )}

      <div className={styles.content}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <nav className={styles.trilha} aria-label="Localização atual">
            <span>TENKEN</span>
            <span className="material-symbols-outlined" aria-hidden="true">
              chevron_right
            </span>
            <span>Operação Técnica</span>
            <span className="material-symbols-outlined" aria-hidden="true">
              chevron_right
            </span>
            <strong>{tituloPagina}</strong>
          </nav>
          <div className={styles.account}>
            <div className={styles.accountBadge}>
            <span className={styles.avatar}>
              <span className="material-symbols-outlined">engineering</span>
            </span>
            <span className={styles.accountInfo}>
              <strong>{usuario.nome || usuario.matricula || "Técnico"}</strong>
              <small>TÉCNICO</small>
            </span>
            </div>
            <button
              type="button"
              className={styles.logoutButton}
              onClick={sair}
              aria-label="Sair da sessão"
            >
              <span className="material-symbols-outlined">
                power_settings_new
              </span>
              <span>Sair</span>
            </button>
          </div>
        </header>

        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
