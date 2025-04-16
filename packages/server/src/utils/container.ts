import { Db } from 'mongodb';
import { ActorService } from '../modules/actors/services/actorService';
import { ActorRepository } from '../modules/actors/repositories/actorRepository';
import { PostService } from '../modules/posts/services/postService';
import { PostRepository } from '../modules/posts/repositories/postRepository';
import { AuthService } from '../modules/auth/services/auth.service';
import { AuthRepository } from '../modules/auth/repositories/auth.repository';
import { PostsController } from '../modules/posts/controllers/postsController';
import { CommentsController } from '../modules/comments/controllers/comments.controller';
import { CommentService } from '../modules/comments/services/comment.service';
import { CommentRepository } from '../modules/comments/repositories/comment.repository';
import { NotificationService } from '../modules/notifications/services/notification.service';
import { NotificationRepository } from '../modules/notifications/repositories/notification.repository';
import { UploadService } from '../modules/media/services/upload.service';

/**
 * Available services that can be resolved from the container
 */
export type ServiceType =
  | 'actorService'
  | 'postService'
  | 'uploadService'
  | 'authService'
  | 'postsController'
  | 'commentsController'
  | 'commentService'
  | 'notificationService'
  | 'mediaService'
  | 'activityPubService'
  | 'webfingerService';

/**
 * Available repositories that can be resolved from the container
 */
export type RepositoryType =
  | 'actorRepository'
  | 'postRepository'
  | 'mediaRepository'
  | 'authRepository'
  | 'notificationRepository'
  | 'commentRepository';

/**
 * Service container for managing dependencies
 */
export interface ServiceContainer {
  // Services
  actorService: ActorService;
  postService: PostService;
  authService: AuthService;
  postsController: PostsController;
  commentsController: CommentsController;
  commentService: CommentService;
  notificationService: NotificationService;
  uploadService: UploadService;
  mediaService: any; // TODO: Add proper type
  activityPubService: any; // TODO: Add proper type
  webfingerService: any; // TODO: Add proper type

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
  domain: string
): ServiceContainer {
  // Create repositories
  const actorRepository = new ActorRepository(db);
  const postRepository = new PostRepository(db);
  const authRepository = new AuthRepository(db);
  const commentRepository = new CommentRepository(db);
  const notificationRepository = new NotificationRepository(db);

  // Create base services
  const uploadService = new UploadService();
  const authService = new AuthService(authRepository);

  // Create services with proper initialization order
  // First create NotificationService without ActorService
  const notificationService = new NotificationService(notificationRepository);

  // Create ActorService with domain
  const actorService = new ActorService(
    actorRepository,
    notificationService,
    domain
  );

  // Set ActorService back into NotificationService
  notificationService.setActorService(actorService);

  // Create remaining services
  const postService = new PostService(
    postRepository,
    actorService,
    notificationService,
    domain
  );
  const commentService = new CommentService(
    commentRepository,
    postService,
    actorService,
    notificationService
  );

  // Create controllers with dependencies
  const postsController = new PostsController(
    postService,
    actorService,
    uploadService,
    domain
  );

  const commentsController = new CommentsController(commentService);

  // Create the container with all services
  const container: ServiceContainer = {
    actorService,
    postService,
    authService,
    postsController,
    commentsController,
    commentService,
    notificationService,
    uploadService,
    mediaService: undefined, // TODO: Add proper implementation
    activityPubService: undefined, // TODO: Add proper implementation
    webfingerService: undefined, // TODO: Add proper implementation

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
