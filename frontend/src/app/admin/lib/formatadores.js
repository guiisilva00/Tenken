export function formatarNumero(valor) {
  if (valor === null || valor === undefined) return "—";
  return Number(valor).toLocaleString("pt-BR");
}

export function somarTotais(itens) {
  if (!Array.isArray(itens)) return 0;
  return itens.reduce((soma, item) => soma + valorItem(item), 0);
}

export function formatarPercentual(parte, total) {
  if (!total) return "0%";
  return `${((parte / total) * 100).toFixed(1)}%`;
}

export function nomeItem(item, index) {
  return (
    item.status ??
    item.severidade ??
    item.nome ??
    item.nivel ??
    `Item ${index + 1}`
  );
}

export function valorItem(item) {
  return Number(item.total ?? item.quantidade ?? item.count ?? 0);
}
