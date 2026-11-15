import { Router } from "express";

import {
  cadastrarAluno,
  gerarMatricula,
  solicitarAcesso,
} from "../controllers/AlunoController.js";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";

const router = Router();

router.post("/gerar-matricula", gerarMatricula);
router.post("/cadastro", cadastrarAluno);
router.post("/solicitar-acesso", authMiddleware, solicitarAcesso);

export default router;
