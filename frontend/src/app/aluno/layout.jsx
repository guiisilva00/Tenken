"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import BarraLateral from "@/components/aluno/BarraLateral";
import { clearSession, getUsuario } from "@/lib/session";
import styles from "./AlunoLayout.module.css";

const titulosPagina = {
  "/aluno/bem-vindo": "Bem-vindo",
  "/aluno/diagnostico": "Diagnóstico",
  "/aluno/equipamentos": "Equipamentos",
  "/aluno/acesso": "Acesso à bancada",
};

export default function LayoutAluno({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    setUsuario(getUsuario());
  }, []);

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  function sair() {
    clearSession();
    router.replace("/login");
  }

  return (
    <AuthGuard>
      {pathname === "/aluno" ? (
        children
      ) : (
        <div className={styles.wrapper}>
          <BarraLateral
            aberta={menuAberto}
            onNavegar={() => setMenuAberto(false)}
            onFechar={() => setMenuAberto(false)}
          />

          {menuAberto && (
            <button
              type="button"
              className={styles.backdrop}
              aria-label="Fechar menu"
              onClick={() => setMenuAberto(false)}
            />
          )}

          <div className={styles.contentSpine}>
            <header className={styles.topbar}>
              <button
                type="button"
                className={styles.menuBtn}
                onClick={() => setMenuAberto(true)}
                aria-label="Abrir menu"
                aria-expanded={menuAberto}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  menu
                </span>
              </button>

              <nav className={styles.breadcrumb} aria-label="Localização atual">
                <span>TENKEN</span>
                <span
                  className={`material-symbols-outlined ${styles.breadcrumbSeparator}`}
                  aria-hidden="true"
                >
                  chevron_right
                </span>
                <span>Área do Aluno</span>
                <span
                  className={`material-symbols-outlined ${styles.breadcrumbSeparator}`}
                  aria-hidden="true"
                >
                  chevron_right
                </span>
                <strong className={styles.breadcrumbCurrent}>
                  {titulosPagina[pathname] || "Área do Aluno"}
                </strong>
              </nav>

              <div className={styles.topbarRight}>
                <div className={styles.userBadge}>
                  <div className={styles.userAvatar}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 18 }}
                      aria-hidden="true"
                    >
                      person
                    </span>
                  </div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>
                      {usuario?.nome || usuario?.matricula || "Aluno"}
                    </span>
                    <span className={styles.userRole}>ALUNO</span>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.logoutBtn}
                  onClick={sair}
                  aria-label="Sair da sessão"
                >
                  <span
                    className={`material-symbols-outlined ${styles.logoutIcon}`}
                    aria-hidden="true"
                  >
                    power_settings_new
                  </span>
                  <span>Sair</span>
                </button>
              </div>
            </header>

            <main className={styles.mainView}>{children}</main>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
