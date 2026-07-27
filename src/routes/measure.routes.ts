import { Router } from "express";
import { listMeasuresController } from "../controllers/measure.controller.js";
import { requireSession } from "../middlewares/auth.middleware.js";

export const measureRouter = Router();

measureRouter.get("/", requireSession, listMeasuresController);
