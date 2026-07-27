import type { Request, Response } from "express";
import { listMeasures } from "../services/measure.service.js";

export async function listMeasuresController(
  _request: Request,
  response: Response,
) {
  const measures = await listMeasures();

  response.setHeader("Cache-Control", "no-store");
  response.status(200).json({ measures });
}
