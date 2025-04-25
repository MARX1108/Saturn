'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.errorHandler = errorHandler;
const errors_1 = require('../utils/errors');
const zod_1 = require('zod');
// Update errorHandler to use type guards for better type inference
function errorHandler(err, req, res, _next) {
  console.error('Error:', err);
  // Type guard to check if err is an instance of AppError
  if (err instanceof errors_1.AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      type: err.type,
      error: err.message,
    });
  }
  // Handle Zod validation errors
  if (err instanceof zod_1.ZodError) {
    return res.status(400).json({
      status: 'error',
      type: errors_1.ErrorType.VALIDATION,
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
      type: errors_1.ErrorType.VALIDATION,
      error: `File upload error: ${String(err.message)}`,
    });
  }
  // Handle unknown errors
  return res.status(500).json({
    status: 'error',
    type: errors_1.ErrorType.SERVER_ERROR,
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err instanceof Error
          ? err.message
          : 'Unknown error',
  });
}
