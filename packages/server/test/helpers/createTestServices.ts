import { DeepMockProxy, mock } from 'jest-mock-extended';
import { Db } from 'mongodb';

// Import repositories
import { AuthRepository } from '@/modules/auth/repositories/auth.repository';
import { ActorRepository } from '@/modules/actors/repositories/actorRepository';
import { PostRepository } from '@/modules/posts/repositories/postRepository';
import { CommentRepository } from '@/modules/comments/repositories/comment.repository';
import { NotificationRepository } from '@/modules/notifications/repositories/notification.repository';
import { MediaRepository } from '@/modules/media/repositories/media.repository';
import { ActivityPubRepository } from '@/modules/activitypub/repositories/activitypub.repository';

// Import services
import { AuthService } from '@/modules/auth/services/auth.service';
import { ActorService } from '@/modules/actors/services/actorService';
import { PostService } from '@/modules/posts/services/postService';
import { CommentService } from '@/modules/comments/services/comment.service';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { MediaService } from '@/modules/media/services/media.service';
import { UploadService } from '@/modules/media/services/upload.service';
import { ActivityPubService } from '@/modules/activitypub/services/activitypub.service';
import { WebfingerService } from '@/modules/webfinger/services/webfinger.service';

// Import controllers
import { AuthController } from '@/modules/auth/controllers/authController';
import { ActorsController } from '@/modules/actors/controllers/actorsController';
import { PostsController } from '@/modules/posts/controllers/postsController';
import { CommentsController } from '@/modules/comments/controllers/comments.controller';
import { MediaController } from '@/modules/media/controllers/media.controller';
import { ActivityPubController } from '@/modules/activitypub/controllers/activitypubController';
import { WebFingerController } from '@/modules/webfinger/controllers/webfingerController';
import { NotificationsController } from '@/modules/notifications/controllers/notifications.controller';

/**
 * Repository mocks for all services
 */
export interface RepositoryMocks {
  authRepository: DeepMockProxy<AuthRepository>;
  actorRepository: DeepMockProxy<ActorRepository>;
  postRepository: DeepMockProxy<PostRepository>;
  commentRepository: DeepMockProxy<CommentRepository>;
  notificationRepository: DeepMockProxy<NotificationRepository>;
  mediaRepository: DeepMockProxy<MediaRepository>;
  activityPubRepository: DeepMockProxy<ActivityPubRepository>;
}

/**
 * Services with real implementations but mocked repositories
 */
export interface Services {
  authService: AuthService;
  actorService: ActorService;
  postService: PostService;
  commentService: CommentService;
  notificationService: NotificationService;
  mediaService: MediaService;
  uploadService: UploadService;
  activityPubService: ActivityPubService;
  webfingerService: WebfingerService;
}

/**
 * Controllers with real implementations using real services
 */
export interface Controllers {
  authController: AuthController;
  actorsController: ActorsController;
  postsController: PostsController;
  commentsController: CommentsController;
  mediaController: MediaController;
  activityPubController: ActivityPubController;
  webfingerController: WebFingerController;
  notificationsController: NotificationsController;
}

/**
 * Create mocked repositories for testing
 */
export function createMockRepositories(): RepositoryMocks {
  return {
    authRepository: mock<AuthRepository>(),
    actorRepository: mock<ActorRepository>(),
    postRepository: mock<PostRepository>(),
    commentRepository: mock<CommentRepository>(),
    notificationRepository: mock<NotificationRepository>(),
    mediaRepository: mock<MediaRepository>(),
    activityPubRepository: mock<ActivityPubRepository>(),
  };
}

/**
 * Create real services with mocked repositories
 */
export function createServices(
  repositoryMocks: RepositoryMocks,
  domainName = 'test.domain'
): Services {
  const authService = new AuthService(repositoryMocks.authRepository);
  const actorService = new ActorService(repositoryMocks.actorRepository);
  const postService = new PostService(repositoryMocks.postRepository);
  const commentService = new CommentService(repositoryMocks.commentRepository);
  const notificationService = new NotificationService(
    repositoryMocks.notificationRepository
  );
  const mediaService = new MediaService(repositoryMocks.mediaRepository);
  const uploadService = new UploadService(mediaService, domainName);
  const activityPubService = new ActivityPubService(
    repositoryMocks.activityPubRepository,
    domainName
  );
  const webfingerService = new WebfingerService(actorService, domainName);

  // Set up service dependencies
  postService.setActorService(actorService);
  commentService.setActorService(actorService);
  commentService.setPostService(postService);
  notificationService.setActorService(actorService);
  notificationService.setPostService(postService);
  notificationService.setCommentService(commentService);

  return {
    authService,
    actorService,
    postService,
    commentService,
    notificationService,
    mediaService,
    uploadService,
    activityPubService,
    webfingerService,
  };
}

/**
 * Create real controllers using real services
 */
export function createControllers(services: Services): Controllers {
  return {
    authController: new AuthController(
      services.actorService,
      services.authService
    ),
    actorsController: new ActorsController(
      services.actorService,
      services.uploadService
    ),
    postsController: new PostsController(
      services.postService,
      services.uploadService
    ),
    commentsController: new CommentsController(services.commentService),
    mediaController: new MediaController(services.mediaService),
    activityPubController: new ActivityPubController(
      services.activityPubService,
      services.actorService,
      services.postService
    ),
    webfingerController: new WebFingerController(services.webfingerService),
    notificationsController: new NotificationsController(
      services.notificationService
    ),
  };
}

/**
 * A complete test setup with mocked repositories and real services/controllers
 */
export interface TestSetup {
  repositories: RepositoryMocks;
  services: Services;
  controllers: Controllers;
}

/**
 * Create a complete test setup with mocked repositories and real services/controllers
 */
export function createTestSetup(domainName = 'test.domain'): TestSetup {
  const repositories = createMockRepositories();
  const services = createServices(repositories, domainName);
  const controllers = createControllers(services);

  return {
    repositories,
    services,
    controllers,
  };
}

/**
 * Options for creating a test app
 */
export interface CreateTestAppOptions {
  repositoryMocks?: Partial<RepositoryMocks>;
  serviceMocks?: Partial<Services>;
  controllerMocks?: Partial<Controllers>;
  domainName?: string;
  db?: Db;
}

/**
 * Create a comprehensive test setup with customizable mocks at any level
 */
export function createCustomTestSetup(
  options: CreateTestAppOptions = {}
): TestSetup {
  const {
    repositoryMocks = {},
    serviceMocks = {},
    controllerMocks = {},
    domainName = 'test.domain',
  } = options;

  // Create base repositories, then override with custom mocks
  const repositories = {
    ...createMockRepositories(),
    ...repositoryMocks,
  };

  // Create services with repositories, then override with custom mocks
  const services = {
    ...createServices(repositories, domainName),
    ...serviceMocks,
  };

  // Create controllers with services, then override with custom mocks
  const controllers = {
    ...createControllers(services),
    ...controllerMocks,
  };

  return {
    repositories,
    services,
    controllers,
  };
}
