'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.validateRequestBody = validateRequestBody;
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
// Potential extensions: validateRequestQuery, validateRequestParams
