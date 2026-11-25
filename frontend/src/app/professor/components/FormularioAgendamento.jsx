"use client";

import { useEffect, useState } from "react";
import { listarEquipamentosIndisponiveis } from "../lib/professorApi";
import styles from "./FormularioAgendamento.module.css";

function dataLocalISO() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
}

function horarioLocal() {
  const agora = new Date();
  return `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;
}

function instanteLocal(data, horario) {
  const [ano, mes, dia] = data.split("-").map(Number);
  const [hora, minuto] = horario.split(":").map(Number);
  return new Date(ano, mes - 1, dia, hora, minuto, 0, 0);
}

export default function FormularioAgendamento({
  dataInicial,
  horarioInicial = "09:00",
  fimInicial = "10:00",
  equipamentoInicial = "",
  turmas,
  equipamentos,
  onCreate,
  onCancel,
}) {
  const [form, setForm] = useState({
    atividade: "",
    data: dataInicial,
    inicio: horarioInicial,
    fim: fimInicial,
    turmaId: "",
    equipamentoId: equipamentoInicial,
  });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [consultaAgenda, setConsultaAgenda] = useState({
    status: "idle",
    equipamentos: [],
  });

  useEffect(() => {
    const horarioValido =
      /^\d{2}:\d{2}$/.test(form.inicio) &&
      /^\d{2}:\d{2}$/.test(form.fim) &&
      form.fim > form.inicio;
    if (!form.data || !horarioValido) {
      setConsultaAgenda({ status: "idle", equipamentos: [] });
      return undefined;
    }

    let ativo = true;
    let consultando = false;
    const consultarDisponibilidade = async () => {
      if (
        !ativo ||
        consultando ||
        document.visibilityState !== "visible"
      )
        return;
      consultando = true;
      setConsultaAgenda((atual) => ({
        status: atual.status === "ready" ? "ready" : "loading",
        equipamentos: atual.equipamentos,
      }));
      try {
        const ids = await listarEquipamentosIndisponiveis({
          data: form.data,
          inicio: form.inicio,
          fim: form.fim,
        });
        if (ativo)
          setConsultaAgenda({ status: "ready", equipamentos: ids.map(Number) });
      } catch {
        if (ativo) setConsultaAgenda({ status: "error", equipamentos: [] });
      } finally {
        consultando = false;
      }
    };

    consultarDisponibilidade();
    const intervalo = window.setInterval(consultarDisponibilidade, 5000);
    const aoFocar = () => consultarDisponibilidade();
    const aoTornarVisivel = () => {
      if (document.visibilityState === "visible") consultarDisponibilidade();
    };
    window.addEventListener("focus", aoFocar);
    document.addEventListener("visibilitychange", aoTornarVisivel);
    return () => {
      ativo = false;
      window.clearInterval(intervalo);
      window.removeEventListener("focus", aoFocar);
      document.removeEventListener("visibilitychange", aoTornarVisivel);
    };
  }, [form.data, form.inicio, form.fim]);

  function equipamentoOcupado(equipamento) {
    return (
      ["EM_MANUTENCAO", "INATIVO"].includes(equipamento.status) ||
      consultaAgenda.equipamentos.includes(Number(equipamento.id))
    );
  }

  const consultaPendente = ["idle", "loading", "error"].includes(
    consultaAgenda.status,
  );

  function alterar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    if (["data", "inicio", "fim"].includes(campo)) {
      setConsultaAgenda({ status: "idle", equipamentos: [] });
    }
    setErro("");
  }

  async function enviar(evento) {
    evento.preventDefault();

    if (
      !form.atividade.trim() ||
      !form.data ||
      !form.inicio ||
      !form.fim ||
      !form.turmaId ||
      !form.equipamentoId
    ) {
      setErro("Preencha todos os campos para continuar.");
      return;
    }

    if (form.data < dataLocalISO()) {
      setErro("A data do agendamento deve ser hoje ou uma data futura.");
      return;
    }

    if (instanteLocal(form.data, form.inicio) <= new Date()) {
      setErro("O início do agendamento precisa ser um horário futuro.");
      return;
    }

    if (form.fim <= form.inicio) {
      setErro("O horário de término precisa ser depois do início.");
      return;
    }

    if (consultaAgenda.status === "loading" || consultaAgenda.status === "idle") {
      setErro("Aguarde a consulta de disponibilidade para este hor\u00e1rio.");
      return;
    }
    if (consultaAgenda.status === "error") {
      setErro("N\u00e3o foi poss\u00edvel consultar a disponibilidade. Tente novamente.");
      return;
    }
    if (consultaAgenda.equipamentos.includes(Number(form.equipamentoId))) {
      setErro("Este equipamento est\u00e1 indispon\u00edvel nesse hor\u00e1rio.");
      return;
    }

    setEnviando(true);

    try {
      const resultado = await onCreate({
        ...form,
        turmaId: Number(form.turmaId),
        equipamentoId: Number(form.equipamentoId),
        atividade: form.atividade.trim(),
      });

      if (!resultado.ok) {
        setErro(resultado.message);
        return;
      }

      onCancel();
    } catch (falha) {
      setErro(falha.message || "Não foi possível criar o agendamento.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className={styles.formulario} onSubmit={enviar} noValidate>
      <label className={styles.campo} htmlFor="atividade-reserva">
        <span>Atividade</span>
        <input
          id="atividade-reserva"
          value={form.atividade}
          onChange={(evento) => alterar("atividade", evento.target.value)}
          maxLength={120}
          placeholder="Ex.: Prática de robótica"
          autoFocus
        />
      </label>

      <label className={styles.campo} htmlFor="turma-reserva">
        <span>Turma ou projeto</span>
        <select
          id="turma-reserva"
          value={form.turmaId}
          onChange={(evento) => alterar("turmaId", evento.target.value)}
        >
          <option value="">Selecione uma turma</option>
          {turmas.map((turma) => (
            <option key={turma.id} value={turma.id}>
              {turma.nome}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.campo} htmlFor="equipamento-reserva">
        <span>Equipamento</span>
        <select
          id="equipamento-reserva"
          value={form.equipamentoId}
          onChange={(evento) => alterar("equipamentoId", evento.target.value)}
        >
          <option value="">Selecione um equipamento</option>
          {equipamentos.map((equipamento) => (
            <option
              key={equipamento.id}
              value={equipamento.id}
              disabled={consultaPendente || equipamentoOcupado(equipamento)}
            >
              {equipamento.nome}
              {equipamentoOcupado(equipamento)
                ? " · indisponível"
                : consultaAgenda.status === "error"
                  ? " · disponibilidade não verificada"
                  : consultaPendente
                    ? " · verificando disponibilidade"
                    : ""}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.campo} htmlFor="data-reserva">
        <span>Data</span>
        <input
          id="data-reserva"
          type="date"
          min={dataLocalISO()}
          value={form.data}
          onChange={(evento) => alterar("data", evento.target.value)}
        />
      </label>

      <div className={styles.horarios}>
        <label className={styles.campo} htmlFor="inicio-reserva">
          <span>Início</span>
          <input
            id="inicio-reserva"
            type="time"
            min={form.data === dataLocalISO() ? horarioLocal() : undefined}
            value={form.inicio}
            onChange={(evento) => alterar("inicio", evento.target.value)}
          />
        </label>

        <label className={styles.campo} htmlFor="fim-reserva">
          <span>Término</span>
          <input
            id="fim-reserva"
            type="time"
            value={form.fim}
            onChange={(evento) => alterar("fim", evento.target.value)}
          />
        </label>
      </div>

      {consultaAgenda.status === "loading" && (
        <p className={styles.aviso} role="status">
          {"Consultando disponibilidade para esse hor\u00e1rio..."}
        </p>
      )}
      {consultaAgenda.status === "error" && (
        <p className={styles.erro} role="alert">
          {"N\u00e3o foi poss\u00edvel consultar a disponibilidade. Tente novamente."}
        </p>
      )}
      {erro && (
        <p className={styles.erro} role="alert">
          {erro}
        </p>
      )}

      <div className={styles.acoes}>
        <button
          className={styles.secundario}
          type="button"
          onClick={onCancel}
          disabled={enviando}
        >
          Voltar
        </button>

        <button
          className={styles.primario}
          type="submit"
          disabled={
            enviando ||
            consultaAgenda.status !== "ready" ||
            (consultaAgenda.status === "ready" &&
              consultaAgenda.equipamentos.includes(Number(form.equipamentoId)))
          }
        >
          {enviando ? "Salvando…" : "Criar agendamento"}
        </button>
      </div>
    </form>
  );
}
