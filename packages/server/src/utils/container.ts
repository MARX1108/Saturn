import { Db } from "mongodb";
import { ActorService } from "../modules/actors/services/actorService";
import { PostService } from "../modules/posts/services/postService";
import { UploadService } from "../modules/media/services/upload.service";

/**
 * Service container for managing dependencies
 */
export interface ServiceContainer {
  actorService: ActorService;
  postService: PostService;
  uploadService: UploadService;
}

/**
 * Create service container with initialized services
 */
export function createServiceContainer(db: Db, domain: string): ServiceContainer {
  return {
    actorService: new ActorService(db, domain),
    postService: new PostService(db, domain),
    uploadService: new UploadService()
  };
}
