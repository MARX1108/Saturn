import { ActorService } from "../services/actorService";
import { PostService } from "../services/postService";
import { Db } from "mongodb";

export interface ServiceContainer {
  actorService: ActorService;
  postService: PostService;
}

export function createServiceContainer(
  db: Db,
  domain: string
): ServiceContainer {
  const actorService = new ActorService(db, domain);
  const postService = new PostService(db, domain);

  return {
    actorService,
    postService,
  };
}
