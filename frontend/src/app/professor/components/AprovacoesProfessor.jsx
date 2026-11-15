"use client";

import { useCallback, useEffect, useState } from "react";
import { aprovarCheckin, listarCheckinsPendentes } from "../lib/professorApi";
import styles from "./AprovacoesProfessor.module.css";

function formatarData(valor) {
  if (!valor) return "—";
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? String(valor) : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(data);
}

export default function AprovacoesProfessor() {
  const [pendentes, setPendentes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aprovandoId, setAprovandoId] = useState(null);
  const [mensagem, setMensagem] = useState("");

  const carregar = useCallback(async (mostrarCarregando = false) => {
    if (mostrarCarregando) setCarregando(true);
    setErro("");
    try {
      setPendentes(await listarCheckinsPendentes());
    } catch (falha) {
      setErro(falha.message || "Não foi possível carregar as aprovações pendentes.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(true); }, [carregar]);

  async function aprovar(id) {
    setAprovandoId(id);
    setErro("");
    setMensagem("");
    try {
      await aprovarCheckin(id);
      setPendentes((atual) => atual.filter((item) => item.id !== id));
      setMensagem("Acesso aprovado com sucesso.");
    } catch (falha) {
      setErro(falha.message || "Não foi possível aprovar este acesso.");
    } finally {
      setAprovandoId(null);
    }
  }

  return (
    <div className={styles.container}>
      <section className={styles.cabecalho} aria-labelledby="titulo-aprovacoes">
        <div>
          <h1 id="titulo-aprovacoes">Aprovações pendentes</h1>
          <p>Libere o acesso dos alunos à bancada após a solicitação de check-in.</p>
        </div>
        <button type="button" onClick={() => carregar(true)} disabled={carregando}>Atualizar</button>
      </section>
      <section className={styles.painel} aria-labelledby="titulo-lista-aprovacoes">
        <header className={styles.cabecalhoPainel}>
          <div><h2 id="titulo-lista-aprovacoes">Solicitações de acesso</h2><p>{pendentes.length} aguardando aprovação</p></div>
        </header>
        {mensagem && <p className={styles.sucesso} role="status">{mensagem}</p>}
        {erro ? (
          <div className={styles.vazio}><p role="alert">{erro}</p><button type="button" onClick={() => carregar(true)}>Tentar novamente</button></div>
        ) : carregando ? (
          <div className={styles.vazio} role="status">Carregando aprovações…</div>
        ) : pendentes.length ? (
          <ul className={styles.lista}>
            {pendentes.map((item) => (
              <li className={styles.item} key={item.id}>
                <div><strong>{item.aluno?.nome}</strong><span>Matrícula {item.aluno?.matricula}</span></div>
                <div><span>Turma</span><strong>{item.turma?.nome}</strong></div>
                <div><span>Equipamento</span><strong>{item.equipamento?.nome}</strong></div>
                <div><span>Solicitado</span><strong>{formatarData(item.criado_em)}</strong></div>
                <button type="button" onClick={() => aprovar(item.id)} disabled={aprovandoId === item.id} aria-label={`Aprovar acesso de ${item.aluno?.nome}`}>
                  {aprovandoId === item.id ? "Aprovando…" : "Aprovar"}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.vazio}><h3>Nenhuma aprovação pendente</h3><p>Novas solicitações de acesso aparecerão aqui.</p></div>
        )}
      </section>
    </div>
  );
}
