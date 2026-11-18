"use client";

import { useCallback, useEffect, useState } from "react";
import {
  cancelarAgendamento,
  criarAgendamento,
  listarAgendamentos,
  listarEquipamentos,
  listarInspecoes,
  listarTurmas,
} from "../lib/professorApi";
import FormularioAgendamento from "./FormularioAgendamento";
import ModalProfessor from "./ModalProfessor";
import styles from "./AgendamentosProfessor.module.css";
import { useModalExit } from "../../useModalExit";

const HORAS = [
  "08:00",
  "10:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
  "20:00",
  "22:00",
];
const MINUTOS_INICIO = 8 * 60;
const ALTURA_INTERVALO = 62;
const rotulosStatus = {
  CONFIRMADO: "Confirmado",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

function paraISO(data) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

function inicioDaSemana(data) {
  const inicio = new Date(data);
  inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7));
  inicio.setHours(12, 0, 0, 0);
  return inicio;
}

function somarDias(data, quantidade) {
  const resultado = new Date(data);
  resultado.setDate(resultado.getDate() + quantidade);
  return resultado;
}

function formatarData(data, opcoes = { day: "2-digit", month: "short" }) {
  return new Intl.DateTimeFormat("pt-BR", opcoes).format(
    new Date(`${data}T12:00:00`),
  );
}

function formatarDiaSemana(data) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
    .format(data)
    .replace(".", "")
    .toUpperCase();
}

function minutosDoHorario(horario) {
  const [horas, minutos] = horario.split(":").map(Number);
  return horas * 60 + minutos;
}

function horarioJaPassou(data, horario, agora) {
  return new Date(`${data}T${horario}:00`) <= agora;
}

function rotuloInspecao(registro) {
  if (!registro) return "A iniciar";
  if (!registro.resultado)
    return registro.cancelada ? "Cancelada" : "Inspeção pendente";
  if (registro.resultado === "APROVADO_COM_RESSALVAS")
    return "Aprovada com ressalvas";
  if (registro.resultado === "REPROVADO") return "Reprovada";
  return "Pré-uso aprovado";
}

function obterClasseStatus(status) {
  if (status === "EM_ANDAMENTO") return styles.eventoEmAndamento;
  if (status === "CONCLUIDO") return styles.eventoConcluido;
  if (status === "CANCELADO") return styles.eventoCancelado;
  return styles.eventoConfirmado;
}

