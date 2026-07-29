import { prisma } from "../config/prisma.js";
import { HttpError } from "../middlewares/error.middleware.js";
import type { CreateProductInput } from "../validations/product.validation.js";

const productSelection = {
  id: true,
  name: true,
  description: true,
  measure: {
    select: {
      id: true,
      name: true,
      abbreviation: true,
    },
  },
} as const;

function serializeProduct(product: {
  id: bigint;
  name: string;
  description: string | null;
  measure: {
    id: bigint;
    name: string;
    abbreviation: string;
  };
}) {
  return {
    ...product,
    id: product.id.toString(),
    measure: {
      ...product.measure,
      id: product.measure.id.toString(),
    },
  };
}

export async function listProducts() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: productSelection,
  });

  return products.map(serializeProduct);
}

export async function createProduct(input: CreateProductInput) {
  const measureExists = await prisma.measure.count({
    where: { id: input.measureId },
  });

  if (!measureExists) {
    throw new HttpError(400, "Unidade de medida não encontrada.");
  }

  const product = await prisma.product.create({
    data: {
      name: input.name,
      measureId: input.measureId,
      description: input.description,
    },
    select: productSelection,
  });

  return serializeProduct(product);
}

export async function deleteProduct(productId: bigint) {
  const result = await prisma.product.deleteMany({
    where: { id: productId },
  });

  if (result.count === 0) {
    throw new HttpError(404, "Produto não encontrado.");
  }
}
