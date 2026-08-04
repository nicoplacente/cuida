import assert from "node:assert/strict";
import test from "node:test";
import {
  createWhatsAppInvitationMessage,
  getWhatsAppAppShareUrl,
  getWhatsAppWebShareUrl,
  shouldUseWhatsAppAppLink,
} from "./whatsapp.js";

test("crea un mensaje de invitación con nombre y enlace", () => {
  const message = createWhatsAppInvitationMessage({
    link: "https://cuida.example/invitacion/abc",
    name: "Ana",
  });

  assert.equal(
    message,
    "Hola, Ana. Te invito a sumarte a nuestro círculo de cuidado en Cuida: https://cuida.example/invitacion/abc",
  );
});

test("codifica el mensaje en los enlaces de la aplicación y la web", () => {
  const message = "Invitación para Ana: https://cuida.example/invitacion/abc";
  const encodedMessage = encodeURIComponent(message);

  assert.equal(getWhatsAppAppShareUrl(message), `whatsapp://send?text=${encodedMessage}`);
  assert.equal(
    getWhatsAppWebShareUrl(message),
    `https://api.whatsapp.com/send?text=${encodedMessage}`,
  );
});

test("usa el enlace de la aplicación únicamente en dispositivos móviles", () => {
  assert.equal(
    shouldUseWhatsAppAppLink({ userAgent: "Mozilla/5.0 (Linux; Android 15)" }),
    true,
  );
  assert.equal(
    shouldUseWhatsAppAppLink({
      maxTouchPoints: 5,
      platform: "MacIntel",
      userAgent: "Mozilla/5.0 (Macintosh)",
    }),
    true,
  );
  assert.equal(
    shouldUseWhatsAppAppLink({
      platform: "Win32",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    }),
    false,
  );
});
