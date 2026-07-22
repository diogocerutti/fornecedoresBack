import { env } from "../config/env.js";

export const REFRESH_TOKEN_COOKIE = "refresh_token";

export function readCookie(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) return undefined;

  for (const cookie of cookieHeader.split(";")) {
    const separatorIndex = cookie.indexOf("=");
    if (separatorIndex < 0) continue;

    const cookieName = cookie.slice(0, separatorIndex).trim();
    if (cookieName === name) {
      return decodeURIComponent(cookie.slice(separatorIndex + 1).trim());
    }
  }

  return undefined;
}

export function createRefreshTokenCookie(
  token: string,
  expiresAt: Date,
  persistent: boolean,
): string {
  const parts = [
    `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "Path=/api/auth",
    "SameSite=Lax",
  ];

  if (persistent) parts.push(`Expires=${expiresAt.toUTCString()}`);

  if (env.NODE_ENV === "production") parts.push("Secure");

  return parts.join("; ");
}

export function clearRefreshTokenCookie(): string {
  const parts = [
    `${REFRESH_TOKEN_COOKIE}=`,
    "HttpOnly",
    "Path=/api/auth",
    "SameSite=Lax",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ];

  if (env.NODE_ENV === "production") parts.push("Secure");

  return parts.join("; ");
}
