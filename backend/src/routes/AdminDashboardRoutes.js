import { Router } from "express";
import { gerar } from "../controllers/AdminDashboardController.js";
import {
  authMiddleware,
  requirePerfil,
} from "../middlewares/AuthMiddleware.js";

const router = Router();
router.get("/", authMiddleware, requirePerfil("ADMIN"), gerar);
export default router;
