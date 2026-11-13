import { Router } from "express";
import { abrirChamado, buscarRespostas, listar, registrar } from "../controllers/InspecaoController.js";
import { authMiddleware, requirePerfil } from "../middlewares/AuthMiddleware.js";
import { uploadEvidencias } from "../middlewares/UploadMiddleware.js";

const r = Router(); r.get("/", authMiddleware, requirePerfil("PROFESSOR"), listar); r.post("/", authMiddleware, requirePerfil("PROFESSOR"), uploadEvidencias, registrar); r.post("/:id/chamado", authMiddleware, requirePerfil("PROFESSOR"), abrirChamado); r.get("/:id/respostas", authMiddleware, requirePerfil("PROFESSOR"), buscarRespostas); export default r;
