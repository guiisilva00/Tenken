import { Router } from "express";
import { criar, listar } from "../controllers/TurmaController.js";
import {
  authMiddleware,
  requirePerfil,
} from "../middlewares/AuthMiddleware.js";

const router = Router();
router.get("/", authMiddleware, requirePerfil("ADMIN", "PROFESSOR"), listar);
router.post("/", authMiddleware, requirePerfil("ADMIN"), criar);
export default router;
