import { Router } from "express";

import {
  buscarArea,
  cadastrarAluno,
  gerarMatricula,
  solicitarAcesso,
} from "../controllers/AlunoController.js";
import { authMiddleware, requirePerfil } from "../middlewares/AuthMiddleware.js";

const router = Router();

router.post("/gerar-matricula", gerarMatricula);
router.post("/cadastro", cadastrarAluno);
router.post("/solicitar-acesso", authMiddleware, requirePerfil("ALUNO"), solicitarAcesso);
router.get("/area", authMiddleware, requirePerfil("ALUNO"), buscarArea);

export default router;
