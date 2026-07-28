import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export const maximumPasswordLength = 128;

export function isValidNewPassword(password) {
  return password.length >= 8 && password.length <= maximumPasswordLength;
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, passwordHash) {
  if (!password || password.length > maximumPasswordLength) {
    return false;
  }

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
