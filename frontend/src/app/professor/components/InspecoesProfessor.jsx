"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listarInspecoes } from "../lib/professorApi";
import EmptyState from "@/components/EmptyState";
import styles from "./InspecoesProfessor.module.css";

const etapas = { PRE_USO: "Pré-uso", POS_USO: "Pós-uso" };
const resultados = {
  APROVADO: "Aprovada",
  APROVADO_COM_RESSALVAS: "Aprovada com ressalvas",
  REPROVADO: "Reprovada",
};
const filtros = [
  ["TODAS", "Todas"],
  ["PENDENTES", "Pendentes"],
  ["REALIZADAS", "Realizadas"],
];

export default function InspecoesProfessor() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [filtro, setFiltro] = useState("TODAS");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    listarInspecoes()
      .then(setItems)
      .catch((e) =>
        setErro(e.message || "Não foi possível carregar as inspeções."),
      )
      .finally(() => setCarregando(false));
  }, []);

  const visiveis = items.filter(
    (i) =>
      filtro === "TODAS" ||
      (filtro === "PENDENTES" && !i.resultado) ||
      (filtro === "REALIZADAS" && i.resultado),
  );
  const estadoClass = (resultado) =>
    resultado === "REPROVADO"
      ? styles.resultadoReprovado
      : resultado === "APROVADO_COM_RESSALVAS"
        ? styles.resultadoRessalva
        : resultado === "APROVADO"
          ? styles.resultadoRealizado
          : styles.resultadoPendente;

  return (
    <div className={styles.container}>
      <header className={styles.cabecalhoPagina}>
        <div>
          <p className={styles.contexto}>ÁREA DO PROFESSOR</p>
          <h1>Inspeções</h1>
          <p className={styles.subtitulo}>
            Acompanhe as vistorias pré e pós-uso das reservas das suas turmas.
          </p>
        </div>
      </header>
      <section className={styles.resumo} aria-label="Resumo das inspeções">
        <article className={`${styles.metrica} ${styles.metricaPendente}`}>
          <span>Aguardando realização</span>
          <strong>{items.filter((i) => !i.resultado).length}</strong>
          <small>Etapas pendentes</small>
        </article>
        <article className={styles.metrica}>
          <span>Inspeções realizadas</span>
          <strong>{items.filter((i) => i.resultado).length}</strong>
          <small>Pré e pós-uso concluídos</small>
        </article>
        <article className={`${styles.metrica} ${styles.metricaRessalva}`}>
          <span>Aprovadas com ressalvas</span>
          <strong>
            {
              items.filter((i) => i.resultado === "APROVADO_COM_RESSALVAS")
                .length
            }
          </strong>
          <small>Requerem acompanhamento</small>
        </article>
      </section>
      <section className={styles.painel}>
        <div className={styles.cabecalhoPainel}>
          <div>
            <h2>Inspeções das reservas</h2>
            <p>
              Consulte o estado de cada etapa ou registre uma nova vistoria.
            </p>
          </div>
          <span className={styles.contagem}>
            {visiveis.length} {visiveis.length === 1 ? "registro" : "registros"}
          </span>
        </div>
        <div
          className={styles.filtros}
          role="group"
          aria-label="Filtrar inspeções"
        >
          {filtros.map(([v, l]) => (
            <button
              type="button"
              key={v}
              className={filtro === v ? styles.filtroAtivo : ""}
              aria-pressed={filtro === v}
              onClick={() => setFiltro(v)}
            >
              {l}
            </button>
          ))}
        </div>
        {erro && (
          <p role="alert" className={styles.erroLista}>
            {erro}
          </p>
        )}
        {carregando ? (
          <div className={styles.estadoVazio}>
            <p>Carregando inspeções…</p>
          </div>
        ) : visiveis.length ? (
          <div className={styles.tabelaViewport}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Reserva</th>
                  <th>Turma</th>
                  <th>Etapa</th>
                  <th>Checklist</th>
                  <th>Resultado</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((i) => (
                  <tr key={`${i.agendamentoId}-${i.etapa}`}>
                    <td>
                      <strong>
                        {i.data} · {i.horario}
                      </strong>
                      <span>{i.equipamento}</span>
                    </td>
                    <td>{i.turma}</td>
                    <td>
                      <span className={styles.etapa}>{etapas[i.etapa]}</span>
                    </td>
                    <td>{i.modelo}</td>
                    <td>
                      <span
                        className={`${styles.resultado} ${estadoClass(i.resultado)}`}
                      >
                        {resultados[i.resultado] || "Pendente"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.botaoAcao}
                        onClick={() =>
                          router.push(
                            i.resultado
                              ? `/professor/inspecoes/registro/${i.id}`
                              : `/professor/inspecoes/${i.agendamentoId}/${i.etapa}`,
                          )
                        }
                      >
                        {i.resultado ? "Ver detalhes" : "Iniciar inspeção"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icone="fact_check"
            titulo="Nenhuma inspeção encontrada"
            mensagem={
              items.length
                ? "Altere o filtro para consultar outros registros."
                : "As inspeções das reservas das suas turmas aparecerão aqui."
            }
          />
        )}
        <p className={styles.notaDados}>
          Os registros são carregados das inspeções e reservas vinculadas à sua
          conta.
        </p>
      </section>
    </div>
  );
}
