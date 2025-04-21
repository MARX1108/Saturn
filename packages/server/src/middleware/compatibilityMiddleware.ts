import { Request, Response, NextFunction } from 'express';
import { ServiceContainer } from '../utils/container';
import { ActorService } from '@/modules/actors/services/actorService';

/**
 * Middleware to inject services into request object for backward compatibility
 * This maintains compatibility with older code that expects services directly on the request object
 */
export const compatibilityMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // We no longer need to assign actorService to req
  // Code using req.actorService should now use req.services.actorService

  // This middleware can be deprecated and eventually removed
  // as all code is updated to use the services container directly

  next();
};
