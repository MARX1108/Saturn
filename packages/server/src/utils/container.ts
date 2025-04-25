import { Db } from 'mongodb';
import { ActorService } from '@/modules/actors/services/actorService';
import { ActorRepository } from '../modules/actors/repositories/actorRepository';
import { PostService } from '@/modules/posts/services/postService';
import { PostRepository } from '../modules/posts/repositories/postRepository';
import { AuthService } from '@/modules/auth/services/auth.service';
import { AuthRepository } from '@/modules/auth/repositories/auth.repository';
import { PostsController } from '@/modules/posts/controllers/postsController';
import { CommentsController } from '@/modules/comments/controllers/comments.controller';
import { CommentService } from '@/modules/comments/services/comment.service';
import { CommentRepository } from '@/modules/comments/repositories/comment.repository';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { NotificationRepository } from '../modules/notifications/repositories/notification.repository';
import { UploadService } from '../modules/media/services/upload.service';
import { ActivityPubService } from '@/modules/activitypub/services/activitypub.service';
import { WebfingerService } from '@/modules/webfinger/services/webfinger.service';
import { MediaService } from '../modules/media/services/media.service';
import { ActivityPubRepository } from '@/modules/activitypub/repositories/activitypub.repository';
import { WebfingerRepository } from '@/modules/webfinger/repositories/webfinger.repository';
import { MediaRepository } from '../modules/media/repositories/media.repository';
import path from 'path';
import { AuthController } from '@/modules/auth/controllers/authController';
import { ActorsController } from '@/modules/actors/controllers/actorsController';
import { ActivityPubController } from '@/modules/activitypub/controllers/activitypubController';
import { WebFingerController } from '@/modules/webfinger/controllers/webfingerController';
import { MediaController } from '../modules/media/controllers/media.controller';

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
  | 'webfingerService'
  | 'authController'
  | 'actorsController'
  | 'activityPubController'
  | 'webfingerController'
  | 'mediaController';

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
  mediaService: MediaService;
  activityPubService: ActivityPubService;
  webfingerService: WebfingerService;
  authController: AuthController;
  actorsController: ActorsController;
  activityPubController: ActivityPubController;
  webfingerController: WebFingerController;
  mediaController: MediaController;
  domain: string;

  // Method to resolve services by name for more flexible DI
  getService<T>(name: keyof ServiceContainer): T | null;
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
  // Define common paths
  const uploadPath = path.join(process.cwd(), 'uploads');

  // Repositories
  const uploadService = new UploadService();
  const actorRepository = new ActorRepository(db);
  const postRepository = new PostRepository(db);
  const authRepository = new AuthRepository(db);
  const commentRepository = new CommentRepository(db);
  const notificationRepository = new NotificationRepository(db);
  const activityPubRepository = new ActivityPubRepository(db, domain);
  const webfingerRepository = new WebfingerRepository(db);
  const mediaRepository = new MediaRepository(db);

  // Correct AuthService instantiation
  const authService = new AuthService(authRepository);
  const webfingerService = new WebfingerService(webfingerRepository, domain);
  const mediaService = new MediaService(mediaRepository, uploadPath);
  const activityPubService = new ActivityPubService(
    activityPubRepository,
    domain
  );

  // Instantiate services involved in circular dependencies with corrected constructors
  const actorService = new ActorService(actorRepository, domain);
  const postService = new PostService(
    postRepository,
    actorService,
    domain,
    actorRepository
  );
  const notificationService = new NotificationService(db, actorService);
  const commentService = new CommentService(commentRepository);

  // Set circular dependencies using setter methods
  actorService.setNotificationService(notificationService);
  postService.setNotificationService(notificationService);
  notificationService.setPostService(postService);
  notificationService.setCommentService(commentService);
  commentService.setPostService(postService);
  commentService.setActorService(actorService);
  commentService.setNotificationService(notificationService);

  // Instantiate controllers with correct dependencies
  const activityPubController = new ActivityPubController(
    actorService,
    activityPubService,
    domain
  );
  const webfingerController = new WebFingerController(
    actorService,
    webfingerService,
    domain
  );
  const mediaController = new MediaController(mediaService);
  const postsController = new PostsController(
    postService,
    actorService,
    uploadService,
    domain
  );
  const commentsController = new CommentsController(commentService);
  const authController = new AuthController(actorService, authService);
  const actorsController = new ActorsController(
    actorService,
    uploadService,
    postService,
    domain
  );

  // Container definition
  const serviceContainer: ServiceContainer = {
    authService,
    actorService,
    postService,
    commentService,
    notificationService,
    uploadService,
    mediaService,
    activityPubService,
    webfingerService,
    postsController,
    commentsController,
    authController,
    actorsController,
    activityPubController,
    webfingerController,
    mediaController,
    domain,
    getService: <T>(name: keyof ServiceContainer): T | null => {
      // Type-safe access using constrained key
      if (name in serviceContainer && name !== 'getService') {
        // Cast to T only after confirming existence and ensuring it's not the method itself
        return serviceContainer[name] as T;
      }
      return null;
    },
  };

  return serviceContainer;
}
