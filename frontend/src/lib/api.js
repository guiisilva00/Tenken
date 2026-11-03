import { clearSession, getToken } from "./session";

export async function apiFetch(path, options = {}) {
  const { body, headers: cabecalhosOriginais, ...opcoes } = options;
  const cabecalhos = new Headers(cabecalhosOriginais);
  const token = getToken();

  if (body !== undefined) {
    cabecalhos.set("Content-Type", "application/json");
  }

  if (token) {
    cabecalhos.set("Authorization", `Bearer ${token}`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
  const caminho = baseUrl.endsWith("/api") && path.startsWith("/api/")
    ? path.slice(4)
    : path;
  const resposta = await fetch(`${baseUrl}${caminho}`, {
    ...opcoes,
    headers: cabecalhos,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  let dados = null;
  if (resposta.status !== 204) {
    const texto = await resposta.text();
    if (texto) {
      try {
        dados = JSON.parse(texto);
      } catch {
        dados = null;
      }
    }
  }

  if (!resposta.ok) {
    const erro = new Error(dados?.message || "Não foi possível concluir a solicitação.");
    erro.status = resposta.status;
    erro.errors = Array.isArray(dados?.errors)
      ? dados.errors.filter((item) => item && typeof item.field === "string" && typeof item.message === "string")
      : [];

    if (resposta.status === 401 && path !== "/api/usuarios/login" && typeof window !== "undefined") {
      clearSession();
      window.location.assign("/login");
    }

    throw erro;
  }

  return dados;
}
