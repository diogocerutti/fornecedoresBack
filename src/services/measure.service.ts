import { prisma } from "../config/prisma.js";

export async function listMeasures() {
  const measures = await prisma.measure.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      abbreviation: true,
    },
  });

  return measures.map((measure) => ({
    ...measure,
    id: measure.id.toString(),
  }));
}
