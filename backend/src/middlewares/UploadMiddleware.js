import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { extname, resolve } from "node:path";

const DIRETORIO_UPLOADS = resolve("uploads/inspecoes");
mkdirSync(DIRETORIO_UPLOADS, { recursive: true });
const MIME_TYPES_VALIDOS = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, DIRETORIO_UPLOADS),
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 30 },
  fileFilter: (_req, file, cb) => {
    if (!MIME_TYPES_VALIDOS.includes(file.mimetype)) {
      const erro = new Error("Envie uma imagem JPEG, PNG ou WebP.");
      erro.status = 415;
      return cb(erro);
    }
    return cb(null, true);
  },
});

export function uploadEvidencias(req, res, next) {
  upload.any()(req, res, (erro) => {
    if (erro instanceof multer.MulterError && erro.code === "LIMIT_FILE_SIZE") {
      erro.status = 413;
      erro.message = "Cada imagem pode ter no máximo 2 MB.";
    }
    if (erro instanceof multer.MulterError && erro.code === "LIMIT_FILE_COUNT") {
      erro.status = 413;
      erro.message = "Envie no máximo 30 imagens por inspeção.";
    }
    if (erro) return next(erro);
    return next();
  });
}
