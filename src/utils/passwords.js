import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, passwordHash) {
  const [salt, storedHash] = passwordHash.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const hashBuffer = Buffer.from(storedHash, "hex");
  const passwordBuffer = scryptSync(password, salt, 64);

  return (
    hashBuffer.length === passwordBuffer.length &&
    timingSafeEqual(hashBuffer, passwordBuffer)
  );
}
