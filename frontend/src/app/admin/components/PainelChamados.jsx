import {
  formatarPercentual,
  nomeItem,
  valorItem,
  somarTotais,
} from "../lib/formatadores";
import styles from "./PainelChamados.module.css";

export default function PainelChamados({
  porStatus,
  porSeveridade,
  carregando,
}) {
  const status = Array.isArray(porStatus) ? porStatus : [];
  const severidade = Array.isArray(porSeveridade) ? porSeveridade : [];
  const totalStatus = somarTotais(status);
  const totalSeveridade = somarTotais(severidade);

  return (
    <section className={styles.painel}>
      <div className={styles.cabecalho}>
        <span className={styles.titulo}>Chamados</span>
        <span className={styles.subtitulo}>Chamados por situação</span>
      </div>

      {status.length === 0 ? (
        <p className={styles.vazio}>
          {carregando
            ? "Carregando chamados…"
            : "Não há chamados para mostrar."}
        </p>
      ) : (
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Quantidade</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {status.map((item, index) => (
              <tr key={nomeItem(item, index)}>
                <td>{nomeItem(item, index)}</td>
                <td>{valorItem(item)}</td>
                <td>{formatarPercentual(valorItem(item), totalStatus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className={styles.severidade}>
        <h4>Chamados abertos por prioridade</h4>
        {severidade.length === 0 ? (
          <p className={styles.vazio}>Não há chamados abertos.</p>
        ) : (
          severidade.map((item, index) => (
            <div className={styles.barraLinha} key={nomeItem(item, index)}>
              <span className={styles.barraRotulo}>
                {nomeItem(item, index)}
              </span>
              <div className={styles.barraFundo}>
                <div
                  className={styles.barraPreenchida}
                  style={{
                    width: formatarPercentual(valorItem(item), totalSeveridade),
                  }}
                />
              </div>
              <span className={styles.barraValor}>{valorItem(item)}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
