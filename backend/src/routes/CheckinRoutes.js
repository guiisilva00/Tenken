import { Router } from "express";
import { aprovar, buscarAtual, listarPendentes } from "../controllers/CheckinController.js";
import { authMiddleware, requirePerfil } from "../middlewares/AuthMiddleware.js";

const router = Router();

router.get("/atual", authMiddleware, requirePerfil("ALUNO"), buscarAtual);
router.get("/pendentes", authMiddleware, requirePerfil("PROFESSOR"), listarPendentes);
router.patch("/:id/aprovar", authMiddleware, requirePerfil("PROFESSOR"), aprovar);

export default router;
