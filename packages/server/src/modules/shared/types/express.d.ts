// Type extensions for Express Request object
import { Request } from "express";
import { ActorService } from "../../actors/services/actorService";
import { PostService } from "../../posts/services/postService";
import { ServiceContainer } from "../../../utils/container";

declare global {
  namespace Express {
    interface Request {
      services: ServiceContainer;
      // For backward compatibility with old code
      actorService?: ActorService;
      user?: {
        id: string;
        [key: string]: any;
      };
    }
  }
}