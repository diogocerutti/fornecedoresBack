import type { Server } from "node:http";
import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

let server: Server | undefined;
let isShuttingDown = false;

async function startServer(): Promise<void> {
  await prisma.$connect();

  server = app.listen(env.PORT, () => {
    console.log(`Servidor executando em http://localhost:${env.PORT}`);
  });
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Sinal ${signal} recebido. Encerrando o servidor...`);

  if (!server) {
    await prisma.$disconnect();
    process.exit(0);
  }

  server.close(async (error) => {
    await prisma.$disconnect();

    if (error) {
      console.error("Erro ao encerrar o servidor:", error);
      process.exit(1);
    }

    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

startServer().catch(async (error: unknown) => {
  console.error("Não foi possível iniciar o servidor:", error);
  await prisma.$disconnect();
  process.exit(1);
});
