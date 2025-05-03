'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.errorHandler = errorHandler;
const errors_1 = require('../utils/errors');
const zod_1 = require('zod');
const logger_1 = __importDefault(require('../utils/logger'));
// Update errorHandler to use type guards for better type inference
function errorHandler(err, req, res, _next) {
  // Use structured logging to capture the full context
  const logContext = {
    err,
    path: req.path,
    method: req.method,
    ip: req.ip,
    requestId: req.headers['x-request-id'] || 'unknown',
  };
  // Type guard to check if err is an instance of AppError
  if (err instanceof errors_1.AppError) {
    logger_1.default.error(
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
  if (err instanceof zod_1.ZodError) {
    logger_1.default.error(
      {
        ...logContext,
        validationErrors: err.errors,
      },
      'Validation error'
    );
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
    logger_1.default.error(
      {
        ...logContext,
        multerError: err,
      },
      `File upload error: ${String(err.message)}`
    );
    return res.status(400).json({
      status: 'error',
      type: errors_1.ErrorType.VALIDATION,
      error: `File upload error: ${String(err.message)}`,
    });
  }
  // Handle unknown errors - these are the most serious
  logger_1.default.error(logContext, 'Unhandled server error');
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
