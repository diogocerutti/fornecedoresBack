import { Router } from "express";
import {
  createProductController,
  listProductsController,
} from "../controllers/product.controller.js";
import { requireSession } from "../middlewares/auth.middleware.js";

export const productRouter = Router();

productRouter.get("/", requireSession, listProductsController);
productRouter.post("/", requireSession, createProductController);
