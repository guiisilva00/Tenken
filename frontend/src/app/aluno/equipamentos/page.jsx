"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconeSeta } from "@/components/aluno/IconesNavegacao";
import { apiFetch } from "@/lib/api";
import styles from "./page.module.css";

const statusLabel = { DISPONIVEL: "Disponível", RESERVADO: "Reservado", EM_USO: "Em uso", EM_MANUTENCAO: "Em manutenção", INATIVO: "Inativo" };

export default function EquipamentosAluno() {
  const [itemAberto, setItemAberto] = useState(null);
  const [equipamentos, setEquipamentos] = useState([]);
  const [aprovado, setAprovado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch("/api/alunos/area"),
      apiFetch("/api/checkins/atual").catch((e) => e.status === 404 ? null : Promise.reject(e)),
    ]).then(([area, checkin]) => {
      setEquipamentos(area?.dados?.equipamentos ?? area?.equipamentos ?? []);
      setAprovado(Boolean(checkin?.dados?.aprovado));
    }).catch((e) => setErro(e.message || "Não foi possível carregar os equipamentos."))
      .finally(() => setLoading(false));
  }, []);

  function alternarItem(id) { setItemAberto((atual) => atual === id ? null : id); }

  return (
    <section className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div><h1 className={styles.titulo}>Equipamentos</h1><p className={styles.subtitulo}>Equipamentos associados às suas turmas.</p></div>
        <Link className={styles.voltar} href="/aluno/diagnostico">Ver diagnóstico da aula <span aria-hidden="true">↗</span></Link>
      </header>
      {loading ? <p role="status">Carregando equipamentos…</p> : erro ? <p role="alert">{erro}</p> : !aprovado ? <p role="status">Seu acesso ainda aguarda aprovação do professor.</p> : (
        <ul className={styles.lista}>
          {equipamentos.map((equipamento) => {
            const aberto = itemAberto === equipamento.id;
            const idPainel = `detalhes-${equipamento.id}`;
            const idLinha = `linha-${equipamento.id}`;
            return <li className={styles.item} key={equipamento.id}>
              <button id={idLinha} className={styles.linha} type="button" onClick={() => alternarItem(equipamento.id)} aria-expanded={aberto} aria-controls={idPainel}>
                <span className={styles.idEquipamento}>{equipamento.codigo_patrimonio || equipamento.id}</span>
                <span className={styles.dadosEquipamento}><strong className={styles.nomeEquipamento}>{equipamento.nome}</strong><small className={styles.descricaoEquipamento}>{equipamento.tipo} · {equipamento.localizacao || "Localização não informada"}</small></span>
                <span className={styles.acoesLinha}><span className={styles.badge}>{statusLabel[equipamento.status] || equipamento.status}</span><IconeSeta className={`${styles.seta} ${aberto ? styles.setaAberta : ""}`} direcao="baixo" /></span>
              </button>
              <div className={`${styles.painel} ${aberto ? styles.painelAberto : ""}`} id={idPainel} role="region" aria-labelledby={idLinha} aria-hidden={!aberto}>
                <div className={styles.detalhes}><p><span>Patrimônio</span><strong>{equipamento.codigo_patrimonio || "—"}</strong></p><p><span>Localização</span><strong>{equipamento.localizacao || "—"}</strong></p><p><span>Tipo</span><strong>{equipamento.tipo || "—"}</strong></p><p><span>Status</span><strong>{statusLabel[equipamento.status] || equipamento.status || "—"}</strong></p></div>
              </div>
            </li>;
          })}
        </ul>
      )}
      {!loading && !erro && aprovado && !equipamentos.length && <p>Nenhum equipamento associado às suas turmas.</p>}
    </section>
  );
}
