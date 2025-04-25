import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorType } from '../utils/errors';
import { ZodError } from 'zod';

// Update errorHandler to use type guards for better type inference

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): Response | void {
  console.error('Error:', err);

  // Type guard to check if err is an instance of AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      type: err.type,
      error: err.message,
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      type: ErrorType.VALIDATION,
      error: 'Validation failed',
      details: err.errors,
    });
  }

  // Type guard to check if err is a Multer error
  if (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    err.name === 'MulterError' &&
    'message' in err
  ) {
    return res.status(400).json({
      status: 'error',
      type: ErrorType.VALIDATION,
      error: `File upload error: ${String(err.message)}`,
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    status: 'error',
    type: ErrorType.SERVER_ERROR,
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err instanceof Error
          ? err.message
          : 'Unknown error',
  });
}
