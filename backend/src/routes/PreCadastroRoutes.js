import { Router } from "express";

import {
  ativar,
  criar,
  listar,
  revogar,
} from "../controllers/PreCadastroStaffController.js";
import {
  authMiddleware,
  requirePerfil,
} from "../middlewares/AuthMiddleware.js";
import { limitadorAtivacaoPreCadastro } from "../middlewares/RateLimiter.js";

const router = Router();

router.get("/", authMiddleware, requirePerfil("ADMIN"), listar);
router.post("/", authMiddleware, requirePerfil("ADMIN"), criar);
router.delete("/:id", authMiddleware, requirePerfil("ADMIN"), revogar);
router.post("/ativar", limitadorAtivacaoPreCadastro, ativar);

export default router;
