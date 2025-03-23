import { Request } from "express";
import { ActorService } from "../services/actorService";

declare global {
  namespace Express {
    interface Request {
      actorService?: ActorService;
    }
  }
}
