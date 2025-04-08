import { Request, Response, NextFunction } from "express";
import { ServiceContainer } from "../utils/container";

// Extend Express.Request to include our services
declare module "express" {
  interface Request {
    services: ServiceContainer;
  }
}

/**
 * Middleware to inject services into request object
 */
export const serviceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const services = req.app.get("services") as ServiceContainer;

  if (!services) {
    console.warn("Service container not found in app");
    return next();
  }

  // Attach services to request object
  req.services = services;

  next();
};
