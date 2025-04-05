import { Request } from "express";
import { ActorService } from "../services/actorService";
import { PostService } from "../services/postService";

declare global {
  namespace Express {
    interface Request {
      services: {
        actorService: ActorService;
        postService: PostService;
      };
      user: {
        id: string;
      };
    }
  }
}

export {};
