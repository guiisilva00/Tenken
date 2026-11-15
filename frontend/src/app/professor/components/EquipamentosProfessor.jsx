"use client";

import { useEffect, useState } from "react";
import { listarAgendamentos, listarEquipamentos } from "../lib/professorApi";
import EmptyState from "@/components/EmptyState";
import ModalProfessor from "./ModalProfessor";
import styles from "./EquipamentosProfessor.module.css";
import { useModalExit } from "../../useModalExit";

const statusLabels = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  EM_USO: "Em uso",
  EM_MANUTENCAO: "Em manutenção",
  INATIVO: "Inativo",
};

function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatarData(data) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${data}T12:00:00`));
}

export default function EquipamentosProfessor() {
  const [dados, setDados] = useState({ equipamentos: [], agendamentos: [] });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([listarEquipamentos(), listarAgendamentos()])
      .then(([equipamentos, agendamentos]) => {
        if (active) setDados({ equipamentos, agendamentos });
      })
      .catch((error) => {
        if (active)
          setErro(
            error.message || "Não foi possível carregar os equipamentos.",
          );
      })
      .finally(() => {
        if (active) setCarregando(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [
    equipamentoId,
    setEquipamentoId,
    fechandoDetalhe,
    finalizarFechamentoDetalhe,
  ] = useModalExit(null);
  const equipamentoSelecionado = dados.equipamentos.find(
    (item) => item.id === equipamentoId,
  );

  const contagem = dados.equipamentos.reduce((total, equipamento) => {
    total[equipamento.status] = (total[equipamento.status] || 0) + 1;
    return total;
  }, {});

  const termoBusca = normalizar(busca.trim());
  const visiveis = dados.equipamentos.filter((equipamento) => {
    const correspondeStatus =
      filtroStatus === "TODOS" || equipamento.status === filtroStatus;
    const texto = normalizar(
      `${equipamento.nome} ${equipamento.patrimonio} ${equipamento.localizacao} ${equipamento.tipo}`,
    );
    return correspondeStatus && (!termoBusca || texto.includes(termoBusca));
  });

  const reservasRelacionadas = equipamentoSelecionado
    ? dados.agendamentos
        .filter(
          (item) =>
            item.equipamentoId === equipamentoSelecionado.id &&
            item.status !== "CANCELADO",
        )
        .sort((a, b) =>
          `${b.data}${b.inicio}`.localeCompare(`${a.data}${a.inicio}`),
        )
        .slice(0, 3)
    : [];

  return (
    <div className={styles.container}>
      <section
        className={styles.cabecalhoPagina}
        aria-labelledby="titulo-equipamentos-professor"
      >
        <div>
          <p className={styles.contexto}>INVENTÁRIO DO LABORATÓRIO</p>
          <h1 id="titulo-equipamentos-professor">Equipamentos</h1>
          <p className={styles.subtitulo}>
            Consulte a disponibilidade e a localização dos equipamentos do
            laboratório.
          </p>
        </div>
      </section>

      <section className={styles.resumo} aria-label="Resumo por situação">
        <article className={`${styles.metrica} tenken-entrada`}>
          <span>Total cadastrado</span>
          <strong>{dados.equipamentos.length}</strong>
          <small>itens cadastrados</small>
        </article>
        <article
          className={`${styles.metrica} tenken-entrada ${styles.metricaDisponivel}`}
        >
          <span>Disponíveis</span>
          <strong>{contagem.DISPONIVEL || 0}</strong>
          <small>liberados para uso</small>
        </article>
        <article
          className={`${styles.metrica} tenken-entrada ${styles.metricaUso}`}
        >
          <span>Em uso</span>
          <strong>{contagem.EM_USO || 0}</strong>
          <small>reservas em andamento</small>
        </article>
        <article
          className={`${styles.metrica} tenken-entrada ${styles.metricaManutencao}`}
        >
          <span>Em manutenção</span>
          <strong>{contagem.EM_MANUTENCAO || 0}</strong>
          <small>indisponíveis para reserva</small>
        </article>
      </section>

      <section className={styles.painel} aria-labelledby="titulo-inventario">
        <div className={styles.cabecalhoPainel}>
          <div>
            <h2 id="titulo-inventario">Inventário</h2>
            <p>Equipamentos disponíveis para as atividades das suas turmas.</p>
          </div>
          <span className={styles.totalVisivel}>
            {visiveis.length} de {dados.equipamentos.length} itens
          </span>
        </div>
        <div className={styles.filtros}>
          <label className={styles.busca} htmlFor="busca-equipamentos">
            <span className="material-symbols-outlined" aria-hidden="true">
              search
            </span>
            <input
              id="busca-equipamentos"
              type="search"
              placeholder="Buscar nome, patrimônio ou localização"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
            />
          </label>
          <label
            className={styles.filtroStatus}
            htmlFor="filtro-status-equipamentos"
          >
            <span>Situação</span>
            <select
              id="filtro-status-equipamentos"
              value={filtroStatus}
              onChange={(evento) => setFiltroStatus(evento.target.value)}
            >
              <option value="TODOS">Todas</option>
              {Object.entries(statusLabels).map(([status, label]) => (
                <option key={status} value={status}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {carregando ? (
          <div className={styles.estadoVazio} role="status">
            <p>Carregando equipamentos…</p>
          </div>
        ) : erro ? (
          <div className={styles.estadoVazio}>
            <p role="alert">{erro}</p>
          </div>
        ) : visiveis.length > 0 ? (
          <div className={styles.tabelaViewport}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th scope="col">Equipamento</th>
                  <th scope="col">Patrimônio</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Localização</th>
                  <th scope="col">Situação</th>
                  <th scope="col">
                    <span className={styles.somenteLeitor}>Ação</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((equipamento) => (
                  <tr key={equipamento.id}>
                    <td>
                      <strong>{equipamento.nome}</strong>
                    </td>
                    <td className={styles.codigo}>{equipamento.patrimonio}</td>
                    <td>{equipamento.tipo === "ROBO" ? "Robô" : "Bancada"}</td>
                    <td>{equipamento.localizacao}</td>
                    <td>
                      <span
                        className={`${styles.status} ${styles[`status_${equipamento.status}`]}`}
                      >
                        <i />
                        {statusLabels[equipamento.status]}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.botaoDetalhes}
                        type="button"
                        onClick={() => setEquipamentoId(equipamento.id)}
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icone="search_off"
            titulo="Nenhum equipamento encontrado"
            mensagem="Altere a busca ou o filtro de situação para consultar o inventário."
          />
        )}
        <p className={styles.notaDados}>
          Os equipamentos cadastrados no sistema aparecerão nesta lista.
        </p>
      </section>

      {equipamentoSelecionado && (
        <ModalProfessor
          titulo={equipamentoSelecionado.nome}
          descricao="Detalhes do equipamento cadastrado."
          closing={fechandoDetalhe}
          onExitEnd={finalizarFechamentoDetalhe}
          onClose={() => setEquipamentoId(null)}
        >
          <div className={styles.detalhes}>
            <p>
              <span>Patrimônio</span>
              <strong>{equipamentoSelecionado.patrimonio}</strong>
            </p>
            <p>
              <span>Tipo</span>
              <strong>
                {equipamentoSelecionado.tipo === "ROBO" ? "Robô" : "Bancada"}
              </strong>
            </p>
            <p>
              <span>Localização</span>
              <strong>{equipamentoSelecionado.localizacao}</strong>
            </p>
            <p>
              <span>Situação</span>
              <strong
                className={styles[`texto_${equipamentoSelecionado.status}`]}
              >
                {statusLabels[equipamentoSelecionado.status]}
              </strong>
            </p>
          </div>
          <div className={styles.reservasRelacionadas}>
            <h3>Reservas relacionadas</h3>
            {reservasRelacionadas.length ? (
              reservasRelacionadas.map((reserva) => (
                <p key={reserva.id}>
                  <span>
                    {formatarData(reserva.data)} · {reserva.inicio}–
                    {reserva.fim}
                  </span>
                  <strong>
                    {reserva.turma} — {reserva.atividade}
                  </strong>
                </p>
              ))
            ) : (
              <p className={styles.semReserva}>
                Nenhuma reserva registrada para este equipamento.
              </p>
            )}
          </div>
          <div className={styles.acoesDetalhe}>
            <button type="button" onClick={() => setEquipamentoId(null)}>
              Fechar
            </button>
          </div>
        </ModalProfessor>
      )}
    </div>
  );
}
