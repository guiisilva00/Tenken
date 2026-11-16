"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const requisicao = useRef(null);
  const ativo = useRef(false);
  const versao = useRef(0);
  const aprovando = useRef(false);

  const carregar = useCallback(async (mostrarCarregando = false) => {
    if (requisicao.current || aprovando.current) return;
    const controle = new AbortController();
    requisicao.current = controle;
    const versaoInicial = versao.current;
    if (mostrarCarregando) setCarregando(true);
    setErro("");
    try {
      const dados = await listarCheckinsPendentes({ signal: controle.signal });
      if (ativo.current && versao.current === versaoInicial) setPendentes(dados);
    } catch (falha) {
      if (ativo.current && !controle.signal.aborted) setErro(falha.message || "Não foi possível carregar as aprovações pendentes.");
    } finally {
      if (requisicao.current === controle) requisicao.current = null;
      if (ativo.current) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    ativo.current = true;
    carregar(true);
    const timer = window.setInterval(() => {
      if (!document.hidden) carregar();
    }, 10000);
    const aoVoltar = () => { if (!document.hidden) carregar(); };
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      ativo.current = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", aoVoltar);
      requisicao.current?.abort();
      requisicao.current = null;
    };
  }, [carregar]);

  async function aprovar(id) {
    if (aprovando.current) return;
    aprovando.current = true;
    versao.current += 1;
    setAprovandoId(id);
    setErro("");
    setMensagem("");
    try {
      await aprovarCheckin(id);
      if (!ativo.current) return;
      setPendentes((atual) => atual.filter((item) => item.id !== id));
      setMensagem("Acesso aprovado com sucesso.");
    } catch (falha) {
      if (!ativo.current) return;
      setErro(falha.message || "Não foi possível aprovar este acesso.");
    } finally {
      aprovando.current = false;
      if (ativo.current) setAprovandoId(null);
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
        {erro && (
          <div className={styles.vazio}><p role="alert">{erro}</p><button type="button" onClick={() => carregar(true)}>Tentar novamente</button></div>
        )}
        {carregando && !pendentes.length ? (
          <div className={styles.vazio} role="status">Carregando aprovações…</div>
        ) : pendentes.length ? (
          <ul className={styles.lista}>
            {pendentes.map((item) => (
              <li className={styles.item} key={item.id}>
                <div><strong>{item.aluno?.nome}</strong><span>Matrícula {item.aluno?.matricula}</span></div>
                <div><span>Turma</span><strong>{item.turma?.nome}</strong></div>
                <div><span>Equipamento</span><strong>{item.equipamento?.nome}</strong></div>
                <div><span>Atividade</span><strong>{item.agendamento?.atividade || "Não informada"}</strong></div>
                <div><span>Início da aula</span><strong>{formatarData(item.agendamento?.inicio)}</strong></div>
                <div><span>Término da aula</span><strong>{formatarData(item.agendamento?.fim)}</strong></div>
                <div><span>Token da reserva</span><strong>{item.agendamento?.token || "—"}</strong></div>
                <div><span>Solicitado</span><strong>{formatarData(item.criado_em)}</strong></div>
                <button type="button" onClick={() => aprovar(item.id)} disabled={aprovandoId !== null} aria-label={`Aprovar acesso de ${item.aluno?.nome}`}>
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
