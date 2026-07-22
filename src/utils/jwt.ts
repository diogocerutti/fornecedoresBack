import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

export type AccessTokenPayload = {
  sub: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
};

function encode(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(value: string): string {
  return createHmac("sha256", env.JWT_ACCESS_SECRET)
    .update(value)
    .digest("base64url");
}

export function createAccessToken(
  payload: Pick<AccessTokenPayload, "sub" | "email" | "roles">,
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: "HS256", typ: "JWT" });
  const body = encode({
    ...payload,
    iat: now,
    exp: now + ACCESS_TOKEN_TTL_SECONDS,
  });
  const unsignedToken = `${header}.${body}`;

  return `${unsignedToken}.${sign(unsignedToken)}`;
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const [header, body, signature] = token.split(".");

  if (!header || !body || !signature) {
    throw new Error("Token inválido.");
  }

  const expectedSignature = sign(`${header}.${body}`);
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    throw new Error("Token inválido.");
  }

  const payload = JSON.parse(
    Buffer.from(body, "base64url").toString("utf8"),
  ) as AccessTokenPayload;

  if (!payload.sub || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Token expirado.");
  }

  return payload;
}
