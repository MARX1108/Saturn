import { ActorService } from "../modules/actors/services/actorService";

declare global {
  namespace Express {
    interface Request {
      actorService?: ActorService;
    }
  }
}