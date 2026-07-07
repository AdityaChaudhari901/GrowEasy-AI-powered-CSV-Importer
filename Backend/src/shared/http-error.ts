export class HttpError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly isOperational = true;

  constructor(statusCode: number, message: string, code = "HTTP_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
