import { Router } from "express";
import {
  loginController,
  logoutController,
  refreshController,
  sessionController,
} from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", loginController);
authRouter.post("/refresh", refreshController);
authRouter.post("/logout", logoutController);
authRouter.get("/session", sessionController);
