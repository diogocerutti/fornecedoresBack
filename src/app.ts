import express, { type NextFunction, type Request, type Response } from "express";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { authRouter } from "./routes/auth.routes.js";

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use((request, response, next) => {
  const origin = request.get("origin");

  if (origin === env.FRONTEND_ORIGIN) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Vary", "Origin");
  }

  if (request.method === "OPTIONS") {
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    response.status(204).send();
    return;
  }

  next();
});
app.use(express.json());

app.get("/", (_request: Request, response: Response) => {
  response.status(200).json({
    message: "API Fornecedores em funcionamento.",
  });
});

app.get(
  "/health",
  async (_request: Request, response: Response, next: NextFunction) => {
    try {
      await prisma.$queryRaw`SELECT 1`;

      response.status(200).json({
        status: "ok",
        database: "connected",
      });
    } catch (error) {
      next(error);
    }
  },
);

app.use("/api/auth", authRouter);

app.use((_request: Request, response: Response) => {
  response.status(404).json({ message: "Rota não encontrada." });
});

app.use(errorMiddleware);

export default app;
