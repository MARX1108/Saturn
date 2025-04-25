'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.createServiceContainer = createServiceContainer;
const actorService_1 = require('@/modules/actors/services/actorService');
const actorRepository_1 = require('../modules/actors/repositories/actorRepository');
const postService_1 = require('@/modules/posts/services/postService');
const postRepository_1 = require('../modules/posts/repositories/postRepository');
const auth_service_1 = require('@/modules/auth/services/auth.service');
const auth_repository_1 = require('@/modules/auth/repositories/auth.repository');
const postsController_1 = require('@/modules/posts/controllers/postsController');
const comments_controller_1 = require('@/modules/comments/controllers/comments.controller');
const comment_service_1 = require('@/modules/comments/services/comment.service');
const comment_repository_1 = require('@/modules/comments/repositories/comment.repository');
const notification_service_1 = require('@/modules/notifications/services/notification.service');
const notification_repository_1 = require('../modules/notifications/repositories/notification.repository');
const upload_service_1 = require('../modules/media/services/upload.service');
const activitypub_service_1 = require('@/modules/activitypub/services/activitypub.service');
const webfinger_service_1 = require('@/modules/webfinger/services/webfinger.service');
const media_service_1 = require('../modules/media/services/media.service');
const activitypub_repository_1 = require('@/modules/activitypub/repositories/activitypub.repository');
const webfinger_repository_1 = require('@/modules/webfinger/repositories/webfinger.repository');
const media_repository_1 = require('../modules/media/repositories/media.repository');
const path_1 = __importDefault(require('path'));
const authController_1 = require('@/modules/auth/controllers/authController');
const actorsController_1 = require('@/modules/actors/controllers/actorsController');
const activitypubController_1 = require('@/modules/activitypub/controllers/activitypubController');
const webfingerController_1 = require('@/modules/webfinger/controllers/webfingerController');
const media_controller_1 = require('../modules/media/controllers/media.controller');
/**
 * Create service container with initialized services
 * Uses proper dependency injection pattern where services receive their dependencies
 * rather than creating them internally
 */
function createServiceContainer(db, domain) {
  // Define common paths
  const uploadPath = path_1.default.join(process.cwd(), 'uploads');
  // Repositories
  const uploadService = new upload_service_1.UploadService();
  const actorRepository = new actorRepository_1.ActorRepository(db);
  const postRepository = new postRepository_1.PostRepository(db);
  const authRepository = new auth_repository_1.AuthRepository(db);
  const commentRepository = new comment_repository_1.CommentRepository(db);
  const notificationRepository =
    new notification_repository_1.NotificationRepository(db);
  const activityPubRepository =
    new activitypub_repository_1.ActivityPubRepository(db, domain);
  const webfingerRepository = new webfinger_repository_1.WebfingerRepository(
    db
  );
  const mediaRepository = new media_repository_1.MediaRepository(db);
  // Correct AuthService instantiation
  const authService = new auth_service_1.AuthService(authRepository);
  const webfingerService = new webfinger_service_1.WebfingerService(
    webfingerRepository,
    domain
  );
  const mediaService = new media_service_1.MediaService(
    mediaRepository,
    uploadPath
  );
  const activityPubService = new activitypub_service_1.ActivityPubService(
    activityPubRepository,
    domain
  );
  // Instantiate services involved in circular dependencies with corrected constructors
  const actorService = new actorService_1.ActorService(actorRepository, domain);
  const postService = new postService_1.PostService(
    postRepository,
    actorService,
    domain,
    actorRepository
  );
  const notificationService = new notification_service_1.NotificationService(
    db,
    actorService
  );
  const commentService = new comment_service_1.CommentService(
    commentRepository
  );
  // Set circular dependencies using setter methods
  actorService.setNotificationService(notificationService);
  postService.setNotificationService(notificationService);
  notificationService.setPostService(postService);
  notificationService.setCommentService(commentService);
  commentService.setPostService(postService);
  commentService.setActorService(actorService);
  commentService.setNotificationService(notificationService);
  // Instantiate controllers with correct dependencies
  const activityPubController =
    new activitypubController_1.ActivityPubController(
      actorService,
      activityPubService,
      domain
    );
  const webfingerController = new webfingerController_1.WebFingerController(
    actorService,
    webfingerService,
    domain
  );
  const mediaController = new media_controller_1.MediaController(mediaService);
  const postsController = new postsController_1.PostsController(
    postService,
    actorService,
    uploadService,
    domain
  );
  const commentsController = new comments_controller_1.CommentsController(
    commentService
  );
  const authController = new authController_1.AuthController(
    actorService,
    authService
  );
  const actorsController = new actorsController_1.ActorsController(
    actorService,
    uploadService,
    postService,
    domain
  );
  // Container definition
  const serviceContainer = {
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
    getService: name => {
      // Type-safe access using constrained key
      if (name in serviceContainer && name !== 'getService') {
        // Cast to T only after confirming existence and ensuring it's not the method itself
        return serviceContainer[name];
      }
      return null;
    },
  };
  return serviceContainer;
}
