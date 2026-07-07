import type { Request, Response } from "express";
import { extractImportFromBuffer } from "./import.service";

export const extractImportController = async (
  request: Request,
  response: Response
) => {
  if (!request.file) {
    response.status(400).json({
      error: {
        code: "MISSING_FILE",
        message: "Upload a CSV file using the form field named file"
      }
    });
    return;
  }

  const result = await extractImportFromBuffer({
    buffer: request.file.buffer,
    originalName: request.file.originalname
  });

  response.json(result);
};
