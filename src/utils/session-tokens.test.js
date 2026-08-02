import assert from "node:assert/strict";
import test from "node:test";
import {
  ACCESS_TOKEN_LIFETIME_MS,
  BROWSER_SESSION_LIFETIME_MS,
  PERSISTENT_SESSION_LIFETIME_MS,
  SESSION_PERSISTENCE,
  createAccessToken,
  createRefreshToken,
  getRefreshVersionStatus,
  getSessionExpiresAt,
  hashSessionToken,
  isLegacyRefreshToken,
  matchesSessionTokenHash,
  verifyAccessToken,
  verifyRefreshToken,
} from "./session-tokens.js";

const signingSecret = "test-session-secret-with-sufficient-entropy";
const now = new Date("2026-08-01T12:00:00.000Z").getTime();

test("firma y valida access tokens hasta su vencimiento", () => {
  const { token, expiresAt } = createAccessToken(
    { sessionId: "session-1", userId: "user-1", now },
    signingSecret,
  );

  assert.equal(expiresAt.getTime(), now + ACCESS_TOKEN_LIFETIME_MS);
  assert.deepEqual(verifyAccessToken(token, signingSecret, now), {
    type: "access",
    sessionId: "session-1",
    userId: "user-1",
    expiresAt: now + ACCESS_TOKEN_LIFETIME_MS,
  });
  assert.equal(
    verifyAccessToken(token, signingSecret, now + ACCESS_TOKEN_LIFETIME_MS),
    null,
  );
  assert.equal(verifyAccessToken(`${token}alterado`, signingSecret, now), null);
  assert.equal(verifyAccessToken(token, "otro-secreto", now), null);
});

test("firma refresh tokens versionados y rechaza manipulaciones", () => {
  const sessionSecret = "a".repeat(64);
  const firstToken = createRefreshToken(
    {
      sessionId: "session-1",
      sessionSecret,
      version: 0,
      persistence: SESSION_PERSISTENCE.PERSISTENT,
    },
    signingSecret,
  );
  const rotatedToken = createRefreshToken(
    {
      sessionId: "session-1",
      sessionSecret,
      version: 1,
      persistence: SESSION_PERSISTENCE.PERSISTENT,
    },
    signingSecret,
  );

  assert.notEqual(firstToken, rotatedToken);
  assert.deepEqual(verifyRefreshToken(rotatedToken, signingSecret), {
    type: "refresh",
    sessionId: "session-1",
    sessionSecret,
    version: 1,
    persistence: SESSION_PERSISTENCE.PERSISTENT,
  });
  assert.equal(verifyRefreshToken(`${rotatedToken}alterado`, signingSecret), null);
});

test("tolera una versión anterior solo dentro de la ventana de concurrencia", () => {
  const previousExpiresAt = new Date(now + 30_000);

  assert.equal(
    getRefreshVersionStatus({
      presentedVersion: 2,
      currentVersion: 2,
      previousVersion: 1,
      previousExpiresAt,
      now,
    }),
    "current",
  );
  assert.equal(
    getRefreshVersionStatus({
      presentedVersion: 1,
      currentVersion: 2,
      previousVersion: 1,
      previousExpiresAt,
      now,
    }),
    "previous",
  );
  assert.equal(
    getRefreshVersionStatus({
      presentedVersion: 1,
      currentVersion: 2,
      previousVersion: 1,
      previousExpiresAt,
      now: previousExpiresAt.getTime(),
    }),
    null,
  );
});

test("calcula las vigencias de sesión persistente y de navegador", () => {
  assert.equal(
    getSessionExpiresAt(SESSION_PERSISTENCE.PERSISTENT, now).getTime(),
    now + PERSISTENT_SESSION_LIFETIME_MS,
  );
  assert.equal(
    getSessionExpiresAt(SESSION_PERSISTENCE.BROWSER, now).getTime(),
    now + BROWSER_SESSION_LIFETIME_MS,
  );
});

test("reconoce únicamente el formato de refresh token heredado", () => {
  assert.equal(isLegacyRefreshToken("f".repeat(64)), true);
  assert.equal(isLegacyRefreshToken("g".repeat(64)), false);
  assert.equal(isLegacyRefreshToken("f".repeat(63)), false);
  const legacyToken = "f".repeat(64);
  assert.equal(
    matchesSessionTokenHash(legacyToken, hashSessionToken(legacyToken)),
    true,
  );
  assert.equal(matchesSessionTokenHash(legacyToken, "0".repeat(64)), false);
});
