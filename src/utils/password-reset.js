import "server-only";

import { createHash, randomBytes } from "crypto";

const passwordResetTokenPattern = /^[a-f0-9]{64}$/;

export function createPasswordResetToken() {
  return randomBytes(32).toString("hex");
}

export function hashPasswordResetToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function isValidPasswordResetToken(token) {
  return passwordResetTokenPattern.test(token);
}
