import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { env } from "../config/env";
import { HttpError } from "../shared/http-error";

type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: unknown;
  };
};

const apiError = (
  code: string,
  message: string,
  requestId?: string,
  details?: unknown
): ApiErrorBody["error"] => {
  const body: ApiErrorBody["error"] = {
    code,
    message
  };

  if (requestId) {
    body.requestId = requestId;
  }

  if (details !== undefined) {
    body.details = details;
  }

  return body;
};

const requestIdFromResponse = (response: Response) => {
  const header = response.getHeader("x-request-id");
  return typeof header === "string" ? header : undefined;
};

export const errorHandler = (
  error: unknown,
  _request: Request,
  response: Response<ApiErrorBody>,
  _next: NextFunction
) => {
  const requestId = requestIdFromResponse(response);

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      error: apiError(error.code, error.message, requestId)
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? `CSV file exceeds the configured ${env.maxUploadMb}MB limit`
        : error.message;

    response.status(413).json({
      error: apiError(error.code, message, requestId)
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(422).json({
      error: apiError(
        "VALIDATION_ERROR",
        "The parsed import output did not match the expected schema",
        requestId,
        env.nodeEnv === "production" ? undefined : error.issues
      )
    });
    return;
  }

  const message =
    error instanceof Error && env.nodeEnv !== "production"
      ? error.message
      : "Unexpected server error";

  console.error("Unhandled API error", {
    requestId,
    name: error instanceof Error ? error.name : "UnknownError",
    message: error instanceof Error ? error.message : "Unknown error"
  });

  response.status(500).json({
    error: apiError("INTERNAL_SERVER_ERROR", message, requestId)
  });
};
