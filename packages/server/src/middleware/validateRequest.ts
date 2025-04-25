import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AnyZodObject, ZodError, ZodType } from 'zod';
import { AppError, ErrorType } from '../utils/errors';

/**
 * Helper function to conditionally log messages only when not in test mode
 */
const log = (message: string): void => {
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
export const validateRequestBody = (
  schema: ZodType<any, any, any>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
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
      // Attempt to parse the request body
      schema.parse(req.body);
      log(`[Validator] Validation SUCCESS for ${req.path}. Calling next().`);
      // If parsing succeeds, move to the next middleware/handler
      next();
    } catch (error) {
      log(`[Validator] Validation FAILED for ${req.path}.`);
      // Check if the error is a ZodError
      if (error instanceof ZodError) {
        log(`[Validator] ZodError: ${JSON.stringify(error.errors)}`);
        // Format the Zod error into a more user-friendly structure
        // Pass a structured error to the global error handler
        const validationError = new AppError(
          'Validation failed',
          400,
          ErrorType.VALIDATION
        );
        log(`[Validator] Calling next(AppError) for ${req.path}.`);
        next(validationError);
      } else {
        log(`[Validator] Non-Zod Error: ${error}`);
        // If it's not a ZodError, pass it to the global error handler as an internal error
        const internalError = new AppError(
          'Internal Server Error during validation',
          500,
          ErrorType.INTERNAL_SERVER_ERROR
        );
        log(`[Validator] Calling next(InternalServerError) for ${req.path}.`);
        next(internalError);
      }
    }
  };
};

// Potential extensions: validateRequestQuery, validateRequestParams
