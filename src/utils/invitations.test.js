import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  createInvitationExpiration,
  getInvitationRoleLabel,
  invitationValidityMilliseconds,
  isInvitationExpired,
  isValidInvitationToken,
} from "./invitations.js";

test("crea invitaciones con una vigencia exacta de 60 minutos", () => {
  const createdAt = new Date("2026-08-10T12:00:00.000Z");
  const expiresAt = createInvitationExpiration(createdAt);

  assert.equal(invitationValidityMilliseconds, 3_600_000);
  assert.equal(expiresAt.toISOString(), "2026-08-10T13:00:00.000Z");
});

test("considera disponible el enlace hasta el instante de vencimiento", () => {
  const expiresAt = new Date("2026-08-10T13:00:00.000Z");

  assert.equal(
    isInvitationExpired(expiresAt, new Date("2026-08-10T12:59:59.999Z")),
    false,
  );
  assert.equal(
    isInvitationExpired(expiresAt, new Date("2026-08-10T13:00:00.000Z")),
    true,
  );
});

test("valida tokens y etiquetas de los roles que pueden invitarse", () => {
  assert.equal(isValidInvitationToken("a".repeat(64)), true);
  assert.equal(isValidInvitationToken("a".repeat(63)), false);
  assert.equal(getInvitationRoleLabel("CAREGIVER"), "Cuidador");
  assert.equal(getInvitationRoleLabel("OBSERVER"), "Observador");
});

test("prioriza el inicio de sesión y alterna un único formulario", () => {
  const source = readFileSync(
    new URL("../components/invitation-auth-forms.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /useState\("login"\)/);
  assert.match(source, /mode === "login"/);
  assert.match(source, /key=\{mode\}/);
  assert.match(source, /¿No tenés cuenta\?/);
  assert.match(source, /Crear una cuenta/);
  assert.match(source, /¿Ya tenés cuenta\?/);
  assert.match(source, /Volver a iniciar sesión/);
});
