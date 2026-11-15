"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import { clearSession, getUsuario } from "@/lib/session";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    setUsuario(getUsuario());
    setCarregado(true);
  }, []);

  function sair() {
    clearSession();
    router.replace("/login");
  }

  return (
    <AuthGuard>
      <main className={styles.page}>
        {carregado && usuario && (
          <section className={styles.card}>
            <h1>Bem-vindo, {usuario.nome}</h1>
            <p>Matrícula: {usuario.matricula}</p>
            <p>Perfil: {usuario.perfil}</p>
            <button
              className={styles.logoutButton}
              type="button"
              onClick={sair}
            >
              Sair
            </button>
          </section>
        )}
      </main>
    </AuthGuard>
  );
}
