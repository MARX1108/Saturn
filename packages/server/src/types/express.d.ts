import { ActorService } from "../services/actorService";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      actorService?: ActorService;
    }
  }
}

export {};
