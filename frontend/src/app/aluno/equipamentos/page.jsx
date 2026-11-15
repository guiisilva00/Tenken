"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconeSeta } from "@/components/aluno/IconesNavegacao";
import styles from "./page.module.css";

export default function EquipamentosAluno() {
  const [itemAberto, setItemAberto] = useState(null);
  const [equipamentos, setEquipamentos] = useState([]);

  useEffect(() => {
    try {
      const dados = JSON.parse(window.sessionStorage.getItem("tenken-aluno-equipamentos") || "[]");
      setEquipamentos(dados.map((item) => ({ ...item, id: item.codigo_patrimonio || String(item.id) })));
    } catch {
      setEquipamentos([]);
    }
  }, []);

  function alternarItem(id) {
    setItemAberto((atual) => (atual === id ? null : id));
  }

  return (
    <section className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <p className={styles.eyebrow}>ÁREA DO ALUNO / AULA DE HOJE</p>
          <h1 className={styles.titulo}>Equipamentos</h1>
          <p className={styles.subtitulo}>
            Confira os equipamentos previstos para a atividade e consulte suas
            informações técnicas.
          </p>
        </div>
        <Link className={styles.voltar} href="/aluno/diagnostico">
          Ver diagnóstico da aula <span aria-hidden="true">↗</span>
        </Link>
      </header>

      <ul className={styles.lista}>
        {equipamentos.map((equipamento) => {
          const aberto = itemAberto === equipamento.id;
          const idPainel = `detalhes-${equipamento.id}`;
          const idLinha = `linha-${equipamento.id}`;
          return (
            <li className={styles.item} key={equipamento.id}>
              <button
                id={idLinha}
                className={styles.linha}
                type="button"
                onClick={() => alternarItem(equipamento.id)}
                aria-expanded={aberto}
                aria-controls={idPainel}
              >
                <span className={styles.idEquipamento}>{equipamento.id}</span>
                <span className={styles.dadosEquipamento}>
                  <strong className={styles.nomeEquipamento}>
                    {equipamento.nome}
                  </strong>
                  <small className={styles.descricaoEquipamento}>
                    {equipamento.tipo} · {equipamento.detalhe}
                  </small>
                </span>
                <span className={styles.acoesLinha}>
                  <span className={styles.badge}>OPERACIONAL</span>
                  <IconeSeta
                    className={`${styles.seta} ${aberto ? styles.setaAberta : ""}`}
                    direcao="baixo"
                  />
                </span>
              </button>
              <div
                className={`${styles.painel} ${aberto ? styles.painelAberto : ""}`}
                id={idPainel}
                role="region"
                aria-labelledby={idLinha}
                aria-hidden={!aberto}
              >
                <div className={styles.detalhes}>
                  <p>
                    <span>Patrimônio</span>
                    <strong>{equipamento.codigo_patrimonio || equipamento.id}</strong>
                  </p>
                  <p>
                    <span>Localização</span>
                    <strong>{equipamento.localizacao || "Localização não informada"}</strong>
                  </p>
                  <p>
                    <span>Equipamento</span>
                    <strong>{equipamento.nome}</strong>
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {!equipamentos.length && <p>Nenhum equipamento foi liberado para esta aula.</p>}
    </section>
  );
}
