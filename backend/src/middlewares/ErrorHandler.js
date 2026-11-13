export function errorHandler(error, request, response, next) {
  console.error(error);
  if (Number.isInteger(error.status)) {
    return response.status(error.status).json({ sucesso: false, mensagem: error.message });
  }
  if (Array.isArray(error.errors)) {
    return response.status(Number.isInteger(error.status) ? error.status : 400).json({ errors: error.errors });
  }
  if (error instanceof TypeError) {
    return response.status(400).json({ sucesso: false, mensagem: error.message });
  }
  if (/n[ãa]o encontrad[oa]/i.test(error.message || "")) {
    return response.status(404).json({ sucesso: false, mensagem: error.message });
  }
  return response.status(500).json({ sucesso: false, mensagem: error.message || "Erro interno no servidor" });
}
