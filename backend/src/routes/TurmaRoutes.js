import { Router } from "express";
import { atualizar, criar, excluir, listar } from "../controllers/TurmaController.js";
import {
  authMiddleware,
  requirePerfil,
} from "../middlewares/AuthMiddleware.js";

const router = Router();
router.get("/", authMiddleware, requirePerfil("ADMIN", "PROFESSOR"), listar);
router.post("/", authMiddleware, requirePerfil("ADMIN"), criar);
router.put("/:id", authMiddleware, requirePerfil("ADMIN"), atualizar);
router.delete("/:id", authMiddleware, requirePerfil("ADMIN"), excluir);
export default router;
