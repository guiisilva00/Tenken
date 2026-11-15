import { Router } from "express";
import {
  cancelar,
  criar,
  listar,
} from "../controllers/AgendamentoController.js";
import {
  authMiddleware,
  requirePerfil,
} from "../middlewares/AuthMiddleware.js";
const router = Router();
router.get("/", authMiddleware, requirePerfil("PROFESSOR"), listar);
router.post("/", authMiddleware, requirePerfil("PROFESSOR"), criar);
router.patch(
  "/:id/cancelar",
  authMiddleware,
  requirePerfil("PROFESSOR"),
  cancelar,
);
export default router;
