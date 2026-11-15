"use client";

import { useEffect, useState } from "react";
import { listarAgendamentos, listarTurmas } from "../lib/professorApi";
import EmptyState from "@/components/EmptyState";
import ModalProfessor from "./ModalProfessor";
import styles from "./TurmasProfessor.module.css";
import { useModalExit } from "../../useModalExit";

function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatarData(data, inicio) {
  return `${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(`${data}T12:00:00`))} · ${inicio}`;
}

export default function TurmasProfessor() {
  const [dados, setDados] = useState({ turmas: [], agendamentos: [] });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  useEffect(() => {
    let ativo = true;
    Promise.all([listarTurmas(), listarAgendamentos()])
      .then(([turmas, agendamentos]) => {
        if (ativo) setDados({ turmas, agendamentos });
      })
      .catch((error) => {
        if (ativo)
          setErro(error.message || "Não foi possível carregar as turmas.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);
  const [busca, setBusca] = useState("");
  const [turmaId, setTurmaId, fechandoDetalhe, finalizarFechamentoDetalhe] =
    useModalExit(null);
  const turmaSelecionada = dados.turmas.find((item) => item.id === turmaId);

  const turmas = dados.turmas.map((turma) => {
    const reservas = dados.agendamentos
      .filter(
        (item) => item.turmaId === turma.id && item.status !== "CANCELADO",
      )
      .sort((a, b) =>
        `${a.data}${a.inicio}`.localeCompare(`${b.data}${b.inicio}`),
      );
    const proxima = reservas[0];
    return { ...turma, reservas, proxima };
  });

  const totalAlunos = dados.turmas.reduce(
    (total, turma) => total + turma.alunos,
    0,
  );
  const termoBusca = normalizar(busca.trim());
  const visiveis = turmas.filter((turma) =>
    normalizar(`${turma.nome} ${turma.proxima?.atividade || ""}`).includes(
      termoBusca,
    ),
  );
  const reservasDetalhe = turmaSelecionada
    ? dados.agendamentos
        .filter((item) => item.turmaId === turmaSelecionada.id)
        .sort((a, b) =>
          `${a.data}${a.inicio}`.localeCompare(`${b.data}${b.inicio}`),
        )
    : [];

  return (
    <div className={styles.container}>
      <section
        className={styles.cabecalhoPagina}
        aria-labelledby="titulo-minhas-turmas"
      >
        <div>
          <p className={styles.contexto}>VÍNCULOS ACADÊMICOS</p>
          <h1 id="titulo-minhas-turmas">Minhas turmas</h1>
          <p className={styles.subtitulo}>
            Consulte os grupos sob sua responsabilidade e as atividades no
            laboratório.
          </p>
        </div>
      </section>

      <section className={styles.resumo} aria-label="Resumo das turmas">
        <article className={`${styles.metrica} tenken-entrada`}>
          <span>Turmas e projetos</span>
          <strong>{dados.turmas.length}</strong>
          <small>vinculados à sua conta</small>
        </article>
        <article className={`${styles.metrica} tenken-entrada`}>
          <span>Vínculos de alunos</span>
          <strong>{totalAlunos}</strong>
          <small>participações nas turmas</small>
        </article>
        <article className={`${styles.metrica} tenken-entrada`}>
          <span>Atividades agendadas</span>
          <strong>
            {
              dados.agendamentos.filter((item) => item.status !== "CANCELADO")
                .length
            }
          </strong>
          <small>reservas ativas</small>
        </article>
      </section>

      <section className={styles.painel} aria-labelledby="titulo-lista-turmas">
        <div className={styles.cabecalhoPainel}>
          <div>
            <h2 id="titulo-lista-turmas">Turmas e projetos vinculados</h2>
            <p>Turmas vinculadas à sua conta aparecerão aqui.</p>
          </div>
          <span className={styles.contagem}>
            {visiveis.length} {visiveis.length === 1 ? "grupo" : "grupos"}
          </span>
        </div>
        <label className={styles.busca} htmlFor="busca-turmas">
          <span className="material-symbols-outlined" aria-hidden="true">
            search
          </span>
          <input
            id="busca-turmas"
            type="search"
            placeholder="Buscar turma ou atividade"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />
        </label>
        {carregando ? (
          <div className={styles.estadoVazio} role="status">
            <p>Carregando turmas…</p>
          </div>
        ) : erro ? (
          <div className={styles.estadoVazio}>
            <p role="alert">{erro}</p>
          </div>
        ) : visiveis.length > 0 ? (
          <div className={styles.listaTurmas}>
            {visiveis.map((turma) => (
              <article className={styles.itemTurma} key={turma.id}>
                <div className={styles.identidadeTurma}>
                  <span className={styles.marcaTurma} aria-hidden="true">
                    {turma.nome.slice(0, 1)}
                  </span>
                  <div>
                    <h3>{turma.nome}</h3>
                    <span>{turma.alunos} alunos vinculados</span>
                  </div>
                </div>
                <div className={styles.proximaAtividade}>
                  <span>PRÓXIMA ATIVIDADE</span>
                  <strong>
                    {turma.proxima?.atividade || "Nenhuma reserva ativa"}
                  </strong>
                  <small>
                    {turma.proxima
                      ? `${formatarData(turma.proxima.data, turma.proxima.inicio)} · ${turma.proxima.equipamento}`
                      : "Sem atividade prevista"}
                  </small>
                </div>
                <button
                  className={styles.botaoDetalhes}
                  type="button"
                  onClick={() => setTurmaId(turma.id)}
                  aria-label={`Detalhes de ${turma.nome}`}
                >
                  Detalhes <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icone="groups"
            titulo="Nenhuma turma encontrada"
            mensagem="Confira o texto digitado e tente novamente."
          />
        )}
        <p className={styles.notaDados}>
          As turmas vinculadas à sua conta serão listadas aqui.
        </p>
      </section>

      {turmaSelecionada && (
        <ModalProfessor
          titulo={turmaSelecionada.nome}
          descricao="Resumo da turma e atividades registradas."
          closing={fechandoDetalhe}
          onExitEnd={finalizarFechamentoDetalhe}
          onClose={() => setTurmaId(null)}
        >
          <div className={styles.detalhesTurma}>
            <p>
              <span>Alunos vinculados</span>
              <strong>{turmaSelecionada.alunos}</strong>
            </p>
            <p>
              <span>Atividades ativas</span>
              <strong>
                {
                  reservasDetalhe.filter((item) => item.status !== "CANCELADO")
                    .length
                }
              </strong>
            </p>
          </div>
          <div className={styles.listaAtividades}>
            <h3>Agendamentos da turma</h3>
            {reservasDetalhe.length ? (
              reservasDetalhe.map((reserva) => (
                <p key={reserva.id}>
                  <span>
                    {formatarData(reserva.data, reserva.inicio)}–{reserva.fim} ·{" "}
                    {reserva.status === "CANCELADO"
                      ? "Cancelado"
                      : reserva.status === "CONCLUIDO"
                        ? "Concluído"
                        : reserva.status === "EM_ANDAMENTO"
                          ? "Em andamento"
                          : "Confirmado"}
                  </span>
                  <strong>
                    {reserva.atividade} — {reserva.equipamento}
                  </strong>
                </p>
              ))
            ) : (
              <p className={styles.semAtividade}>
                Nenhuma atividade registrada.
              </p>
            )}
          </div>
          <div className={styles.rodapeDetalhes}>
            <button type="button" onClick={() => setTurmaId(null)}>
              Fechar
            </button>
          </div>
        </ModalProfessor>
      )}
    </div>
  );
}
