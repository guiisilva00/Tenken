"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listarChamadosProfessor } from "../lib/professorApi";
import EmptyState from "@/components/EmptyState";
import styles from "./ChamadosProfessor.module.css";

const filtros = [
  ["EM_ANDAMENTO", "Em andamento"],
  ["CONCLUIDO", "Concluído"],
  ["TODOS", "Todos"],
];
const statusLabel = {
  ABERTO: "Em andamento",
  EM_ATENDIMENTO: "Em andamento",
  AGUARDANDO_PECAS: "Em andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};
const prioridadeLabel = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  CRITICA: "Crítica",
};
const resultadoLabel = {
  APROVADO: "Aprovada",
  APROVADO_COM_RESSALVAS: "Aprovada com ressalvas",
  REPROVADO: "Reprovada",
};
const etapaLabel = { PRE_USO: "Pré-uso", POS_USO: "Pós-uso" };

function formatarData(valor) {
  if (!valor) return "—";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return String(valor);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(data);
}

export default function ChamadosProfessor() {
  const [filtro, setFiltro] = useState("EM_ANDAMENTO");
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let montado = true;
    setCarregando(true);
    setErro("");
    const situacao = filtro === "TODOS" ? undefined : filtro;
    listarChamadosProfessor(situacao)
      .then((dados) => {
        if (montado) setChamados(dados);
      })
      .catch((e) => {
        if (montado)
          setErro(e.message || "Não foi possível carregar os chamados.");
      })
      .finally(() => {
        if (montado) setCarregando(false);
      });
    return () => {
      montado = false;
    };
  }, [filtro]);

  return (
    <div className={styles.container}>
      <header className={styles.cabecalho}>
        <div>
          <p className={styles.contexto}>ÁREA DO PROFESSOR</p>
          <h1>Chamados</h1>
          <p>
            Acompanhe os chamados associados às inspeções das suas reservas.
          </p>
        </div>
      </header>

      <section
        className={styles.painel}
        aria-labelledby="titulo-lista-chamados"
      >
        <div className={styles.cabecalhoPainel}>
          <div>
            <h2 id="titulo-lista-chamados">Meus chamados</h2>
            <p>O andamento é atualizado conforme o atendimento técnico.</p>
          </div>
          <span>
            {chamados.length} {chamados.length === 1 ? "chamado" : "chamados"}
          </span>
        </div>
        <div
          className={styles.filtros}
          role="group"
          aria-label="Filtrar chamados por situação"
        >
          {filtros.map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              aria-pressed={filtro === valor}
              className={filtro === valor ? styles.filtroAtivo : ""}
              onClick={() => setFiltro(valor)}
            >
              {rotulo}
            </button>
          ))}
        </div>

        {erro && (
          <p className={styles.erro} role="alert">
            {erro}
          </p>
        )}
        {carregando ? (
          <p className={styles.estado} role="status">
            Carregando chamados…
          </p>
        ) : chamados.length ? (
          <div className={styles.lista}>
            {chamados.map((chamado) => (
              <article
                className={styles.cartao}
                id={`chamado-${chamado.chamado_id}`}
                key={chamado.chamado_id}
              >
                <header className={styles.cabecalhoCartao}>
                  <div>
                    <p className={styles.identificador}>
                      CHAMADO #{chamado.chamado_id}
                    </p>
                    <h3>{chamado.equipamento_nome || chamado.titulo}</h3>
                    {chamado.equipamento_patrimonio && (
                      <span className={styles.patrimonio}>
                        Patrimônio {chamado.equipamento_patrimonio}
                      </span>
                    )}
                  </div>
                  <span
                    className={`${styles.status} ${styles[`status_${chamado.chamado_status}`] || ""}`}
                  >
                    <i />
                    {statusLabel[chamado.chamado_status] ||
                      chamado.chamado_status}
                  </span>
                </header>
                <div className={styles.metadados}>
                  <p>
                    <span>Aberto em</span>
                    <strong>{formatarData(chamado.aberto_em)}</strong>
                  </p>
                  <p>
                    <span>Prioridade</span>
                    <strong>
                      {prioridadeLabel[chamado.severidade] ||
                        chamado.severidade}
                    </strong>
                  </p>
                  <p>
                    <span>Solicitante</span>
                    <strong>{chamado.professor_nome || "Você"}</strong>
                  </p>
                </div>
                <section className={styles.descricao}>
                  <h4>Descrição do problema</h4>
                  <p>{chamado.chamado_descricao}</p>
                </section>
                {chamado.inspecao_id && (
                  <section className={styles.inspecao}>
                    <div>
                      <p className={styles.identificador}>
                        INSPEÇÃO #{chamado.inspecao_id}
                      </p>
                      <h4>
                        {chamado.equipamento_nome} ·{" "}
                        {etapaLabel[chamado.inspecao_etapa]}
                      </h4>
                      <p>
                        {formatarData(chamado.inspecao_realizada_em)} ·{" "}
                        {resultadoLabel[chamado.inspecao_resultado] ||
                          chamado.inspecao_resultado}
                      </p>
                      {chamado.inspecao_observacoes && (
                        <p className={styles.observacoes}>
                          Observações da inspeção:{" "}
                          {chamado.inspecao_observacoes}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/professor/inspecoes/registro/${chamado.inspecao_id}`}
                    >
                      Ver inspeção
                    </Link>
                  </section>
                )}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icone="support_agent"
            titulo="Nenhum chamado encontrado"
            mensagem={
              filtro === "TODOS"
                ? "Os chamados abertos por você aparecerão aqui."
                : `Não há chamados com situação “${filtros.find(([valor]) => valor === filtro)?.[1]}”.`
            }
          />
        )}
      </section>
    </div>
  );
}
