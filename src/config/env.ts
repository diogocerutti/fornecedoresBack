import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("A variável de ambiente DATABASE_URL não foi definida.");
}

const port = Number(process.env.PORT ?? 3333);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("A variável PORT deve ser um número inteiro entre 1 e 65535.");
}

const nodeEnv = process.env.NODE_ENV ?? "development";
const accessTokenSecret =
  process.env.JWT_ACCESS_SECRET ?? "development-only-secret-change-me";

if (nodeEnv === "production" && !process.env.JWT_ACCESS_SECRET) {
  throw new Error(
    "A variável JWT_ACCESS_SECRET deve ser definida no ambiente de produção.",
  );
}

export const env = {
  DATABASE_URL: databaseUrl,
  PORT: port,
  NODE_ENV: nodeEnv,
  JWT_ACCESS_SECRET: accessTokenSecret,
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
} as const;
