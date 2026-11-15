"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BarraLateralProfessor from "./BarraLateralProfessor";
import BarraSuperiorProfessor from "./BarraSuperiorProfessor";
import { apiFetch } from "@/lib/api";
import { clearSession, getToken, getUsuario } from "@/lib/session";
import styles from "./ProfessorLayout.module.css";

export default function ProfessorLayout({ children, titulo }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    let montado = true;

    async function validarSessao() {
      const token = getToken();
      const usuarioSalvo = getUsuario();

      if (!token) {
        router.replace("/login");
        return;
      }

      if (usuarioSalvo?.perfil !== "PROFESSOR") {
        router.replace(usuarioSalvo?.perfil === "ADMIN" ? "/admin" : "/login");
        return;
      }

      try {
        const resposta = await apiFetch("/api/usuarios/me");
        const usuarioApi = resposta?.dados?.usuario;

        if (!montado) return;
        if (usuarioApi?.perfil !== "PROFESSOR") {
          clearSession();
          router.replace("/login");
          return;
        }

        setUsuario({ ...usuarioSalvo, ...usuarioApi });
        setVerificando(false);
      } catch {
        if (!montado) return;
        clearSession();
        router.replace("/login");
      }
    }

    validarSessao();
    return () => {
      montado = false;
    };
  }, [router]);

  function sair() {
    clearSession();
    router.replace("/login");
  }

  if (verificando || !usuario)
    return <main className={styles.loading}>Verificando acesso...</main>;

  return (
    <div className={styles.wrapper}>
      <BarraLateralProfessor
        usuario={usuario}
        aberta={menuAberto}
        onFechar={() => setMenuAberto(false)}
      />
      {menuAberto && (
        <button
          type="button"
          className={styles.backdrop}
          onClick={() => setMenuAberto(false)}
          aria-label="Fechar menu"
        />
      )}
      <div className={styles.contentSpine}>
        <BarraSuperiorProfessor
          titulo={titulo}
          usuario={usuario}
          onSair={sair}
          onAbrirMenu={() => setMenuAberto(true)}
        />
        <main className={styles.mainView}>{children}</main>
      </div>
    </div>
  );
}
