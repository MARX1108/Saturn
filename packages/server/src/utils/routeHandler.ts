import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Safely wraps an async controller method for use in Express route handlers
 * Addresses the ESLint no-misused-promises error by properly handling Promise returns
 *
 * @param fn The async controller function to wrap
 * @returns A void function safe to use in Express routes
 */
// Using a special typing to make ESLint happy with this function

export function wrapAsync<
  P = Record<string, unknown>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Record<string, unknown>,
>(
  handler: (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ) => Promise<void>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return (req, res, next): void => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
