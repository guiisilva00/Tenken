"use client";

import Link from "next/link";
import { saudacaoPorHorario } from "@/lib/saudacao";
import styles from "./EstadoLiberado.module.css";

export default function EstadoLiberado({ sessao, equipamentos = [] }) {
  const primeiroNome = sessao.nome.trim().split(/\s+/)[0];

  return (
    <section className={styles.conteudo} aria-labelledby="titulo-aluno">
      <header className={styles.linhaSuperior}>
        <Link className={styles.voltar} href="/aluno/bem-vindo">Continuar para a área do aluno</Link>
        <span className={styles.status} role="status"><span className={styles.pontoStatus} aria-hidden="true" />Bancada liberada</span>
      </header>
      <h1 className={styles.titulo} id="titulo-aluno">{saudacaoPorHorario()}, {primeiroNome}!</h1>
      <p className={styles.turma}>{sessao.turma}</p>
      <section className={styles.secaoEquipamentos} aria-labelledby="titulo-equipamentos">
        <header className={styles.cabecalhoLista}>
          <h2 className={styles.tituloLista} id="titulo-equipamentos">Ativos atribuídos para esta aula</h2>
        </header>
        {equipamentos.length ? (
          <ul className={styles.listaEquipamentos}>
            {equipamentos.map((equipamento) => (
              <li className={styles.itemEquipamento} key={equipamento.id}>
                <span className={styles.idEquipamento}>{equipamento.id}</span>
                <span className={styles.dadosEquipamento}>
                  <span className={styles.nomeEquipamento}>{equipamento.nome}</span>
                  <span className={styles.detalhesEquipamento}>{equipamento.detalhe}</span>
                </span>
                <span className={styles.estadoEquipamento} aria-label="Atribuído" />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.rodape}>Nenhum equipamento foi associado a esta aula.</p>
        )}
      </section>
    </section>
  );
}
