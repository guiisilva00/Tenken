import nodemailer from "nodemailer";

let transportador;

function obterTransportador() {
  if (!transportador) {
    transportador = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transportador;
}

export async function enviarEmailRedefinicaoSenha({ para, nome, link }) {
  await obterTransportador().sendMail({
    from: process.env.SMTP_FROM || "Tenken <nao-responda@tenken.app>",
    to: para,
    subject: "Redefinição de senha - Tenken",
    text: `Olá, ${nome}.\n\nRecebemos uma solicitação para redefinir a senha da sua conta Tenken.\nAcesse o link abaixo para criar uma nova senha. Ele expira em 30 minutos e só pode ser usado uma vez:\n\n${link}\n\nSe você não solicitou essa alteração, ignore este e-mail.`,
    html: `<p>Olá, ${nome}.</p><p>Recebemos uma solicitação para redefinir a senha da sua conta Tenken.</p><p>Este link expira em 30 minutos e só pode ser usado uma vez:</p><p><a href="${link}">${link}</a></p><p>Se você não solicitou essa alteração, ignore este e-mail.</p>`,
  });
}
