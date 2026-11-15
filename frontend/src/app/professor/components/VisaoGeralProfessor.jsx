"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  listarAgendamentos,
  listarEquipamentos,
  listarInspecoes,
  listarTurmas,
} from "../lib/professorApi";
import { getUsuario } from "@/lib/session";
import { dataPorExtenso, saudacaoPorHorario } from "@/lib/saudacao";
import {
  percentualEquipamentos,
  resumirEquipamentos,
} from "../lib/resumoProfessor";
import styles from "./VisaoGeralProfessor.module.css";

function dataLocalISO() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
}

function rotuloStatus(status) {
  if (status === "EM_ANDAMENTO") return "Em andamento";
  if (status === "CONCLUIDO") return "Concluído";
  return "Confirmado";
}

export default function VisaoGeralProfessor() {
  const [dados, setDados] = useState({
    professora: getUsuario(),
    agendamentos: [],
    equipamentos: [],
    inspecoes: [],
    turmas: [],
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  useEffect(() => {
    let ativo = true;
    Promise.all([
      listarAgendamentos(),
      listarEquipamentos(),
      listarInspecoes(),
      listarTurmas(),
    ])
      .then(([agendamentos, equipamentos, inspecoes, turmas]) => {
        if (ativo)
          setDados((atual) => ({
            ...atual,
            agendamentos,
            equipamentos,
            inspecoes,
            turmas,
          }));
      })
      .catch((error) => {
        if (ativo)
          setErro(
            error.message ||
              "Não foi possível carregar os dados do laboratório.",
          );
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);
  const resumoEquipamentos = resumirEquipamentos(dados.equipamentos);
  const primeiroNome = dados.professora?.nome?.split(" ")[0] || "professor";
  const hoje = new Date();
  const hojeISO = dataLocalISO();
  const dataFormatada = dataPorExtenso(hoje);
  const saudacao = saudacaoPorHorario(hoje);

  const reservasHoje = dados.agendamentos
    .filter((item) => item.data === hojeISO && item.status !== "CANCELADO")
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
  const pendencias = dados.inspecoes
    .filter((item) => !item.resultado && !item.cancelada)
    .sort((a, b) =>
      `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`),
    );

  const metricas = [
    {
      rotulo: "Agendamentos hoje",
      valor: reservasHoje.length,
      detalhe: `${reservasHoje.filter((item) => item.status === "CONFIRMADO").length} confirmados · ${reservasHoje.filter((item) => item.status === "EM_ANDAMENTO").length} em andamento`,
      icone: "calendar_month",
    },
    {
      rotulo: "Inspeções pendentes",
      valor: pendencias.length,
      detalhe: pendencias.length ? "Ação necessária" : "Tudo em dia",
      icone: "fact_check",
      alerta: pendencias.length > 0,
    },
    {
      rotulo: "Turmas e projetos",
      valor: dados.turmas.length,
      detalhe: "Vínculos cadastrados",
      icone: "groups",
    },
    {
      rotulo: "Equipamentos disponíveis",
      valor: `${resumoEquipamentos.disponiveis} / ${resumoEquipamentos.total}`,
      detalhe: `${resumoEquipamentos.emUso} em uso · ${resumoEquipamentos.emManutencao} em manutenção`,
      icone: "precision_manufacturing",
    },
  ];

  const primeiraPendencia = pendencias[0];

  if (carregando || erro) {
    return (
      <div className={styles.container}>
        <p className={styles.subtitulo} role={carregando ? "status" : "alert"}>
          {carregando ? "Carregando dados do laboratório…" : erro}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <section
        className={styles.introducao}
        aria-labelledby="titulo-visao-professor"
      >
        <div>
          <p className={styles.dataHoje}>{dataFormatada}</p>
          <h1 id="titulo-visao-professor">
            {saudacao}, {primeiroNome}.
          </h1>
          <p className={styles.subtitulo}>Resumo do laboratório para hoje.</p>
        </div>
      </section>

      <section
        className={styles.indicadores}
        aria-label="Resumo do laboratório"
      >
        {metricas.map((item, indice) => (
          <article
            className={`${styles.indicador} ${item.alerta ? styles.indicadorAlerta : ""} tenken-entrada`}
            style={{ animationDelay: `${indice * 0.05}s` }}
            key={item.rotulo}
          >
            <div className={styles.indicadorTopo}>
              <h2>{item.rotulo}</h2>
              <span
                className={`material-symbols-outlined ${styles.indicadorIcone}`}
                aria-hidden="true"
              >
                {item.icone}
              </span>
            </div>
            <strong className={styles.indicadorValor}>{item.valor}</strong>
            <p>{item.detalhe}</p>
          </article>
        ))}
      </section>

      <div className={styles.gradePrincipal}>
        <section className={styles.painel} aria-labelledby="titulo-agenda">
          <div className={styles.cabecalhoPainel}>
            <div>
              <p className={styles.rotuloSecao}>ACOMPANHAMENTO</p>
              <h2 id="titulo-agenda">Agenda de hoje</h2>
            </div>
            <Link
              className={styles.linkPendente}
              href="/professor/agendamentos"
            >
              Ver agenda completa <span aria-hidden="true">→</span>
            </Link>
          </div>
          {reservasHoje.length ? (
            <div className={styles.listaAgenda}>
              {reservasHoje.slice(0, 4).map((item) => {
                const equipamento = dados.equipamentos.find(
                  (registro) => registro.id === item.equipamentoId,
                );
                const turma = dados.turmas.find(
                  (registro) => registro.id === item.turmaId,
                );
                const inspeccaoPendente = dados.inspecoes.some(
                  (registro) =>
                    registro.agendamentoId === item.id &&
                    !registro.resultado &&
                    registro.etapa === "PRE_USO",
                );
                return (
                  <article
                    className={`${styles.itemAgenda} ${item.status === "EM_ANDAMENTO" ? styles.itemAgendaAtual : ""}`}
                    key={item.id}
                  >
                    <div className={styles.horario}>
                      <strong>{item.inicio}</strong>
                      <span>{item.fim}</span>
                    </div>
                    <span
                      className={styles.marcadorHorario}
                      aria-hidden="true"
                    />
                    <div className={styles.detalhesAgenda}>
                      <div className={styles.linhaTituloAgenda}>
                        <h3>{item.atividade}</h3>
                        <span
                          className={`${styles.estado} ${item.status === "EM_ANDAMENTO" ? styles.estadoAtual : ""}`}
                        >
                          {rotuloStatus(item.status)}
                        </span>
                      </div>
                      <p>
                        {equipamento?.nome || item.equipamento}
                        <span>·</span>
                        {turma?.nome || item.turma}
                      </p>
                      {inspeccaoPendente && (
                        <p className={styles.pendencia}>
                          <span aria-hidden="true">!</span>Inspeção pré-uso
                          pendente
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.vazioResumo}>
              <p>Nenhum agendamento para hoje.</p>
              <Link href="/professor/agendamentos">Consultar agenda</Link>
            </div>
          )}
          <p className={styles.notaRodape}>
            Horários exibidos no fuso local do laboratório.
          </p>
        </section>

        <section
          className={styles.painelAtencao}
          aria-labelledby="titulo-atencao"
        >
          <div className={styles.cabecalhoPainel}>
            <div>
              <p className={styles.rotuloSecao}>PRÓXIMO PASSO</p>
              <h2 id="titulo-atencao">Precisa da sua atenção</h2>
            </div>
            <span className={styles.contadorAtencao}>
              {String(pendencias.length).padStart(2, "0")}
            </span>
          </div>
          {primeiraPendencia ? (
            <article className={styles.cartaoAtencao}>
              <div className={styles.linhaAtencao}>
                <span>!</span>
                <strong>PENDENTE</strong>
              </div>
              <h3>
                Inspeção{" "}
                {primeiraPendencia.etapa === "PRE_USO" ? "pré-uso" : "pós-uso"}
              </h3>
              <p>{primeiraPendencia.equipamento}</p>
              <small>
                {primeiraPendencia.data} · {primeiraPendencia.horario} ·{" "}
                {primeiraPendencia.turma}
              </small>
              <Link href="/professor/inspecoes">
                Abrir inspeções <span aria-hidden="true">→</span>
              </Link>
            </article>
          ) : (
            <div className={styles.semPendencias}>
              <span className="material-symbols-outlined" aria-hidden="true">
                task_alt
              </span>
              <p>Nenhuma inspeção pendente.</p>
            </div>
          )}
          <p className={styles.dicaAtencao}>
            As vistorias registram as condições do equipamento antes e depois do
            uso.
          </p>
        </section>
      </div>

      <div className={styles.gradeSecundaria}>
        <section className={styles.painel} aria-labelledby="titulo-turmas">
          <div className={styles.cabecalhoPainel}>
            <div>
              <p className={styles.rotuloSecao}>GRUPOS VINCULADOS</p>
              <h2 id="titulo-turmas">Minhas turmas</h2>
            </div>
            <Link className={styles.linkPendente} href="/professor/turmas">
              Todas as turmas <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className={styles.listaTurmas}>
            {dados.turmas.length ? (
              dados.turmas.slice(0, 4).map((turma) => (
                <div className={styles.itemTurma} key={turma.id}>
                  <span className={styles.siglaTurma}>
                    {turma.nome.slice(0, 1)}
                  </span>
                  <div>
                    <strong>{turma.nome}</strong>
                    <span>{turma.alunos} alunos vinculados</span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.vazioResumo}>
                <p>Nenhuma turma vinculada.</p>
              </div>
            )}
          </div>
        </section>

        <section
          className={styles.painel}
          aria-labelledby="titulo-equipamentos"
        >
          <div className={styles.cabecalhoPainel}>
            <div>
              <p className={styles.rotuloSecao}>VISÃO DO LABORATÓRIO</p>
              <h2 id="titulo-equipamentos">Equipamentos</h2>
            </div>
            <Link
              className={styles.linkPendente}
              href="/professor/equipamentos"
            >
              Ver todos <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className={styles.resumoEquipamentos}>
            <strong>
              {resumoEquipamentos.disponiveis}{" "}
              <span>disponíveis de {resumoEquipamentos.total}</span>
            </strong>
            <div
              className={styles.barraDisponibilidade}
              role="img"
              aria-label="Disponibilidade atual dos equipamentos"
            >
              <span
                className={styles.disponivel}
                style={{
                  width: `${percentualEquipamentos(resumoEquipamentos.disponiveis, resumoEquipamentos.total)}%`,
                }}
              />
              <span
                className={styles.emUso}
                style={{
                  width: `${percentualEquipamentos(resumoEquipamentos.emUso, resumoEquipamentos.total)}%`,
                }}
              />
              <span
                className={styles.manutencao}
                style={{
                  width: `${percentualEquipamentos(resumoEquipamentos.emManutencao, resumoEquipamentos.total)}%`,
                }}
              />
            </div>
            <div className={styles.legendaEquipamentos}>
              <span>
                <i className={styles.pontoDisponivel} />
                Disponíveis <strong>{resumoEquipamentos.disponiveis}</strong>
              </span>
              <span>
                <i className={styles.pontoUso} />
                Em uso <strong>{resumoEquipamentos.emUso}</strong>
              </span>
              <span>
                <i className={styles.pontoManutencao} />
                Manutenção <strong>{resumoEquipamentos.emManutencao}</strong>
              </span>
            </div>
          </div>
          {resumoEquipamentos.primeiroEmUso && (
            <p className={styles.avisoEquipamento}>
              <i />
              {resumoEquipamentos.primeiroEmUso.nome} está em uso.
            </p>
          )}
          {resumoEquipamentos.total === 0 && (
            <p className={styles.avisoEquipamento}>
              Nenhum equipamento cadastrado.
            </p>
          )}
        </section>
      </div>

      <footer className={styles.rodape}>
        Tenken 点検 · Os dados serão exibidos quando cadastrados no sistema.
      </footer>
    </div>
  );
}
