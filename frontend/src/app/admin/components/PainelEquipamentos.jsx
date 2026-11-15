import { montarSegmentosDonut, CORES_DONUT } from "../lib/graficos";
import { formatarPercentual, nomeItem, valorItem } from "../lib/formatadores";
import BadgePercentual from "./BadgePercentual";
import styles from "./PainelEquipamentos.module.css";

export default function PainelEquipamentos({
  total,
  porStatus,
  carregando,
  cores = CORES_DONUT,
  titulo = "Equipamentos por status",
}) {
  const itens = Array.isArray(porStatus) ? porStatus : [];
  const raio = 62;
  const circunferencia = 2 * Math.PI * raio;
  const segmentos = montarSegmentosDonut(itens, raio);

  return (
    <section className={styles.painel}>
      <div className={styles.cabecalho}>
        <span className={styles.titulo}>{titulo}</span>
        <span className={styles.subtitulo}>{total ?? 0} no total</span>
      </div>

      {itens.length === 0 ? (
        <p className={styles.vazio}>
          {carregando
            ? "Carregando equipamentos…"
            : "Não há equipamentos para mostrar."}
        </p>
      ) : (
        <>
          <div className={styles.grafico}>
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={raio}
                fill="none"
                stroke="rgba(177,167,166,.16)"
                strokeWidth="16"
              />
              {segmentos.map((segmento, index) => (
                <circle
                  key={index}
                  cx="80"
                  cy="80"
                  r={raio}
                  fill="none"
                  stroke={segmento.cor}
                  strokeWidth="16"
                  strokeDasharray={`${segmento.comprimento} ${circunferencia - segmento.comprimento}`}
                  strokeDashoffset={segmento.deslocamento}
                  transform="rotate(-90 80 80)"
                />
              ))}
              <text
                x="80"
                y="76"
                textAnchor="middle"
                style={{ fill: "var(--white)", fontSize: 22, fontWeight: 600 }}
              >
                {total ?? 0}
              </text>
              <text
                x="80"
                y="97"
                textAnchor="middle"
                style={{ fill: "var(--silver)", fontSize: 11.5 }}
              >
                Total
              </text>
            </svg>
          </div>

          <div className={styles.legenda}>
            {itens.map((item, index) => (
              <BadgePercentual
                key={nomeItem(item, index)}
                cor={cores[index % cores.length]}
                rotulo={nomeItem(item, index)}
                percentual={formatarPercentual(valorItem(item), total)}
                quantidade={valorItem(item)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
