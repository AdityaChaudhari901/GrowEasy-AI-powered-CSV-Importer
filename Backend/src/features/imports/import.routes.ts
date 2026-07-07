import { Router } from "express";
import multer from "multer";
import { maxUploadBytes } from "../../config/env";
import { asyncHandler } from "../../shared/async-handler";
import { HttpError } from "../../shared/http-error";
import { extractImportController } from "./import.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxUploadBytes,
    files: 1
  },
  fileFilter(_request, file, callback) {
    const lowerName = file.originalname.toLowerCase();
    const isCsv =
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      lowerName.endsWith(".csv");

    if (!isCsv) {
      callback(
        new HttpError(415, "Only CSV files are supported", "UNSUPPORTED_FILE")
      );
      return;
    }

    callback(null, true);
  }
});

export const importRouter = Router();

importRouter.post(
  "/extract",
  upload.single("file"),
  asyncHandler(extractImportController)
);
