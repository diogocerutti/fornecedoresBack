export type CreateProductInput = {
  name: string;
  measureId: bigint;
  description?: string;
};

export type UpdateProductInput = CreateProductInput;

export function parseCreateProductInput(body: unknown): CreateProductInput {
  if (!body || typeof body !== "object") {
    throw new Error("Informe os dados do produto.");
  }

  const input = body as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const description =
    typeof input.description === "string" ? input.description.trim() : "";

  if (!name || name.length > 160) {
    throw new Error("Informe um nome com até 160 caracteres.");
  }

  if (description.length > 5_000) {
    throw new Error("A descrição deve ter até 5.000 caracteres.");
  }

  let measureId: bigint;

  try {
    measureId = BigInt(
      typeof input.measureId === "number"
        ? input.measureId
        : String(input.measureId ?? ""),
    );
  } catch {
    throw new Error("Selecione uma unidade de medida válida.");
  }

  if (measureId < 1n) {
    throw new Error("Selecione uma unidade de medida válida.");
  }

  return {
    name,
    measureId,
    ...(description && { description }),
  };
}

export function parseUpdateProductInput(body: unknown): UpdateProductInput {
  return parseCreateProductInput(body);
}

export function parseProductId(value: unknown) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new Error("ID do produto inválido.");
  }

  const productId = BigInt(value);

  if (productId < 1n) {
    throw new Error("ID do produto inválido.");
  }

  return productId;
}
