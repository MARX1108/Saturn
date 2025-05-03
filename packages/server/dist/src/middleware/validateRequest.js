'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.validateRequestBody = validateRequestBody;
exports.validateRequestQuery = validateRequestQuery;
exports.validateRequestParams = validateRequestParams;
const errors_1 = require('../utils/errors');
/**
 * Helper function to conditionally log messages only when not in test mode
 */
const log = message => {
  // Skip logging in test mode
  if (process.env.NODE_ENV !== 'test') {
    console.log(message);
  }
};
/**
 * Creates an Express middleware function to validate the request body against a Zod schema.
 *
 * @param schema The Zod schema to validate against.
 * @returns An Express RequestHandler.
 */
function validateRequestBody(schema) {
  return (req, res, next) => {
    log(`[Validator] Validating ${req.method} ${req.path} body...`);
    // Skip validation for multipart/form-data requests (used for file uploads)
    const isMultipart =
      req.headers &&
      req.headers['content-type'] &&
      typeof req.headers['content-type'] === 'string' &&
      req.headers['content-type'].includes('multipart/form-data');
    if (isMultipart) {
      log(`[Validator] Skipping validation for multipart form data`);
      next();
      return;
    }
    try {
      // Try to parse and validate the request body
      const parseResult = schema.safeParse(req.body);
      if (!parseResult.success) {
        // If validation fails, create a 400 Bad Request error
        log(
          `[Validator] Validation failed: ${JSON.stringify(parseResult.error)}`
        );
        return res.status(400).json({
          error: 'Validation failed',
          details: parseResult.error.format(),
        });
      }
      // If validation succeeds, update req.body with the parsed data
      req.body = parseResult.data;
      log(`[Validator] Validation SUCCESS for ${req.path}. Calling next().`);
      next();
    } catch (error) {
      // This should rarely happen, as safeParse should handle most errors
      log(`[Validator] Unexpected error during validation: ${error}`);
      next(
        new errors_1.AppError(
          'Internal Server Error during validation',
          500,
          errors_1.ErrorType.INTERNAL_SERVER_ERROR
        )
      );
    }
  };
}
/**
 * Creates an Express middleware function to validate request query parameters against a Zod schema.
 * The function is type-erased to avoid TypeScript errors with transformations.
 *
 * @param schema The Zod schema to validate against.
 * @returns An Express RequestHandler.
 */
function validateRequestQuery(schema) {
  return (req, res, next) => {
    log(`[Validator] Validating ${req.method} ${req.path} query parameters...`);
    try {
      // Try to parse and validate the query parameters
      const parseResult = schema.safeParse(req.query);
      if (!parseResult.success) {
        // If validation fails, create a 400 Bad Request error
        log(
          `[Validator] Query validation failed: ${JSON.stringify(parseResult.error)}`
        );
        return res.status(400).json({
          error: 'Query validation failed',
          details: parseResult.error.format(),
        });
      }
      // If validation succeeds, update req.query with the parsed data
      // Use type assertion to ensure TypeScript accepts the assigned value
      req.query = parseResult.data;
      log(
        `[Validator] Query validation SUCCESS for ${req.path}. Calling next().`
      );
      next();
    } catch (error) {
      // This should rarely happen, as safeParse should handle most errors
      log(`[Validator] Unexpected error during query validation: ${error}`);
      next(
        new errors_1.AppError(
          'Internal Server Error during query validation',
          500,
          errors_1.ErrorType.INTERNAL_SERVER_ERROR
        )
      );
    }
  };
}
/**
 * Creates an Express middleware function to validate URL parameters against a Zod schema.
 *
 * @param schema The Zod schema to validate against.
 * @returns An Express RequestHandler.
 */
function validateRequestParams(schema) {
  return (req, res, next) => {
    log(`[Validator] Validating ${req.method} ${req.path} URL parameters...`);
    try {
      // Try to parse and validate the URL parameters
      const parseResult = schema.safeParse(req.params);
      if (!parseResult.success) {
        // Extract the custom error message if available
        let errorMessage = 'URL parameter validation failed';
        const error = parseResult.error;
        // Try to find the first custom error message from error issues
        const firstError = error.issues.find(issue => issue.message);
        if (firstError) {
          errorMessage = firstError.message;
        }
        log(
          `[Validator] URL parameter validation failed: ${JSON.stringify(error)}`
        );
        return res.status(400).json({
          error: errorMessage,
        });
      }
      // If validation succeeds, update req.params with the parsed data
      req.params = parseResult.data;
      log(
        `[Validator] URL parameter validation SUCCESS for ${req.path}. Calling next().`
      );
      next();
    } catch (error) {
      // This should rarely happen, as safeParse should handle most errors
      log(
        `[Validator] Unexpected error during URL parameter validation: ${error}`
      );
      next(
        new errors_1.AppError(
          'Internal Server Error during URL parameter validation',
          500,
          errors_1.ErrorType.INTERNAL_SERVER_ERROR
        )
      );
    }
  };
}
