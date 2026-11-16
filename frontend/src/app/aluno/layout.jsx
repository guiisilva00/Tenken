"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import BarraLateral from "@/components/aluno/BarraLateral";
import { clearSession, getUsuario } from "@/lib/session";
import { apiFetch } from "@/lib/api";
import { AulaContexto } from "@/components/aluno/AulaContexto";
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
  const [rotaLiberada, setRotaLiberada] = useState(false);
  const [aula, setAula] = useState(null);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    setUsuario(getUsuario());
  }, []);

  useEffect(() => {
    setMenuAberto(false);
    if (pathname === "/aluno") {
      setRotaLiberada(true);
      return;
    }

    setRotaLiberada(false);
    setErro("");
    let ativo = true;
    const controle = new AbortController();
    apiFetch("/api/checkins/atual", { signal: controle.signal, cache: "no-store" })
      .then(({ dados }) => {
        if (!ativo) return;
        if (!dados?.aprovado) {
          router.replace("/aluno?motivo=pendente");
          return;
        }
        setAula(dados);
        setRotaLiberada(pathname);
      })
      .catch((falha) => {
        if (!ativo) return;
        if (falha.status === 404 || falha.status === 403) {
          router.replace("/aluno?motivo=sem-acesso");
        } else {
          setErro("Não foi possível confirmar seu acesso agora. Tente novamente.");
        }
      });
    return () => { ativo = false; controle.abort(); };
  }, [pathname, router, tentativa]);

  useEffect(() => {
    if (!aula || rotaLiberada !== pathname) return;
    const timer = window.setTimeout(() => {
      setRotaLiberada(false);
      router.replace("/aluno?motivo=sem-acesso");
    }, Math.max(0, aula.segundos_restantes * 1000));
    return () => window.clearTimeout(timer);
  }, [aula, pathname, rotaLiberada, router]);

  function sair() {
    window.sessionStorage.removeItem("tenken-aluno-bancada-liberada");
    clearSession();
    router.replace("/login");
  }

  return (
    <AuthGuard>
      {pathname === "/aluno" ? (
        children
      ) : rotaLiberada === pathname ? (
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

            <main className={styles.mainView}><AulaContexto.Provider value={aula}>{children}</AulaContexto.Provider></main>
          </div>
        </div>
      ) : <div role="status">{erro || "Confirmando autorização de acesso…"}{erro && <button type="button" onClick={() => setTentativa((n) => n + 1)}>Tentar novamente</button>}</div>}
    </AuthGuard>
  );
}
