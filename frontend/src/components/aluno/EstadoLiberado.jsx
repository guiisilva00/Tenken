"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./EstadoLiberado.module.css";

export default function EstadoLiberado({ sessao, equipamentos, onVoltar }) {
  const [saudacao, setSaudacao] = useState(`Olá, ${sessao.nome}`);

  useEffect(() => {
    const hora = new Date().getHours();
    const cumprimento =
      hora < 12 ? "Bom dia" : hora <= 18 ? "Boa tarde" : "Boa noite";
    setSaudacao(`${cumprimento}, ${sessao.nome}`);
  }, [sessao.nome]);

  return (
    <section className={styles.conteudo} aria-labelledby="titulo-aluno">
      <header className={styles.linhaSuperior}>
        <Link className={styles.voltar} href="/login" aria-label="Voltar">
          <span className="ti ti-arrow-left" aria-hidden="true" />
          Voltar
        </Link>
        <span className={styles.status}>
          <span className={styles.pontoStatus} aria-hidden="true" />
          Bancada liberada
        </span>
      </header>
      <h1 className={styles.titulo} id="titulo-aluno">
        {saudacao}
      </h1>
      <p className={styles.turma}>{sessao.turma}</p>
      <p className={styles.contexto}>
        Laboratório LAB-AUT-01, professor Carlos Mendes. A aula termina em 1h12.
      </p>
      <section
        className={styles.secaoEquipamentos}
        aria-labelledby="titulo-equipamentos"
      >
        <header className={styles.cabecalhoLista}>
          <h2 className={styles.tituloLista} id="titulo-equipamentos">
            Equipamentos desta aula
          </h2>
          <p className={styles.instrucaoLista}>Toque para ver detalhes</p>
        </header>
        <ul className={styles.listaEquipamentos}>
          {equipamentos.map((equipamento) => (
            <li className={styles.itemEquipamento} key={equipamento.id}>
              <span className={styles.idEquipamento}>{equipamento.id}</span>
              <span className={styles.dadosEquipamento}>
                <span className={styles.nomeEquipamento}>
                  {equipamento.nome}
                </span>
                <span className={styles.detalhesEquipamento}>
                  {equipamento.tipo} · {equipamento.detalhe}
                </span>
              </span>
              <span
                className={styles.estadoEquipamento}
                aria-label="Atribuído"
              />
            </li>
          ))}
        </ul>
      </section>
      <footer className={styles.rodape}>
        Antes de usar: inspecione, use, devolva e faça o pós-uso. Você responde
        por danos ou perdas nos equipamentos desta sessão.
      </footer>
    </section>
  );
}
