import jwt from "jsonwebtoken";
import * as UsuarioService from "../services/UsuarioService.js";

export async function authMiddleware(request, response, next) {
  const authorization = request.get("authorization");
  const match =
    typeof authorization === "string"
      ? authorization.match(/^Bearer\s+(.+)$/i)
      : null;

  if (!match) {
    return response
      .status(401)
      .json({ message: "Token de autenticação inválido ou ausente" });
  }

  try {
    const payload = jwt.verify(match[1], process.env.JWT_SECRET);
    const usuario = await UsuarioService.buscarSessao(payload.sub);
    if (!usuario) {
      return response.status(401).json({ message: "Usuário desativado" });
    }
    request.usuario = {
      id: usuario.id,
      perfil: usuario.perfil,
      matricula: usuario.matricula,
    };
    return next();
  } catch {
    return response
      .status(401)
      .json({ message: "Token de autenticação inválido ou ausente" });
  }
}

export function requirePerfil(...perfis) {
  return (request, response, next) => {
    if (!request.usuario || !perfis.includes(request.usuario.perfil)) {
      return response.status(403).json({ message: "Acesso não autorizado" });
    }

    return next();
  };
}
