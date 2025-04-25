import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError, ErrorType } from '../utils/errors';

/**
 * Creates an Express middleware function to validate the request body against a Zod schema.
 *
 * @param schema The Zod schema to validate against.
 * @returns An Express RequestHandler.
 */
export const validateRequestBody = (schema: AnyZodObject): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log(`[Validator] Validating ${req.method} ${req.path} body...`);
    try {
      // Attempt to parse the request body
      schema.parse(req.body);
      console.log(
        `[Validator] Validation SUCCESS for ${req.path}. Calling next().`
      );
      // If parsing succeeds, move to the next middleware/handler
      next();
    } catch (error) {
      console.log(`[Validator] Validation FAILED for ${req.path}.`);
      // Check if the error is a ZodError
      if (error instanceof ZodError) {
        console.log(`[Validator] ZodError: ${JSON.stringify(error.errors)}`);
        // Format the Zod error into a more user-friendly structure
        // Pass a structured error to the global error handler
        const validationError = new AppError(
          'Validation failed',
          400,
          ErrorType.VALIDATION
        );
        console.log(`[Validator] Calling next(AppError) for ${req.path}.`);
        next(validationError);
      } else {
        console.log(`[Validator] Non-Zod Error: ${error}`);
        // If it's not a ZodError, pass it to the global error handler as an internal error
        const internalError = new AppError(
          'Internal Server Error during validation',
          500,
          ErrorType.INTERNAL_SERVER_ERROR
        );
        console.log(
          `[Validator] Calling next(InternalServerError) for ${req.path}.`
        );
        next(internalError);
      }
    }
  };
};

// Potential extensions: validateRequestQuery, validateRequestParams
