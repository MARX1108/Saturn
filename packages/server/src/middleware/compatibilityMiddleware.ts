import { Request, Response, NextFunction } from "express";
import { ServiceContainer } from "../utils/container";

/**
 * Middleware to inject services into request object for backward compatibility
 * This maintains compatibility with older code that expects services directly on the request object
 */
export const compatibilityMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const services = req.services as ServiceContainer;

  if (services) {
    // Add commonly used services directly to the request for backward compatibility
    req.actorService = services.actorService;

    // Any other services that might be directly accessed on req can be added here
  }

  next();
};
