import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler } from "./middlewares/ErrorHandler.js";
import { authMiddleware } from "./middlewares/AuthMiddleware.js";
import adminDashboardRoutes from "./routes/AdminDashboardRoutes.js";
import adminRelatorioRoutes from "./routes/AdminRelatorioRoutes.js";
import alunoRoutes from "./routes/AlunoRoutes.js";
import agendamentoRoutes from "./routes/AgendamentoRoutes.js";
import chamadoRoutes from "./routes/ChamadoRoutes.js";
import checkinRoutes from "./routes/CheckinRoutes.js";
import equipamentoRoutes from "./routes/EquipamentoRoutes.js";
import healthRoutes from "./routes/HealthRoutes.js";
import inspecaoRoutes from "./routes/InspecaoRoutes.js";
import ordemServicoRoutes from "./routes/OrdemServicoRoutes.js";
import preCadastroRoutes from "./routes/PreCadastroRoutes.js";
import tecnicoDashboardRoutes from "./routes/TecnicoDashboardRoutes.js";
import turmaRoutes from "./routes/TurmaRoutes.js";
import usuarioRoutes from "./routes/UsuarioRoutes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  }),
);
app.use(express.json());
app.use("/uploads", authMiddleware, express.static("uploads"));

app.get("/", (request, response) => {
  response.json({
    message: "API do projeto base",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/inspecoes", inspecaoRoutes);
app.use("/api/alunos", alunoRoutes);
app.use("/api/agendamentos", agendamentoRoutes);
app.use("/api/checkins", checkinRoutes);
app.use("/api/equipamentos", equipamentoRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/pre-cadastros", preCadastroRoutes);
app.use("/api/chamados", chamadoRoutes);
app.use("/api/ordens-servico", ordemServicoRoutes);
app.use("/api/admin/relatorios", adminRelatorioRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/tecnico/dashboard", tecnicoDashboardRoutes);
app.use("/api/turmas", turmaRoutes);
app.use((request, response) => {
  response.status(404).json({
    sucesso: false,
    mensagem: `Rota ${request.method} ${request.originalUrl} não existe.`,
  });
});
app.use(errorHandler);

export default app;
