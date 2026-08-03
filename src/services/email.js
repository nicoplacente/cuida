import "server-only";

import { SafeServerError } from "@/utils/safe-logger";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendPasswordResetEmail({ email, name, resetUrl }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new SafeServerError("EMAIL_CONFIGURATION_ERROR");
  }

  const safeName = escapeHtml(name || "");
  const safeResetUrl = escapeHtml(resetUrl);
  const greeting = safeName ? `Hola, ${safeName}` : "Hola";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Restablecé tu contraseña de Cuida",
      html: `
        <!doctype html>
        <html lang="es">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Restablecer contraseña</title>
          </head>
          <body style="margin:0;background:#f5f8fb;color:#0b1f3a;font-family:Arial,Helvetica,sans-serif">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f8fb">
              <tr>
                <td align="center" style="padding:32px 16px">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px">
                    <tr>
                      <td style="padding:0 4px 18px;font-size:22px;font-weight:700;letter-spacing:-0.4px">
                        <span style="display:inline-block;margin-right:8px;color:#00a6a6">●</span>Cuida
                      </td>
                    </tr>
                    <tr>
                      <td style="border:1px solid #e8eef4;border-radius:24px;background:#ffffff;padding:36px 32px">
                        <p style="margin:0 0 12px;color:#00a6a6;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase">
                          Recuperación de acceso
                        </p>
                        <h1 style="margin:0 0 20px;font-size:28px;line-height:1.2;letter-spacing:-0.6px">
                          Creá una nueva contraseña
                        </h1>
                        <p style="margin:0 0 12px;color:#24415f;font-size:16px;line-height:1.65">
                          ${greeting}.
                        </p>
                        <p style="margin:0;color:#24415f;font-size:16px;line-height:1.65">
                          Recibimos una solicitud para cambiar la contraseña de tu cuenta.
                        </p>
                        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0">
                          <tr>
                            <td style="border-radius:999px;background:#0b1f3a">
                              <a href="${safeResetUrl}" style="display:inline-block;padding:13px 22px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none">
                                Crear nueva contraseña
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin:0 0 12px;color:#24415f;font-size:14px;line-height:1.6">
                          El enlace vence en 30 minutos y puede usarse una sola vez.
                        </p>
                        <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6">
                          Si no solicitaste este cambio, podés ignorar el mensaje. Tu contraseña seguirá siendo la misma.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:18px 4px 0;color:#64748b;font-size:12px;line-height:1.5">
                        Cuida · Organización del cuidado compartido
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      text: `${name ? `Hola, ${name}.\n\n` : "Hola.\n\n"}Recibimos una solicitud para cambiar la contraseña de tu cuenta de Cuida.\n\nCreá una nueva contraseña desde este enlace:\n${resetUrl}\n\nEl enlace vence en 30 minutos y puede usarse una sola vez. Si no solicitaste este cambio, ignorá el mensaje. Tu contraseña seguirá siendo la misma.`,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    await response.body?.cancel().catch(() => {});
    throw new SafeServerError("EMAIL_DELIVERY_FAILED");
  }

  return response.json();
}
