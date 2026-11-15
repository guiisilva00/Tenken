import { Router } from "express";
import { gerar } from "../controllers/TecnicoDashboardController.js";
import {
  authMiddleware,
  requirePerfil,
} from "../middlewares/AuthMiddleware.js";

const router = Router();
router.get("/", authMiddleware, requirePerfil("TECNICO"), gerar);

export default router;
