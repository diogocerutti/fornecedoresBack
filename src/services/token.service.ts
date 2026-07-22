import { randomBytes } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../middlewares/error.middleware.js";
import { hashToken } from "../utils/hash.js";
import { createAccessToken } from "../utils/jwt.js";

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

type TokenUser = {
  id: bigint;
  email: string;
  active: boolean;
  userRoles: Array<{ role: { name: string } }>;
};

export function issueAccessToken(user: TokenUser): string {
  return createAccessToken({
    sub: user.id.toString(),
    email: user.email,
    roles: user.userRoles.map(({ role }) => role.name),
  });
}

export async function createRefreshToken(
  userId: bigint,
  remember: boolean,
  ipAddress?: string,
  userAgent?: string,
) {
  const token = randomBytes(48).toString("base64url");
  const expiresAt = new Date(
    Date.now() + (remember ? 30 : 1) * DAY_IN_MILLISECONDS,
  );

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
      ipAddress: ipAddress?.slice(0, 50),
      userAgent,
    },
  });

  return { token, expiresAt, persistent: remember };
}

export async function rotateRefreshToken(
  token: string,
  ipAddress?: string,
  userAgent?: string,
) {
  const storedToken = await prisma.refreshToken.findFirst({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        include: { userRoles: { include: { role: true } } },
      },
    },
  });

  if (
    !storedToken ||
    storedToken.revoked ||
    storedToken.expiresAt <= new Date() ||
    !storedToken.user.active
  ) {
    throw new HttpError(401, "Sessão inválida ou expirada.");
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  const remember =
    storedToken.expiresAt.getTime() - storedToken.createdAt.getTime() >
    2 * DAY_IN_MILLISECONDS;
  const refreshToken = await createRefreshToken(
    storedToken.userId,
    remember,
    ipAddress,
    userAgent,
  );

  return {
    accessToken: issueAccessToken(storedToken.user),
    refreshToken,
  };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(token), revoked: false },
    data: { revoked: true },
  });
}
