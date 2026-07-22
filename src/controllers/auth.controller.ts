import type { Request, Response } from "express";
import { HttpError } from "../middlewares/error.middleware.js";
import { login } from "../services/auth.service.js";
import {
  revokeRefreshToken,
  rotateRefreshToken,
} from "../services/token.service.js";
import {
  clearRefreshTokenCookie,
  createRefreshTokenCookie,
  readCookie,
  REFRESH_TOKEN_COOKIE,
} from "../utils/cookies.js";
import { parseLoginInput } from "../validations/auth.validation.js";

function getRequestMetadata(request: Request) {
  return {
    ipAddress: request.ip,
    userAgent: request.get("user-agent"),
  };
}

export async function loginController(request: Request, response: Response) {
  let input;
  try {
    input = parseLoginInput(request.body);
  } catch (error) {
    throw new HttpError(
      400,
      error instanceof Error ? error.message : "Dados de acesso inválidos.",
    );
  }

  const metadata = getRequestMetadata(request);
  const result = await login(
    input,
    metadata.ipAddress,
    metadata.userAgent,
  );

  response.setHeader(
    "Set-Cookie",
    createRefreshTokenCookie(
      result.refreshToken.token,
      result.refreshToken.expiresAt,
      result.refreshToken.persistent,
    ),
  );
  response.status(200).json({
    accessToken: result.accessToken,
    user: result.user,
  });
}

export async function refreshController(request: Request, response: Response) {
  const token = readCookie(request.get("cookie"), REFRESH_TOKEN_COOKIE);
  if (!token) throw new HttpError(401, "Sessão não encontrada.");

  const metadata = getRequestMetadata(request);
  const result = await rotateRefreshToken(
    token,
    metadata.ipAddress,
    metadata.userAgent,
  );

  response.setHeader(
    "Set-Cookie",
    createRefreshTokenCookie(
      result.refreshToken.token,
      result.refreshToken.expiresAt,
      result.refreshToken.persistent,
    ),
  );
  response.status(200).json({ accessToken: result.accessToken });
}

export async function logoutController(request: Request, response: Response) {
  const token = readCookie(request.get("cookie"), REFRESH_TOKEN_COOKIE);
  if (token) await revokeRefreshToken(token);

  response.setHeader("Set-Cookie", clearRefreshTokenCookie());
  response.status(204).send();
}
