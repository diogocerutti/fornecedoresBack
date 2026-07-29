import { Router } from "express";
import {
  createProductController,
  deleteProductController,
  listProductsController,
  updateProductController,
} from "../controllers/product.controller.js";
import { requireSession } from "../middlewares/auth.middleware.js";

export const productRouter = Router();

productRouter.get("/", requireSession, listProductsController);
productRouter.post("/", requireSession, createProductController);
productRouter.put("/:id", requireSession, updateProductController);
productRouter.delete("/:id", requireSession, deleteProductController);
