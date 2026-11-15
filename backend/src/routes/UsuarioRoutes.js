import { Router } from "express";

import {
  atualizarAtivo,
  atualizarDados,
  atualizarPerfil,
  listar,
  login,
  me,
  redefinirSenha,
} from "../controllers/UsuarioController.js";
import {
  authMiddleware,
  requirePerfil,
} from "../middlewares/AuthMiddleware.js";

const router = Router();

router.post("/login", login);
router.post("/redefinir-senha", redefinirSenha);
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
