import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { open, rm } from "node:fs/promises";
import { resolve } from "node:path";

const DIRETORIO_UPLOADS = resolve("uploads/inspecoes");
mkdirSync(DIRETORIO_UPLOADS, { recursive: true });
const EXTENSAO_POR_MIME = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, DIRETORIO_UPLOADS),
  filename: (_req, file, cb) =>
    cb(null, `${randomUUID()}${EXTENSAO_POR_MIME[file.mimetype] || ".bin"}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 30 },
  fileFilter: (_req, file, cb) => {
    if (!EXTENSAO_POR_MIME[file.mimetype]) {
      const erro = new Error("Envie uma imagem JPEG, PNG ou WebP.");
      erro.status = 415;
      return cb(erro);
    }
    return cb(null, true);
  },
});

async function validarConteudoImagem(arquivo) {
  const arquivoAberto = await open(arquivo.path, "r");
  const assinatura = Buffer.alloc(12);
  try {
    const { bytesRead } = await arquivoAberto.read(assinatura, 0, 12, 0);
    const bytes = assinatura.subarray(0, bytesRead);
    const assinaturaValida = {
      "image/jpeg": () =>
        bytes
          .subarray(0, 3)
          .equals(Buffer.from([0xff, 0xd8, 0xff])),
      "image/png": () =>
        bytes
          .subarray(0, 8)
          .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
      "image/webp": () =>
        bytes.toString("ascii", 0, 4) === "RIFF" &&
        bytes.toString("ascii", 8, 12) === "WEBP",
    }[arquivo.mimetype]?.();
    if (assinaturaValida) {
      return;
    }
    const erro = new Error(
      "O conteúdo enviado não corresponde a uma imagem JPEG, PNG ou WebP.",
    );
    erro.status = 415;
    throw erro;
  } finally {
    await arquivoAberto.close();
  }
}

export function uploadEvidencias(req, res, next) {
  upload.any()(req, res, async (erro) => {
    if (erro instanceof multer.MulterError && erro.code === "LIMIT_FILE_SIZE") {
      erro.status = 413;
      erro.message = "Cada imagem pode ter no máximo 2 MB.";
    }
    if (
      erro instanceof multer.MulterError &&
      erro.code === "LIMIT_FILE_COUNT"
    ) {
      erro.status = 413;
      erro.message = "Envie no máximo 30 imagens por inspeção.";
    }
    if (erro) return next(erro);
    try {
      for (const arquivo of req.files || []) {
        await validarConteudoImagem(arquivo);
      }
    } catch (erroValidacao) {
      await Promise.all(
        (req.files || []).map(({ path }) => rm(path, { force: true })),
      );
      return next(erroValidacao);
    }
    return next();
  });
}
