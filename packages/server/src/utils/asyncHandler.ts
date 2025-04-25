import { Request, Response, NextFunction } from 'express';

/**
 * Utility for safely wrapping async Express route handlers
 * This wrapper ensures proper Promise handling and error propagation
 */
export const asyncHandler =
  (
    fn: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<void | Response<unknown, Record<string, unknown>>>
  ) =>
  (req: Request, res: Response, next: NextFunction): void => {
    void Promise.resolve(fn(req, res, next)).catch(next);
  };
