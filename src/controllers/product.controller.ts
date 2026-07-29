import type { Request, Response } from "express";
import { HttpError } from "../middlewares/error.middleware.js";
import {
  createProduct,
  listProducts,
} from "../services/product.service.js";
import { parseCreateProductInput } from "../validations/product.validation.js";

export async function listProductsController(
  _request: Request,
  response: Response,
) {
  const products = await listProducts();

  response.setHeader("Cache-Control", "no-store");
  response.status(200).json({ products });
}

export async function createProductController(
  request: Request,
  response: Response,
) {
  let input;

  try {
    input = parseCreateProductInput(request.body);
  } catch (error) {
    throw new HttpError(
      400,
      error instanceof Error ? error.message : "Dados do produto inválidos.",
    );
  }

  const product = await createProduct(input);
  response.status(201).json({ product });
}
