"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BarraLateral from "./BarraLateral";
import { verificarSaude } from "../lib/adminApi";
import { clearSession, getToken, getUsuario } from "@/lib/session";
import styles from "./AdminLayout.module.css";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [statusApi, setStatusApi] = useState("checking");
  const [menuAberto, setMenuAberto] = useState(false);
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    verificarSaude().then(setStatusApi);
    const tokenSalvo = getToken();
    const usuarioSalvo = getUsuario();
    if (tokenSalvo && usuarioSalvo?.perfil === "ADMIN") {
      setToken(tokenSalvo);
      setUsuario(usuarioSalvo);
      setVerificado(true);
      return;
    }
    if (tokenSalvo) clearSession();
    router.replace("/login");
  }, [router]);

  const titulosPagina = {
    "/admin": "Visão geral",
    "/admin/equipamentos": "Equipamentos",
    "/admin/turmas": "Turmas",
    "/admin/relatorios": "Relatórios",
    "/admin/usuarios": "Usuários",
  };
  const tituloPagina = titulosPagina[pathname] || "Administração";

  function sair() {
    clearSession();
    router.replace("/login");
  }

  if (!verificado || !token) return null;

  return (
    <div className={styles.wrapper} data-admin-shell>
      {/* Persistent Technical Sidebar */}
      <BarraLateral
        statusApi={statusApi}
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

      {/* Main Administrative Spine */}
      <div className={styles.contentSpine}>
        {/* Fixed Technical Topbar */}
        <header className={styles.topbar} data-admin-navigation>
          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <nav className={styles.breadcrumb} aria-label="Localização atual">
            <span>TENKEN</span>
            <span className="material-symbols-outlined" aria-hidden="true">
              chevron_right
            </span>
            <span>Administração</span>
            <span className="material-symbols-outlined" aria-hidden="true">
              chevron_right
            </span>
            <strong className={styles.breadcrumbCurrent}>{tituloPagina}</strong>
          </nav>

          <div className={styles.topbarRight}>
            <div className={styles.userBadge}>
              <div className={styles.userAvatar}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  person
                </span>
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>
                  {usuario?.nome || usuario?.matricula || "Operador"}
                </span>
                <span className={styles.userRole}>ADMINISTRADOR</span>
              </div>
            </div>

            <button
              type="button"
              className={styles.logoutBtn}
              onClick={sair}
              aria-label="Sair da sessão"
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "18px",
                  color: "var(--status-critical, #ef4444)",
                }}
              >
                power_settings_new
              </span>
              <span>Sair</span>
            </button>
          </div>
        </header>

        {/* Page Main View */}
        <main className={styles.mainView}>
          {typeof children === "function"
            ? children({ token, usuario })
            : children}
        </main>
      </div>
    </div>
  );
}
