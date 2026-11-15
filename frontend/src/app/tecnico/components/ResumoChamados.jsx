import styles from "./ResumoChamados.module.css";
import EmptyState from "@/components/EmptyState";

const STATUS = [
  { chave: "ABERTO", rotulo: "Abertos", tom: "aberto" },
  { chave: "EM_ATENDIMENTO", rotulo: "Em atendimento", tom: "atendimento" },
  { chave: "AGUARDANDO_PECAS", rotulo: "Aguardando peças", tom: "pecas" },
  { chave: "CONCLUIDO", rotulo: "Concluídos", tom: "concluido" },
  { chave: "CANCELADO", rotulo: "Cancelados", tom: "cancelado" },
];

const PRIORIDADES = [
  { chave: "CRITICA", rotulo: "Crítica", tom: "critica" },
  { chave: "ALTA", rotulo: "Alta", tom: "alta" },
  { chave: "MEDIA", rotulo: "Média", tom: "media" },
  { chave: "BAIXA", rotulo: "Baixa", tom: "baixa" },
];

function quantidadePorChave(itens, chave, valor) {
  if (!Array.isArray(itens)) return 0;
  const normalizar = (texto) =>
    String(texto ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toUpperCase();
  const item = itens.find(
    (linha) => normalizar(linha[chave]) === normalizar(valor),
  );
  return Number(item?.total ?? item?.quantidade ?? item?.count ?? 0);
}

export default function ResumoChamados({
  porStatus,
  porPrioridade,
  carregando,
}) {
  const totalStatus = STATUS.reduce(
    (total, item) =>
      total + quantidadePorChave(porStatus, "status", item.chave),
    0,
  );
  const totalPrioridade = PRIORIDADES.reduce(
    (total, item) =>
      total + quantidadePorChave(porPrioridade, "severidade", item.chave),
    0,
  );

  return (
    <section className={styles.grade} aria-label="Distribuição dos chamados">
      <article className={styles.painel}>
        <header className={styles.cabecalho}>
          <div>
            <p className={styles.sobretitulo}>Fluxo de trabalho</p>
            <h2 className={styles.titulo}>Chamados por status</h2>
          </div>
          <span
            className={`material-symbols-outlined ${styles.icone}`}
            aria-hidden="true"
          >
            monitoring
          </span>
        </header>
        {totalStatus === 0 ? (
          carregando ? (
            <p className={styles.estadoVazio}>Carregando distribuição…</p>
          ) : (
            <EmptyState
              icone="inbox"
              titulo="Nenhum chamado no seu fluxo"
              mensagem="Quando houver chamados atribuídos a você, eles aparecem aqui."
            />
          )
        ) : (
          <div className={styles.lista}>
            {STATUS.map((item) => {
              const quantidade = quantidadePorChave(
                porStatus,
                "status",
                item.chave,
              );
              const percentual = (quantidade / totalStatus) * 100;
              return (
                <div className={styles.linha} key={item.chave}>
                  <div className={styles.rotuloLinha}>
                    <span className={`${styles.ponto} ${styles[item.tom]}`} />
                    <span>{item.rotulo}</span>
                    <strong>{quantidade}</strong>
                  </div>
                  <div
                    className={styles.trilho}
                    aria-label={`${item.rotulo}: ${quantidade}`}
                  >
                    <span
                      className={`${styles.preenchimento} ${styles[item.tom]}`}
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className={styles.rodape}>
          {carregando
            ? "Atualizando dados"
            : `${totalStatus} chamados no seu fluxo`}
        </p>
      </article>

      <article className={styles.painel}>
        <header className={styles.cabecalho}>
          <div>
            <p className={styles.sobretitulo}>Ordem de atendimento</p>
            <h2 className={styles.titulo}>Chamados em aberto por prioridade</h2>
          </div>
          <span
            className={`material-symbols-outlined ${styles.icone}`}
            aria-hidden="true"
          >
            priority_high
          </span>
        </header>
        {totalPrioridade === 0 ? (
          carregando ? (
            <p className={styles.estadoVazio}>Carregando prioridades…</p>
          ) : (
            <EmptyState
              icone="task_alt"
              titulo="Nenhum chamado em aberto"
              mensagem="Não há chamados aguardando atendimento no momento."
            />
          )
        ) : (
          <div className={styles.lista}>
            {PRIORIDADES.map((item) => {
              const quantidade = quantidadePorChave(
                porPrioridade,
                "severidade",
                item.chave,
              );
              const percentual = (quantidade / totalPrioridade) * 100;
              return (
                <div className={styles.linha} key={item.chave}>
                  <div className={styles.rotuloLinha}>
                    <span className={`${styles.ponto} ${styles[item.tom]}`} />
                    <span>{item.rotulo}</span>
                    <strong>{quantidade}</strong>
                  </div>
                  <div
                    className={styles.trilho}
                    aria-label={`${item.rotulo}: ${quantidade}`}
                  >
                    <span
                      className={`${styles.preenchimento} ${styles[item.tom]}`}
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className={styles.rodape}>
          {carregando
            ? "Atualizando dados"
            : `${totalPrioridade} chamados em aberto`}
        </p>
      </article>
    </section>
  );
}
