import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      isOperational: err.isOperational,
    });
  }

  // Handle Multer errors
  if (err.name === "MulterError") {
    return res.status(400).json({
      status: "error",
      message: `File upload error: ${err.message}`,
    });
  }

  // Log unhandled errors
  console.error("Unhandled error:", err);

  // Don't expose internal details in production
  return res.status(500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
};

// Add to index.ts after route configuration
// app.use(errorHandler);
