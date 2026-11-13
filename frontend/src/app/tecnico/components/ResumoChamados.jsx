import styles from "./ResumoChamados.module.css";
import EmptyState from "@/components/EmptyState";

const STATUS = [
  { chave: "ABERTO", rotulo: "Abertos", tom: "aberto" },
  { chave: "EM_ATENDIMENTO", rotulo: "Em atendimento", tom: "atendimento" },
  { chave: "CONCLUIDO", rotulo: "Concluídos", tom: "concluido" },
];

const PRIORIDADES = [
  { chave: "CRITICA", rotulo: "Crítica", tom: "critica" },
  { chave: "ALTA", rotulo: "Alta", tom: "alta" },
  { chave: "MEDIA", rotulo: "Média", tom: "media" },
  { chave: "BAIXA", rotulo: "Baixa", tom: "baixa" },
];

const CATEGORIAS_EQUIPAMENTO = [
  { chave: "BANCADA", rotulo: "Bancadas" },
  { chave: "ROBO", rotulo: "Robôs" },
];

const STATUS_EQUIPAMENTO = [
  { chave: "DISPONIVEL", rotulo: "Disponíveis", tom: "disponivel" },
  { chave: "RESERVADO", rotulo: "Reservados", tom: "reservado" },
  { chave: "EM_USO", rotulo: "Em uso", tom: "emUso" },
  { chave: "EM_MANUTENCAO", rotulo: "Em manutenção", tom: "manutencao" },
  { chave: "INATIVO", rotulo: "Inativos", tom: "inativo" },
];

function quantidadePorChave(itens, chave, valor) {
  if (!Array.isArray(itens)) return 0;
  return Number(itens.find((item) => item[chave] === valor)?.total ?? 0);
}

export default function ResumoChamados({ porStatus, porPrioridade, porCategoria, carregando }) {
  const totalStatus = STATUS.reduce((total, item) => total + quantidadePorChave(porStatus, "status", item.chave), 0);
  const totalPrioridade = PRIORIDADES.reduce((total, item) => total + quantidadePorChave(porPrioridade, "severidade", item.chave), 0);

  return (
    <section className={styles.grade} aria-label="Distribuição dos chamados">
      <article className={styles.painel}>
        <header className={styles.cabecalho}>
          <div>
            <p className={styles.sobretitulo}>Fluxo de trabalho</p>
            <h2 className={styles.titulo}>Chamados por status</h2>
          </div>
          <span className={`material-symbols-outlined ${styles.icone}`} aria-hidden="true">monitoring</span>
        </header>
        {totalStatus === 0 ? (
          carregando ? (
            <p className={styles.estadoVazio}>Carregando distribuição…</p>
          ) : (
            <EmptyState icone="inbox" titulo="Nenhum chamado no seu fluxo" mensagem="Quando houver chamados atribuídos a você, eles aparecem aqui." />
          )
        ) : (
          <div className={styles.lista}>
            {STATUS.map((item) => {
              const quantidade = quantidadePorChave(porStatus, "status", item.chave);
              const percentual = (quantidade / totalStatus) * 100;
              return (
                <div className={styles.linha} key={item.chave}>
                  <div className={styles.rotuloLinha}>
                    <span className={`${styles.ponto} ${styles[item.tom]}`} />
                    <span>{item.rotulo}</span>
                    <strong>{quantidade}</strong>
                  </div>
                  <div className={styles.trilho} aria-label={`${item.rotulo}: ${quantidade}`}>
                    <span className={`${styles.preenchimento} ${styles[item.tom]}`} style={{ width: `${percentual}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className={styles.rodape}>{carregando ? "Atualizando dados" : `${totalStatus} chamados no seu fluxo`}</p>
      </article>

      <article className={styles.painel}>
        <header className={styles.cabecalho}>
          <div>
            <p className={styles.sobretitulo}>Ordem de atendimento</p>
            <h2 className={styles.titulo}>Chamados em aberto por prioridade</h2>
          </div>
          <span className={`material-symbols-outlined ${styles.icone}`} aria-hidden="true">priority_high</span>
        </header>
        {totalPrioridade === 0 ? (
          carregando ? (
            <p className={styles.estadoVazio}>Carregando prioridades…</p>
          ) : (
            <EmptyState icone="task_alt" titulo="Nenhum chamado em aberto" mensagem="Não há chamados aguardando atendimento no momento." />
          )
        ) : (
          <div className={styles.lista}>
            {PRIORIDADES.map((item) => {
              const quantidade = quantidadePorChave(porPrioridade, "severidade", item.chave);
              const percentual = (quantidade / totalPrioridade) * 100;
              return (
                <div className={styles.linha} key={item.chave}>
                  <div className={styles.rotuloLinha}>
                    <span className={`${styles.ponto} ${styles[item.tom]}`} />
                    <span>{item.rotulo}</span>
                    <strong>{quantidade}</strong>
                  </div>
                  <div className={styles.trilho} aria-label={`${item.rotulo}: ${quantidade}`}>
                    <span className={`${styles.preenchimento} ${styles[item.tom]}`} style={{ width: `${percentual}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className={styles.rodape}>{carregando ? "Atualizando dados" : `${totalPrioridade} chamados aguardam atendimento`}</p>
      </article>

      <article className={`${styles.painel} ${styles.painelCategorias}`}>
        <header className={styles.cabecalho}>
          <div>
            <p className={styles.sobretitulo}>Condição dos ativos</p>
            <h2 className={styles.titulo}>Equipamentos por categoria</h2>
          </div>
          <span className={`material-symbols-outlined ${styles.icone}`} aria-hidden="true">precision_manufacturing</span>
        </header>
        <div className={styles.categorias}>
          {CATEGORIAS_EQUIPAMENTO.map((categoria) => {
            const dadosCategoria = porCategoria?.find((item) => item.tipo === categoria.chave);
            const total = STATUS_EQUIPAMENTO.reduce((soma, item) => soma + quantidadePorChave(dadosCategoria?.por_status, "status", item.chave), 0);
            return (
              <section className={styles.categoria} key={categoria.chave}>
                <div className={styles.tituloCategoria}><strong>{categoria.rotulo}</strong><span>{total} {total === 1 ? "equipamento" : "equipamentos"}</span></div>
                {total === 0 ? (
                  <p className={styles.estadoCategoria}>{carregando ? "Carregando…" : "Nenhum equipamento cadastrado"}</p>
                ) : (
                  <div className={styles.lista}>
                    {STATUS_EQUIPAMENTO.map((item) => {
                      const quantidade = quantidadePorChave(dadosCategoria?.por_status, "status", item.chave);
                      return (
                        <div className={styles.linha} key={item.chave}>
                          <div className={styles.rotuloLinha}>
                            <span className={`${styles.ponto} ${styles[item.tom]}`} />
                            <span>{item.rotulo}</span><strong>{quantidade}</strong>
                          </div>
                          <div className={styles.trilho} aria-label={`${categoria.rotulo} ${item.rotulo}: ${quantidade}`}>
                            <span className={`${styles.preenchimento} ${styles[item.tom]}`} style={{ width: `${(quantidade / total) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
        <p className={styles.rodape}>{carregando ? "Atualizando dados" : "Status atual do inventário do laboratório"}</p>
      </article>
    </section>
  );
}
