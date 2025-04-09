import { Request, Response, NextFunction } from "express";
import { ServiceContainer } from "../utils/container";
// Explicitly import the centralized type definitions to ensure TypeScript recognizes them
import "../types/express";

/**
 * Middleware to inject services into request object for backward compatibility
 * This maintains compatibility with older code that expects services directly on the request object
 */
export const compatibilityMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const services = req.services;

  if (services) {
    req.actorService = services.actorService;
  }

  next();
};
