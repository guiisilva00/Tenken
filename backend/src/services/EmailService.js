import { readFile } from "node:fs/promises";
import nodemailer from "nodemailer";

let transportador;

function escaparHtml(valor) {
  return String(valor).replace(/[&<>"']/g, (caractere) => {
    const entidades = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entidades[caractere];
  });
}

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
  if (!process.env.SMTP_HOST) {
    throw new Error("SMTP_HOST não configurado para envio de e-mail.");
  }

  const nomeHtml = escaparHtml(nome);
  const linkHtml = escaparHtml(link);
  const logo = await readFile(
    new URL("../assets/letreiro-tenken.png", import.meta.url),
  );

  await obterTransportador().sendMail({
    from: process.env.SMTP_FROM || "Tenken <nao-responda@tenken.app>",
    to: para,
    subject: "Redefinição de senha - Tenken",
    attachments: [
      {
        filename: "tenken-logo.png",
        content: logo,
        contentType: "image/png",
        cid: "tenken-logo",
      },
    ],
    text: `Olá, ${nome}.\n\nRecebemos uma solicitação para redefinir a senha da sua conta Tenken.\nUse o link abaixo para escolher uma nova senha. Ele expira em 30 minutos e pode ser usado uma única vez:\n\n${link}\n\nSe você não pediu essa alteração, ignore este e-mail.`,
    html: `
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Redefinição de senha - Tenken</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f5f3f4;font-family:Arial,Helvetica,sans-serif;color:#161a1d">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f3f4">
            <tr>
              <td align="center" style="padding:32px 16px">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid #d3d3d3;border-radius:8px;overflow:hidden">
                  <tr>
                    <td align="center" style="padding:24px 32px;background-color:#4b1023">
                      <img src="cid:tenken-logo" width="300" alt="Tenken" style="display:block;width:300px;max-width:100%;height:auto;margin:0 auto;border:0">
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px">
                      <h1 style="margin:0 0 20px;font-size:24px;line-height:1.3;color:#161a1d">Redefina sua senha</h1>
                      <p style="margin:0 0 16px;font-size:16px;line-height:1.6">Olá, ${nomeHtml}.</p>
                      <p style="margin:0 0 24px;font-size:16px;line-height:1.6">Recebemos uma solicitação para criar uma nova senha para sua conta. Clique no botão abaixo para continuar.</p>
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px">
                        <tr>
                          <td align="center" style="border-radius:4px;background-color:#a4161a">
                            <a href="${linkHtml}" style="display:inline-block;padding:14px 22px;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none">Criar nova senha</a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#4b4647">O link expira em 30 minutos e só pode ser usado uma vez.</p>
                      <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#4b4647">Se o botão não funcionar, copie e cole este endereço no navegador:</p>
                      <p style="margin:0 0 24px;font-size:13px;line-height:1.6;overflow-wrap:anywhere"><a href="${linkHtml}" style="color:#a4161a">${linkHtml}</a></p>
                      <p style="margin:0;font-size:14px;line-height:1.6;color:#4b4647">Se você não pediu essa alteração, pode ignorar este e-mail. Sua senha atual continuará funcionando.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:18px 32px;background-color:#f5f3f4;border-top:1px solid #d3d3d3;font-size:12px;line-height:1.5;color:#5b5556">Mensagem automática da plataforma Tenken. Não responda a este e-mail.</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>`,
  });
}
