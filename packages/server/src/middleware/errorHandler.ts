import { Request, Response, NextFunction } from "express";
import { AppError, ErrorType } from "../utils/errors";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", err);

  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      type: err.type,
      message: err.message,
    });
  }

  // Handle Multer errors
  if (err.name === "MulterError") {
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
        : err.message,
  });
}
