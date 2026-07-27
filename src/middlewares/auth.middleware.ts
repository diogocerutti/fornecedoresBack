import type { NextFunction, Request, Response } from "express";
import { getSession } from "../services/token.service.js";
import {
  readCookie,
  REFRESH_TOKEN_COOKIE,
} from "../utils/cookies.js";
import { verifyAccessToken, type AccessTokenPayload } from "../utils/jwt.js";

export type AuthenticatedRequest = Request & { auth?: AccessTokenPayload };

export function requireAuth(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) {
  const authorization = request.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : undefined;

  if (!token) {
    response.status(401).json({ message: "Autenticação necessária." });
    return;
  }

  try {
    request.auth = verifyAccessToken(token);
    next();
  } catch {
    response.status(401).json({ message: "Token inválido ou expirado." });
  }
}

export async function requireSession(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const token = readCookie(request.get("cookie"), REFRESH_TOKEN_COOKIE);

  if (!token) {
    response.status(401).json({ message: "Sessão não encontrada." });
    return;
  }

  try {
    await getSession(token);
    next();
  } catch (error) {
    next(error);
  }
}
