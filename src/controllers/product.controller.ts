import type { Request, Response } from "express";
import { HttpError } from "../middlewares/error.middleware.js";
import {
  createProduct,
  deleteProduct,
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

export async function deleteProductController(
  request: Request,
  response: Response,
) {
  const rawProductId = request.params.id;

  if (typeof rawProductId !== "string" || !/^\d+$/.test(rawProductId)) {
    throw new HttpError(400, "ID do produto inválido.");
  }

  const productId = BigInt(rawProductId);

  if (productId < 1n) {
    throw new HttpError(400, "ID do produto inválido.");
  }

  await deleteProduct(productId);
  response.status(200).json({ message: "Produto excluído com sucesso." });
}
