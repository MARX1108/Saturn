import { Db } from "mongodb";
import { ActorService } from "../modules/actors/services/actorService";
import { ActorRepository } from "../modules/actors/repositories/actorRepository";
import { PostService } from "../modules/posts/services/postService";
import { PostRepository } from "../modules/posts/repositories/postRepository";
import { UploadService } from "../modules/media/services/upload.service";
import { MediaService } from "../modules/media/services/media.service";
import { MediaRepository } from "../modules/media/repositories/media.repository";
import { AuthService } from "../modules/auth/services/auth.service";
import { AuthRepository } from "../modules/auth/repositories/auth.repository";
import { WebfingerService } from "../modules/webfinger/services/webfinger.service";
import { ActivityPubService } from "../modules/activitypub/services/activitypub.service";
import { WebfingerRepository } from "../modules/webfinger/repositories/webfinger.repository";
import { ActivityPubRepository } from "../modules/activitypub/repositories/activitypub.repository";

/**
 * Available services that can be resolved from the container
 */
export type ServiceType =
  | "actorService"
  | "postService"
  | "uploadService"
  | "mediaService"
  | "authService"
  | "webfingerService"
  | "activityPubService";

/**
 * Available repositories that can be resolved from the container
 */
export type RepositoryType =
  | "actorRepository"
  | "postRepository"
  | "mediaRepository"
  | "authRepository";

/**
 * Service container for managing dependencies
 */
export interface ServiceContainer {
  // Services
  actorService: ActorService;
  postService: PostService;
  uploadService: UploadService;
  mediaService: MediaService;
  authService: AuthService;
  webfingerService: WebfingerService;
  activityPubService: ActivityPubService;

  // Method to resolve services by name for more flexible DI
  getService<T>(name: ServiceType | string): T | null;
}

/**
 * Create service container with initialized services
 * Uses proper dependency injection pattern where services receive their dependencies
 * rather than creating them internally
 */
export function createServiceContainer(
  db: Db,
  domain: string,
): ServiceContainer {
  // First initialize all repositories
  const actorRepository = new ActorRepository(db);
  const postRepository = new PostRepository(db);
  const mediaRepository = new MediaRepository(db);
  const authRepository = new AuthRepository(db);
  const webfingerRepository = new WebfingerRepository(db);
  const activityPubRepository = new ActivityPubRepository(db, domain);

  // Then initialize services with their dependencies
  const actorService = new ActorService(actorRepository, domain);
  const postService = new PostService(postRepository, domain);
  const uploadService = new UploadService();
  const mediaService = new MediaService(
    mediaRepository,
    process.env.UPLOAD_PATH || "./uploads",
  );
  const authService = new AuthService(authRepository);
  const webfingerService = new WebfingerService(webfingerRepository, domain);
  const activityPubService = new ActivityPubService(
    activityPubRepository,
    domain,
  );

  // Create the container with all services
  const container: ServiceContainer = {
    actorService,
    postService,
    uploadService,
    mediaService,
    authService,
    webfingerService,
    activityPubService,

    // Implement getService method for flexible service resolution
    getService<T>(name: ServiceType | string): T | null {
      // Cast to the correct type
      if (name in this) {
        return (this as any)[name] as T;
      }
      return null;
    },
  };

  return container;
}
