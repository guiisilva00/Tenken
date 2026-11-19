"use client";

import { useState } from "react";
import styles from "./FormularioAgendamento.module.css";

function dataLocalISO() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
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

  function alterar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
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
              disabled={["EM_MANUTENCAO", "INATIVO"].includes(
                equipamento.status,
              )}
            >
              {equipamento.nome}
              {["EM_MANUTENCAO", "INATIVO"].includes(equipamento.status)
                ? " · indisponível"
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
        <button className={styles.primario} type="submit" disabled={enviando}>
          {enviando ? "Salvando…" : "Criar agendamento"}
        </button>
      </div>
    </form>
  );
}
