import type { Request, Response } from "express";
import { HttpError } from "../middlewares/error.middleware.js";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from "../services/product.service.js";
import {
  parseCreateProductInput,
  parseProductId,
  parseUpdateProductInput,
} from "../validations/product.validation.js";

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
  let productId;

  try {
    productId = parseProductId(request.params.id);
  } catch (error) {
    throw new HttpError(
      400,
      error instanceof Error ? error.message : "ID do produto inválido.",
    );
  }

  await deleteProduct(productId);
  response.status(200).json({ message: "Produto excluído com sucesso." });
}

export async function updateProductController(
  request: Request,
  response: Response,
) {
  let productId;
  let input;

  try {
    productId = parseProductId(request.params.id);
    input = parseUpdateProductInput(request.body);
  } catch (error) {
    throw new HttpError(
      400,
      error instanceof Error ? error.message : "Dados do produto inválidos.",
    );
  }

  const product = await updateProduct(productId, input);
  response.status(200).json({
    product,
    message: "Produto atualizado com sucesso.",
  });
}
