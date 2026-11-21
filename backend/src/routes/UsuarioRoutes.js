import { Router } from "express";

import {
  atualizarAtivo,
  atualizarDados,
  atualizarPerfil,
  listar,
  login,
  me,
  redefinirSenha,
  solicitarRedefinicaoSenha,
} from "../controllers/UsuarioController.js";
import {
  authMiddleware,
  requirePerfil,
} from "../middlewares/AuthMiddleware.js";
import {
  limitadorLogin,
  limitadorRedefinicaoSenha,
} from "../middlewares/RateLimiter.js";

const router = Router();

router.post("/login", limitadorLogin, login);
router.post(
  "/esqueci-senha",
  limitadorRedefinicaoSenha,
  solicitarRedefinicaoSenha,
);
router.post("/redefinir-senha", limitadorRedefinicaoSenha, redefinirSenha);
router.get("/me", authMiddleware, me);
router.get("/", authMiddleware, requirePerfil("ADMIN"), listar);
router.put("/:id", authMiddleware, requirePerfil("ADMIN"), atualizarDados);
router.put(
  "/:id/perfil",
  authMiddleware,
  requirePerfil("ADMIN"),
  atualizarPerfil,
);
router.patch(
  "/:id/ativo",
  authMiddleware,
  requirePerfil("ADMIN"),
  atualizarAtivo,
);

export default router;
