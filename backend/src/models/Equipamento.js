const TIPOS_VALIDOS = ["BANCADA", "ROBO"];
const STATUS_VALIDOS = [
  "DISPONIVEL",
  "RESERVADO",
  "EM_USO",
  "EM_MANUTENCAO",
  "INATIVO",
];

export default class Equipamento {
  constructor({
    id,
    codigo_patrimonio,
    nome,
    tipo,
    localizacao,
    status = "DISPONIVEL",
  }) {
    if (
      id !== undefined &&
      (!Number.isInteger(Number(id)) || Number(id) <= 0)
    ) {
      throw new TypeError("ID deve ser um inteiro positivo.");
    }
    if (
      typeof codigo_patrimonio !== "string" ||
      codigo_patrimonio.trim() === ""
    ) {
      throw new TypeError("Código de patrimônio é obrigatório.");
    }
    if (typeof nome !== "string" || nome.trim() === "") {
      throw new TypeError("Nome é obrigatório.");
    }
    if (!TIPOS_VALIDOS.includes(tipo)) {
      throw new TypeError(`Tipo deve ser um de: ${TIPOS_VALIDOS.join(", ")}.`);
    }
    if (typeof localizacao !== "string" || localizacao.trim() === "") {
      throw new TypeError("Localização é obrigatória.");
    }
    if (!STATUS_VALIDOS.includes(status)) {
      throw new TypeError(
        `Status deve ser um de: ${STATUS_VALIDOS.join(", ")}.`,
      );
    }

    if (id !== undefined) this.id = Number(id);
    this.codigo_patrimonio = codigo_patrimonio.trim();
    this.nome = nome.trim();
    this.tipo = tipo;
    this.localizacao = localizacao.trim();
    this.status = status;
  }
}

export { STATUS_VALIDOS };
