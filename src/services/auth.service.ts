import { prisma } from "../config/prisma.js";
import { HttpError } from "../middlewares/error.middleware.js";
import {
  hashPassword,
  isBcryptPasswordHash,
  verifyPassword,
} from "../utils/hash.js";
import type { LoginInput } from "../validations/auth.validation.js";
import { createRefreshToken, issueAccessToken } from "./token.service.js";

export async function login(
  input: LoginInput,
  ipAddress?: string,
  userAgent?: string,
) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { userRoles: { include: { role: true } } },
  });

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new HttpError(401, "E-mail ou senha inválidos.");
  }

  if (!user.active) {
    throw new HttpError(403, "Este usuário está inativo.");
  }

  const refreshToken = await createRefreshToken(
    user.id,
    input.remember,
    ipAddress,
    userAgent,
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLogin: new Date(),
      ...(!isBcryptPasswordHash(user.passwordHash) && {
        passwordHash: await hashPassword(input.password),
      }),
    },
  });

  return {
    accessToken: issueAccessToken(user),
    refreshToken,
    user: {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      roles: user.userRoles.map(({ role }) => role.name),
    },
  };
}
