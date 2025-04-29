import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorType } from '../utils/errors';
import { ZodError } from 'zod';
import logger from '../utils/logger';

// Update errorHandler to use type guards for better type inference

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): Response | void {
  // Use structured logging to capture the full context
  const logContext = {
    err,
    path: req.path,
    method: req.method,
    ip: req.ip,
    requestId: req.headers['x-request-id'] || 'unknown',
  };

  // Type guard to check if err is an instance of AppError
  if (err instanceof AppError) {
    logger.error(
      {
        ...logContext,
        statusCode: err.statusCode,
        errorType: err.type,
      },
      `${err.type} error: ${err.message}`
    );

    return res.status(err.statusCode).json({
      status: 'error',
      type: err.type,
      error: err.message,
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    logger.error(
      {
        ...logContext,
        validationErrors: err.errors,
      },
      'Validation error'
    );

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
    logger.error(
      {
        ...logContext,
        multerError: err,
      },
      `File upload error: ${String(err.message)}`
    );

    return res.status(400).json({
      status: 'error',
      type: ErrorType.VALIDATION,
      error: `File upload error: ${String(err.message)}`,
    });
  }

  // Handle unknown errors - these are the most serious
  logger.error(logContext, 'Unhandled server error');

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
