import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "crypto";

export const ACCESS_TOKEN_LIFETIME_MS = 15 * 60 * 1000;
export const BROWSER_SESSION_LIFETIME_MS = 24 * 60 * 60 * 1000;
export const PERSISTENT_SESSION_LIFETIME_MS = 90 * 24 * 60 * 60 * 1000;
export const REFRESH_TOKEN_GRACE_MS = 30 * 1000;

export const SESSION_PERSISTENCE = {
  BROWSER: "browser",
  PERSISTENT: "persistent",
};

const legacyRefreshTokenPattern = /^[a-f0-9]{64}$/;
const refreshSecretPattern = /^[a-f0-9]{64}$/;
const maximumSignedTokenLength = 2048;

function signPayload(encodedPayload, signingSecret) {
  return createHmac("sha256", signingSecret)
    .update(encodedPayload)
    .digest("base64url");
}

function createSignedToken(payload, signingSecret) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${signPayload(encodedPayload, signingSecret)}`;
}

function verifySignedToken(token, signingSecret) {
  if (
    typeof token !== "string" ||
    !token ||
    token.length > maximumSignedTokenLength ||
    typeof signingSecret !== "string" ||
    !signingSecret
  ) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return null;
  }

  const [encodedPayload, signature] = parts;
  const expectedSignature = Buffer.from(signPayload(encodedPayload, signingSecret));
  const receivedSignature = Buffer.from(signature);

  if (
    expectedSignature.length !== receivedSignature.length ||
    !timingSafeEqual(expectedSignature, receivedSignature)
  ) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function isValidIdentifier(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 128;
}

export function createSessionSecret() {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function matchesSessionTokenHash(token, tokenHash) {
  const receivedHash = Buffer.from(hashSessionToken(token));
  const storedHash = Buffer.from(tokenHash || "");

  return (
    receivedHash.length === storedHash.length &&
    timingSafeEqual(receivedHash, storedHash)
  );
}

export function createAccessToken({ sessionId, userId, now = Date.now() }, signingSecret) {
  const expiresAt = now + ACCESS_TOKEN_LIFETIME_MS;
  const token = createSignedToken(
    {
      type: "access",
      sessionId,
      userId,
      expiresAt,
    },
    signingSecret,
  );

  return { token, expiresAt: new Date(expiresAt) };
}

export function verifyAccessToken(token, signingSecret, now = Date.now()) {
  const payload = verifySignedToken(token, signingSecret);

  if (
    payload?.type !== "access" ||
    !isValidIdentifier(payload.sessionId) ||
    !isValidIdentifier(payload.userId) ||
    !Number.isSafeInteger(payload.expiresAt) ||
    payload.expiresAt <= now
  ) {
    return null;
  }

  return payload;
}

export function createRefreshToken(
  { sessionId, sessionSecret, version, persistence },
  signingSecret,
) {
  return createSignedToken(
    {
      type: "refresh",
      sessionId,
      sessionSecret,
      version,
      persistence,
    },
    signingSecret,
  );
}

export function verifyRefreshToken(token, signingSecret) {
  const payload = verifySignedToken(token, signingSecret);

  if (
    payload?.type !== "refresh" ||
    !isValidIdentifier(payload.sessionId) ||
    !refreshSecretPattern.test(payload.sessionSecret || "") ||
    !Number.isSafeInteger(payload.version) ||
    payload.version < 0 ||
    !Object.values(SESSION_PERSISTENCE).includes(payload.persistence)
  ) {
    return null;
  }

  return payload;
}

export function isLegacyRefreshToken(token) {
  return legacyRefreshTokenPattern.test(token || "");
}

export function getRefreshVersionStatus({
  presentedVersion,
  currentVersion,
  previousVersion,
  previousExpiresAt,
  now = Date.now(),
}) {
  if (presentedVersion === currentVersion) {
    return "current";
  }

  if (
    presentedVersion === previousVersion &&
    previousExpiresAt instanceof Date &&
    previousExpiresAt.getTime() > now
  ) {
    return "previous";
  }

  return null;
}

export function getSessionExpiresAt(persistence, now = Date.now()) {
  const lifetime = persistence === SESSION_PERSISTENCE.PERSISTENT
    ? PERSISTENT_SESSION_LIFETIME_MS
    : BROWSER_SESSION_LIFETIME_MS;

  return new Date(now + lifetime);
}
