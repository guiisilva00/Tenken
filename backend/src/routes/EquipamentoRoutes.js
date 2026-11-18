import { Router } from "express";

import {
  atualizar,
  atualizarStatus,
  buscarPorId,
  criar,
  excluir,
  listar,
} from "../controllers/EquipamentoController.js";
import {
  authMiddleware,
  requirePerfil,
} from "../middlewares/AuthMiddleware.js";

const router = Router();

router.get("/", authMiddleware, listar);
router.get("/:id", authMiddleware, buscarPorId);
router.post("/", authMiddleware, requirePerfil("ADMIN"), criar);
router.put("/:id", authMiddleware, requirePerfil("ADMIN"), atualizar);
router.patch(
  "/:id/status",
  authMiddleware,
  requirePerfil("ADMIN", "TECNICO"),
  atualizarStatus,
);
router.delete("/:id", authMiddleware, requirePerfil("ADMIN"), excluir);

export default router;
