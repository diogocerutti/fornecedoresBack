import { createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export function isBcryptPasswordHash(value: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  if (isBcryptPasswordHash(passwordHash)) {
    return bcrypt.compare(password, passwordHash);
  }

  const passwordBuffer = Buffer.from(password, "utf8");
  const legacyBuffer = Buffer.from(passwordHash, "utf8");

  return (
    passwordBuffer.length === legacyBuffer.length &&
    timingSafeEqual(passwordBuffer, legacyBuffer)
  );
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
