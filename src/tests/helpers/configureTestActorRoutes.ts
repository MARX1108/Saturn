import { Request, Response, NextFunction } from 'express';
import { actorsController } from '../controllers/actorsController';

// ... existing code ...

// ... existing code ...

(req: Request, res: Response, next: NextFunction) => {
  const updates: Partial<Pick<Actor, 'displayName' | 'summary' | 'icon'>> = {
    displayName: req.body.displayName,
    summary: req.body.summary,
  };
  actorsController.updateActor(req, res, next).catch(next); // Keep original controller method call
};
