import { Request, Response, NextFunction } from "express";
import { AppError, ErrorType } from "../utils/errors";

// Update errorHandler to use type guards for better type inference

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response | void {
  console.error("Error:", err);

  // Type guard to check if err is an instance of AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      type: err.type,
      message: err.message,
    });
  }

  // Type guard to check if err is a Multer error
  if (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    err.name === "MulterError" &&
    "message" in err
  ) {
    return res.status(400).json({
      status: "error",
      type: ErrorType.VALIDATION,
      message: `File upload error: ${err.message}`,
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    status: "error",
    type: ErrorType.SERVER_ERROR,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : (err instanceof Error ? err.message : "Unknown error"),
  });
}