export default function AgendamentosProfessor() {
  const [dados, setDados] = useState({
    agendamentos: [],
    equipamentos: [],
    inspecoes: [],
    turmas: [],
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [localizacaoFiltro, setLocalizacaoFiltro] = useState("TODAS");
  const [equipamentoFiltro, setEquipamentoFiltro] = useState("TODOS");
  const [visualizacao, setVisualizacao] = useState("SEMANA");
  const [dataFoco, setDataFoco] = useState(() => new Date());
  const [criando, setCriando, fechandoCriacao, finalizarFechamentoCriacao] =
    useModalExit(false);
  const [formularioInicial, setFormularioInicial] = useState(null);
  const [
    reservaCriada,
    setReservaCriada,
    fechandoConfirmacao,
    finalizarFechamentoConfirmacao,
  ] = useModalExit(null);
  const [tokenCopiado, setTokenCopiado] = useState(false);
  const [erroToken, setErroToken] = useState("");
  const [detalheId, setDetalheId, fechandoDetalhe, finalizarFechamentoDetalhe] =
    useModalExit(null);
  const [mensagem, setMensagem] = useState("");
  const [agora, setAgora] = useState(() => new Date());

  const carregar = useCallback(async (mostrarCarregando = false) => {
    if (mostrarCarregando) setCarregando(true);
    setErro("");
    try {
      const [agendamentos, equipamentos, inspecoes, turmas] = await Promise.all(
        [
          listarAgendamentos(),
          listarEquipamentos(),
          listarInspecoes(),
          listarTurmas(),
        ],
      );
      setDados({ agendamentos, equipamentos, inspecoes, turmas });
    } catch (falha) {
      setErro(falha.message || "Não foi possível carregar os agendamentos.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar(true);
  }, [carregar]);

  useEffect(() => {
    const intervalo = window.setInterval(() => setAgora(new Date()), 30_000);
    return () => window.clearInterval(intervalo);
  }, []);

  const localizacoes = [
    ...new Set(
      dados.equipamentos.map((item) => item.localizacao).filter(Boolean),
    ),
  ].sort();
  const equipamentosFiltrados = dados.equipamentos.filter(
    (item) =>
      localizacaoFiltro === "TODAS" || item.localizacao === localizacaoFiltro,
  );

  const dataReferencia = paraISO(dataFoco);
  const hoje = paraISO(new Date());
  const primeiroDiaMes = new Date(
    dataFoco.getFullYear(),
    dataFoco.getMonth(),
    1,
    12,
  );
  const ultimoDiaMes = new Date(
    dataFoco.getFullYear(),
    dataFoco.getMonth() + 1,
    0,
    12,
  );
  const diasSemana = Array.from({ length: 5 }, (_, indice) =>
    somarDias(dataFoco, indice),
  );
  const podeVoltarPeriodo =
    visualizacao === "DIA" || visualizacao === "SEMANA"
      ? dataReferencia > hoje
      : true;
  const dataInicio =
    visualizacao === "DIA"
      ? dataReferencia
      : visualizacao === "MES"
        ? paraISO(primeiroDiaMes)
        : paraISO(diasSemana[0]);
  const dataFim =
    visualizacao === "DIA"
      ? dataReferencia
      : visualizacao === "MES"
        ? paraISO(ultimoDiaMes)
        : paraISO(somarDias(diasSemana[4], 2));

  const reservasPeriodo = dados.agendamentos
    .filter(
      (item) =>
        item.status !== "CANCELADO" &&
        item.data >= dataInicio &&
        item.data <= dataFim,
    )
    .sort((a, b) =>
      `${a.data}${a.inicio}`.localeCompare(`${b.data}${b.inicio}`),
    );

  const termoBusca = busca
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const reservasVisiveis = reservasPeriodo.filter((item) => {
    const equipamento = dados.equipamentos.find(
      (registro) => String(registro.id) === String(item.equipamentoId),
    );
    const correspondeLocal =
      localizacaoFiltro === "TODAS" ||
      equipamento?.localizacao === localizacaoFiltro;
    const correspondeEquipamento =
      equipamentoFiltro === "TODOS" ||
      String(item.equipamentoId) === equipamentoFiltro;
    const texto =
      `${item.atividade} ${item.turma} ${item.equipamento} ${item.patrimonio}`
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return (
      correspondeLocal &&
      correspondeEquipamento &&
      (!termoBusca || texto.includes(termoBusca))
    );
  });

  const resumo = {
    total: reservasVisiveis.filter((item) => item.status !== "CANCELADO")
      .length,
    pendentes: dados.inspecoes.filter(
      (item) =>
        !item.resultado &&
        !item.cancelada &&
        item.data >= dataInicio &&
        item.data <= dataFim,
    ).length,
  };

  const reservaDetalhe = dados.agendamentos.find(
    (item) => item.id === detalheId,
  );
  const preUsoDetalhe =
    reservaDetalhe &&
    dados.inspecoes.find(
      (item) =>
        item.agendamentoId === reservaDetalhe.id && item.etapa === "PRE_USO",
    );

  const inicioGradeMes = inicioDaSemana(primeiroDiaMes);
  const datasMes = Array.from({ length: 42 }, (_, indice) =>
    somarDias(inicioGradeMes, indice),
  );

  const rotuloPeriodo =
    visualizacao === "DIA"
      ? formatarData(dataReferencia, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : visualizacao === "MES"
        ? new Intl.DateTimeFormat("pt-BR", {
            month: "long",
            year: "numeric",
          }).format(dataFoco)
        : `${formatarData(paraISO(diasSemana[0]))} – ${formatarData(paraISO(diasSemana[4]))} ${dataFoco.getFullYear()}`;

  function moverPeriodo(direcao) {
    setDataFoco((atual) => {
      const proxima = new Date(atual);
      if (visualizacao === "DIA") proxima.setDate(proxima.getDate() + direcao);
      else if (visualizacao === "SEMANA")
        proxima.setDate(proxima.getDate() + direcao * 7);
      else {
        proxima.setDate(1);
        proxima.setMonth(proxima.getMonth() + direcao);
      }
      return proxima;
    });
  }

  function abrirFormulario(
    data = dataReferencia,
    inicio = "09:00",
    equipamentoId = equipamentoFiltro === "TODOS" ? "" : equipamentoFiltro,
  ) {
    if (data < paraISO(new Date())) {
      setMensagem(
        "Não é possível criar agendamentos em dias anteriores a hoje.",
      );
      return;
    }
    if (horarioJaPassou(data, inicio, new Date())) {
      setMensagem("Não é possível agendar em um horário que já passou.");
      return;
    }
    const [hora] = inicio.split(":").map(Number);
    const fim = `${String(Math.min(hora + (inicio === "09:00" ? 1 : 2), 23)).padStart(2, "0")}:00`;
    setFormularioInicial({ data, inicio, fim, equipamentoId });
    setMensagem("");
    setCriando(true);
  }

  async function salvarReserva(formulario) {
    try {
      const criada = await criarAgendamento(formulario);
      await carregar();
      setReservaCriada(criada);
      setTokenCopiado(false);
      setErroToken("");
      return { ok: true };
    } catch (falha) {
      return {
        ok: false,
        message: falha.message || "Não foi possível criar o agendamento.",
      };
    }
  }

  async function copiarToken() {
    try {
      await navigator.clipboard.writeText(reservaCriada.token);
      setTokenCopiado(true);
      setErroToken("");
    } catch {
      setErroToken(
        "Não foi possível copiar o token. Selecione e copie manualmente.",
      );
    }
  }

  async function executarAcaoReserva() {
    if (!reservaDetalhe || reservaDetalhe.status !== "CONFIRMADO") return;
    try {
      await cancelarAgendamento(reservaDetalhe.id);
      setDetalheId(null);
      await carregar();
      setMensagem("Agendamento cancelado.");
    } catch (falha) {
      setMensagem(falha.message || "Não foi possível cancelar o agendamento.");
    }
  }

  function eventosDoDia(data) {
    const chave = paraISO(data);
    return reservasVisiveis.filter((item) => item.data === chave);
  }

  function renderAgendaDia(data) {
    const eventos = eventosDoDia(data);
    const diaPassado = paraISO(data) < hoje;
    return (
      <div className={styles.agendaDia}>
        {HORAS.map((hora, indice) => {
          const horarioIndisponivel =
            diaPassado || horarioJaPassou(paraISO(data), hora, agora);
          return (
            <button
              type="button"
              key={hora}
              className={`${styles.slotVazio} ${horarioIndisponivel ? styles.slotPassado : ""}`}
              style={{ top: `${indice * ALTURA_INTERVALO}px` }}
              disabled={horarioIndisponivel}
              onClick={() => abrirFormulario(paraISO(data), hora)}
              aria-label={`Criar agendamento em ${formatarData(paraISO(data))}, às ${hora}`}
              aria-disabled={horarioIndisponivel}
            >
              <span>+ Reservar</span>
            </button>
          );
        })}
        {eventos.map((item) => {
          const inicio = minutosDoHorario(item.inicio);
          const fim = minutosDoHorario(item.fim);
          const topo = Math.max(
            0,
            ((inicio - MINUTOS_INICIO) / 120) * ALTURA_INTERVALO,
          );
          const duracao = Math.max(
            30,
            Math.min(fim, 22 * 60 + 120) - Math.max(inicio, MINUTOS_INICIO),
          );
          const altura = Math.max(37, (duracao / 120) * ALTURA_INTERVALO - 4);
          return (
            <button
              type="button"
              key={item.id}
              className={`${styles.evento} ${obterClasseStatus(item.status)}`}
              style={{ top: `${topo + 2}px`, height: `${altura}px` }}
              onClick={() => {
                setMensagem("");
                setDetalheId(item.id);
              }}
              aria-label={`${item.atividade}, ${item.inicio} a ${item.fim}, ${item.equipamento}. Ver detalhes.`}
            >
              <strong>
                {item.turma} — {item.atividade}
              </strong>
              <span>
                {item.inicio}–{item.fim} · {item.equipamento}
              </span>
              {item.token && altura >= 55 && (
                <small className={styles.tokenReserva}>
                  Token: {item.token}
                </small>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  const equipamentosOperacionais = dados.equipamentos.filter(
    (item) => !["EM_MANUTENCAO", "INATIVO"].includes(item.status),
  ).length;
  const periodoTemReservaForaDaGrade = reservasVisiveis.some(
    (item) =>
      minutosDoHorario(item.inicio) < MINUTOS_INICIO ||
      minutosDoHorario(item.inicio) >= 22 * 60 ||
      minutosDoHorario(item.fim) <= MINUTOS_INICIO,
  );
  const reservasFimDeSemana =
    visualizacao === "SEMANA"
      ? reservasVisiveis.filter((item) => item.data > paraISO(diasSemana[4]))
          .length
      : 0;

  return (
    <div className={styles.container}>
      <section
        className={styles.cabecalhoPagina}
        aria-labelledby="titulo-agendamentos"
      >
        <div>
          <p className={styles.contexto}>AGENDA ACADÊMICA</p>
          <h1 id="titulo-agendamentos">
            Painel de Agendamentos e Controle de Turmas
          </h1>
        </div>
        <span className={styles.resumoPeriodo}>
          {resumo.total} {resumo.total === 1 ? "reserva" : "reservas"} ·{" "}
          {resumo.pendentes}{" "}
          {resumo.pendentes === 1 ? "inspeção pendente" : "inspeções pendentes"}
        </span>
      </section>

      {mensagem && (
        <p className={styles.mensagemSucesso} role="status">
          {mensagem}
          <button
            type="button"
            onClick={() => setMensagem("")}
            aria-label="Fechar aviso"
          >
            ×
          </button>
        </p>
      )}

      <section className={styles.filtrosTopo} aria-label="Filtros da agenda">
        <label className={styles.controleSelect}>
          <span>Selecione o laboratório</span>
          <select
            value={localizacaoFiltro}
            onChange={(evento) => {
              setLocalizacaoFiltro(evento.target.value);
              setEquipamentoFiltro("TODOS");
            }}
          >
            <option value="TODAS">Todos os laboratórios</option>
            {localizacoes.map((localizacao) => (
              <option key={localizacao} value={localizacao}>
                {localizacao}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.controleSelect}>
          <span>Equipamento / bancada</span>
          <select
            value={equipamentoFiltro}
            onChange={(evento) => setEquipamentoFiltro(evento.target.value)}
          >
            <option value="TODOS">Todos os equipamentos</option>
            {equipamentosFiltrados.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.controleSelect}>
          <span>Visualização</span>
          <select
            value={visualizacao}
            onChange={(evento) => setVisualizacao(evento.target.value)}
          >
            <option value="SEMANA">Semanal</option>
            <option value="DIA">Diária</option>
            <option value="MES">Mensal</option>
          </select>
        </label>
        <button
          className={styles.botaoPrimario}
          type="button"
          onClick={() => abrirFormulario()}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            add
          </span>
          Novo agendamento
        </button>
      </section>

      <section
        className={styles.painelAgenda}
        aria-labelledby="titulo-calendario"
      >
        <div className={styles.cabecalhoPainel}>
          <div className={styles.navegacaoPeriodo}>
            <button
              type="button"
              onClick={() => moverPeriodo(-1)}
              disabled={!podeVoltarPeriodo}
              aria-label="Período anterior"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                chevron_left
              </span>
            </button>
            <h2 id="titulo-calendario">{rotuloPeriodo}</h2>
            <button
              type="button"
              onClick={() => moverPeriodo(1)}
              aria-label="Próximo período"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                chevron_right
              </span>
            </button>
            <span
              className={`${styles.estadoLaboratorio} ${equipamentosOperacionais ? styles.laboratorioAtivo : styles.laboratorioInativo}`}
            >
              <i />
              {equipamentosOperacionais
                ? "Laboratório operacional"
                : "Sem equipamentos disponíveis"}
            </span>
          </div>
          <div
            className={styles.alternadorVisualizacao}
            role="group"
            aria-label="Visualização do calendário"
          >
            {[
              ["DIA", "Dia"],
              ["SEMANA", "Semana"],
              ["MES", "Mês"],
            ].map(([valor, rotulo]) => (
              <button
                type="button"
                key={valor}
                className={
                  visualizacao === valor ? styles.visualizacaoAtiva : ""
                }
                aria-pressed={visualizacao === valor}
                onClick={() => {
                  setVisualizacao(valor);
                  if (valor === "SEMANA" && dataReferencia < hoje)
                    setDataFoco(new Date());
                }}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filtrosAgenda}>
          <label className={styles.busca} htmlFor="busca-agendamentos">
            <span className="material-symbols-outlined" aria-hidden="true">
              search
            </span>
            <input
              id="busca-agendamentos"
              type="search"
              placeholder="Buscar reserva, turma, bancada…"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
            />
          </label>
          <span className={styles.contagem}>
            {reservasVisiveis.length}{" "}
            {reservasVisiveis.length === 1 ? "reserva" : "reservas"}
          </span>
        </div>

        {carregando ? (
          <div className={styles.estadoLista} role="status">
            <span className="material-symbols-outlined" aria-hidden="true">
              progress_activity
            </span>
            <p>Carregando agenda…</p>
          </div>
        ) : erro ? (
          <div className={styles.estadoLista}>
            <p role="alert">{erro}</p>
            <button type="button" onClick={() => carregar(true)}>
              Tentar novamente
            </button>
          </div>
        ) : visualizacao === "MES" ? (
          <div className={styles.gradeMes}>
            {["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"].map((dia) => (
              <div className={styles.tituloDiaMes} key={dia}>
                {dia}
              </div>
            ))}
            {datasMes.map((dia) => {
              const eventos = eventosDoDia(dia);
              const noMes = dia.getMonth() === dataFoco.getMonth();
              return (
                <div
                  className={`${styles.celulaMes} ${noMes ? "" : styles.celulaForaMes} ${paraISO(dia) === paraISO(new Date()) ? styles.celulaHoje : ""}`}
                  key={paraISO(dia)}
                >
                  <button
                    className={styles.numeroDiaMes}
                    type="button"
                    onClick={() => {
                      setDataFoco(dia);
                      setVisualizacao("DIA");
                    }}
                    aria-label={`Ver agenda de ${formatarData(paraISO(dia), { day: "numeric", month: "long", year: "numeric" })}`}
                  >
                    {dia.getDate()}
                  </button>
                  {eventos.slice(0, 3).map((item) => (
                    <button
                      className={`${styles.eventoMes} ${obterClasseStatus(item.status)}`}
                      type="button"
                      key={item.id}
                      onClick={() => setDetalheId(item.id)}
                    >
                      {item.inicio} · {item.atividade}
                    </button>
                  ))}
                  {eventos.length > 3 && (
                    <span className={styles.maisEventos}>
                      +{eventos.length - 3} mais
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.calendarioViewport}>
            <div
              className={styles.gradeSemana}
              style={{ "--colunas-dias": visualizacao === "DIA" ? 1 : 5 }}
            >
              <div className={styles.cabecalhoHorario}>Horário</div>
              {(visualizacao === "DIA" ? [dataFoco] : diasSemana).map((dia) => (
                <div className={styles.cabecalhoDia} key={paraISO(dia)}>
                  <span>{formatarDiaSemana(dia)}</span>
                  <strong
                    className={
                      paraISO(dia) === paraISO(new Date()) ? styles.diaHoje : ""
                    }
                  >
                    {dia.getDate()}
                  </strong>
                </div>
              ))}
              <div className={styles.colunaHoras}>
                {HORAS.map((hora) => (
                  <div className={styles.rotuloHora} key={hora}>
                    {hora}
                  </div>
                ))}
              </div>
              {(visualizacao === "DIA" ? [dataFoco] : diasSemana).map((dia) => (
                <div className={styles.colunaAgenda} key={paraISO(dia)}>
                  {renderAgendaDia(dia)}
                </div>
              ))}
            </div>
          </div>
        )}
        {periodoTemReservaForaDaGrade && visualizacao !== "MES" && (
          <p className={styles.notaDados}>
            Há reservas fora da faixa horária exibida (08:00–22:00).
          </p>
        )}
        {reservasFimDeSemana > 0 && (
          <p className={styles.notaDados}>
            {reservasFimDeSemana}{" "}
            {reservasFimDeSemana === 1
              ? "reserva de fim de semana fica fora"
              : "reservas de fim de semana ficam fora"}{" "}
            da grade semanal.
          </p>
        )}
        <p className={styles.notaDados}>
          Selecione um horário livre para iniciar uma reserva. As inspeções
          pré-uso são obrigatórias antes da atividade.
        </p>
      </section>

      {criando && formularioInicial && (
        <ModalProfessor
          titulo="Novo agendamento"
          descricao="Informe a atividade, a turma, o equipamento e o horário."
          icone="event_available"
          closing={fechandoCriacao}
          onExitEnd={finalizarFechamentoCriacao}
          onClose={() => setCriando(false)}
        >
          <FormularioAgendamento
            dataInicial={formularioInicial.data}
            horarioInicial={formularioInicial.inicio}
            fimInicial={formularioInicial.fim}
            equipamentoInicial={formularioInicial.equipamentoId}
            turmas={dados.turmas}
            equipamentos={dados.equipamentos}
            onCreate={salvarReserva}
            onCancel={() => setCriando(false)}
          />
        </ModalProfessor>
      )}

      {reservaCriada && (
        <ModalProfessor
          titulo="Reserva confirmada"
          descricao="Compartilhe o token com os alunos da turma."
          icone="task_alt"
          closing={fechandoConfirmacao}
          onExitEnd={finalizarFechamentoConfirmacao}
          onClose={() => setReservaCriada(null)}
        >
          <div className={styles.confirmacaoReserva}>
            <p>
              <span>Equipamento</span>
              <strong>
                {reservaCriada.equipamento} · {reservaCriada.patrimonio}
              </strong>
            </p>
            <p>
              <span>Turma / atividade</span>
              <strong>
                {reservaCriada.turma} · {reservaCriada.atividade}
              </strong>
            </p>
            <p>
              <span>Data e horário</span>
              <strong>
                {formatarData(reservaCriada.data, {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · {reservaCriada.inicio}–{reservaCriada.fim}
              </strong>
            </p>
            <div className={styles.tokenConfirmacao}>
              <span>Token da turma</span>
              <strong>{reservaCriada.token}</strong>
              <small>Válido para esta reserva</small>
            </div>
            <p className={styles.avisoToken}>
              Compartilhe este token apenas com os alunos da turma. Ele
              identifica a reserva nas vistorias Tenken.
            </p>
            {erroToken && (
              <p className={styles.erroToken} role="alert">
                {erroToken}
              </p>
            )}
            <div className={styles.acoesConfirmacao}>
              <button type="button" onClick={() => setReservaCriada(null)}>
                Ver no calendário
              </button>
              <button
                type="button"
                className={styles.copiarToken}
                onClick={copiarToken}
              >
                {tokenCopiado ? "Token copiado" : "Copiar token"}
              </button>
            </div>
          </div>
        </ModalProfessor>
      )}

      {reservaDetalhe && (
        <ModalProfessor
          titulo={reservaDetalhe.atividade}
          descricao="Detalhes do agendamento."
          closing={fechandoDetalhe}
          onExitEnd={finalizarFechamentoDetalhe}
          onClose={() => setDetalheId(null)}
        >
          <div className={styles.detalhesReserva}>
            <p>
              <span>Data</span>
              <strong>
                {formatarData(reservaDetalhe.data, {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
            </p>
            <p>
              <span>Horário</span>
              <strong>
                {reservaDetalhe.inicio}–{reservaDetalhe.fim}
              </strong>
            </p>
            <p>
              <span>Turma / projeto</span>
              <strong>{reservaDetalhe.turma}</strong>
            </p>
            <p>
              <span>Equipamento</span>
              <strong>
                {reservaDetalhe.equipamento} · {reservaDetalhe.patrimonio}
              </strong>
            </p>
            {reservaDetalhe.token && (
              <p>
                <span>Token da turma</span>
                <strong>{reservaDetalhe.token}</strong>
              </p>
            )}
            <p>
              <span>Status</span>
              <strong>
                {rotulosStatus[reservaDetalhe.status] || reservaDetalhe.status}
              </strong>
            </p>
            <p>
              <span>Inspeção pré-uso</span>
              <strong>
                {rotuloInspecao(
                  preUsoDetalhe ||
                    (reservaDetalhe.preUsoResultado
                      ? { resultado: reservaDetalhe.preUsoResultado }
                      : null),
                )}
              </strong>
            </p>
          </div>
          <div className={styles.acoesDetalhe}>
            {reservaDetalhe.status === "CONFIRMADO" && (
              <button
                className={styles.botaoPerigo}
                type="button"
                onClick={executarAcaoReserva}
              >
                Cancelar reserva
              </button>
            )}
            <button type="button" onClick={() => setDetalheId(null)}>
              Fechar
            </button>
          </div>
        </ModalProfessor>
      )}
    </div>
  );
}
