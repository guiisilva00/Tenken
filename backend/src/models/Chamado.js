const TIPOS_VALIDOS = ["CORRETIVO", "PREVENTIVO"];
const SEVERIDADES_VALIDAS = ["BAIXA", "MEDIA", "ALTA", "CRITICA"];
const STATUS_VALIDOS = [
  "ABERTO",
  "EM_ATENDIMENTO",
  "AGUARDANDO_PECAS",
  "CONCLUIDO",
  "CANCELADO",
];

export default class Chamado {
  constructor({
    id,
    equipamento_id,
    inspecao_id = null,
    solicitante_id,
    titulo,
    descricao,
    tipo = "CORRETIVO",
    severidade = "MEDIA",
    status = "ABERTO",
  }) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new TypeError("ID deve ser um inteiro positivo.");
    }
    if (!Number.isInteger(equipamento_id) || equipamento_id <= 0) {
      throw new TypeError("ID do equipamento deve ser um inteiro positivo.");
    }
    if (
      inspecao_id !== null &&
      (!Number.isInteger(inspecao_id) || inspecao_id <= 0)
    ) {
      throw new TypeError("ID da inspeção deve ser um inteiro positivo.");
    }
    if (!Number.isInteger(solicitante_id) || solicitante_id <= 0) {
      throw new TypeError("ID do solicitante deve ser um inteiro positivo.");
    }
    if (typeof titulo !== "string" || titulo.trim() === "") {
      throw new TypeError("Título é obrigatório.");
    }
    if (typeof descricao !== "string" || descricao.trim() === "") {
      throw new TypeError("Descrição é obrigatória.");
    }
    if (!TIPOS_VALIDOS.includes(tipo)) {
      throw new TypeError(`Tipo deve ser um de: ${TIPOS_VALIDOS.join(", ")}.`);
    }
    if (!SEVERIDADES_VALIDAS.includes(severidade)) {
      throw new TypeError(
        `Severidade deve ser uma de: ${SEVERIDADES_VALIDAS.join(", ")}.`,
      );
    }
    if (!STATUS_VALIDOS.includes(status)) {
      throw new TypeError(
        `Status deve ser um de: ${STATUS_VALIDOS.join(", ")}.`,
      );
    }

    this.id = id;
    this.equipamento_id = equipamento_id;
    this.inspecao_id = inspecao_id;
    this.solicitante_id = solicitante_id;
    this.titulo = titulo.trim();
    this.descricao = descricao.trim();
    this.tipo = tipo;
    this.severidade = severidade;
    this.status = status;
  }
}

export { SEVERIDADES_VALIDAS, STATUS_VALIDOS, TIPOS_VALIDOS };
