import { Request, Response, NextFunction } from 'express';
import { ActorService } from '../modules/actors/services/actorService';

/**
 * Middleware to inject services into request object for backward compatibility
 */
export const compatibilityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const db = req.app.get('db');
  const domain = req.app.get('domain');
  
  if (db && domain) {
    req.actorService = new ActorService(db, domain);
  }
  
  next();
};