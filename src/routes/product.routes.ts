import { Router } from "express";
import {
  createProductController,
  deleteProductController,
  listProductsController,
} from "../controllers/product.controller.js";
import { requireSession } from "../middlewares/auth.middleware.js";

export const productRouter = Router();

productRouter.get("/", requireSession, listProductsController);
productRouter.post("/", requireSession, createProductController);
productRouter.delete("/:id", requireSession, deleteProductController);
