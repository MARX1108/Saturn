import { Request, Response, NextFunction } from "express";
import { ServiceContainer } from "../utils/container";

// Extend Express.Request to include our services
declare global {
  namespace Express {
    interface Request {
      services: ServiceContainer;
    }
  }
}

/**
 * Middleware that adds the service container to the request object
 */
export function serviceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const services = req.app.get("services") as ServiceContainer;

  if (!services) {
    return res.status(500).json({ error: "Service container not available" });
  }

  req.services = services;
  next();
}
