'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.createServiceContainer = createServiceContainer;
const actorService_1 = require('../modules/actors/services/actorService');
const actorRepository_1 = require('../modules/actors/repositories/actorRepository');
const postService_1 = require('../modules/posts/services/postService');
const postRepository_1 = require('../modules/posts/repositories/postRepository');
const auth_service_1 = require('../modules/auth/services/auth.service');
const auth_repository_1 = require('../modules/auth/repositories/auth.repository');
const postsController_1 = require('../modules/posts/controllers/postsController');
const comments_controller_1 = require('../modules/comments/controllers/comments.controller');
const comment_service_1 = require('../modules/comments/services/comment.service');
const comment_repository_1 = require('../modules/comments/repositories/comment.repository');
const notification_service_1 = require('../modules/notifications/services/notification.service');
const notification_repository_1 = require('../modules/notifications/repositories/notification.repository');
const upload_service_1 = require('../modules/media/services/upload.service');
const activitypub_service_1 = require('../modules/activitypub/services/activitypub.service');
const webfinger_service_1 = require('../modules/webfinger/services/webfinger.service');
const media_service_1 = require('../modules/media/services/media.service');
const activitypub_repository_1 = require('../modules/activitypub/repositories/activitypub.repository');
const webfinger_repository_1 = require('../modules/webfinger/repositories/webfinger.repository');
const media_repository_1 = require('../modules/media/repositories/media.repository');
const path_1 = __importDefault(require('path'));
/**
 * Create service container with initialized services
 * Uses proper dependency injection pattern where services receive their dependencies
 * rather than creating them internally
 */
function createServiceContainer(db, domain) {
  // Define common paths
  const uploadPath = path_1.default.join(process.cwd(), 'uploads');
  // Create repositories
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
  // Create base services
  const uploadService = new upload_service_1.UploadService();
  const authService = new auth_service_1.AuthService(authRepository);
  // Create services with proper initialization order
  // First create NotificationService without ActorService
  const notificationService = new notification_service_1.NotificationService(
    notificationRepository
  );
  // Create ActorService with domain
  const actorService = new actorService_1.ActorService(
    actorRepository,
    notificationService,
    domain
  );
  // Set ActorService back into NotificationService
  notificationService.setActorService(actorService);
  // Create remaining services
  const postService = new postService_1.PostService(
    postRepository,
    actorService,
    notificationService,
    domain
  );
  const commentService = new comment_service_1.CommentService(
    commentRepository,
    postService,
    actorService,
    notificationService
  );
  const activityPubService = new activitypub_service_1.ActivityPubService(
    activityPubRepository,
    domain
  );
  const webfingerService = new webfinger_service_1.WebfingerService(
    webfingerRepository,
    domain
  );
  const mediaService = new media_service_1.MediaService(
    mediaRepository,
    uploadPath
  );
  // Create controllers with dependencies
  const postsController = new postsController_1.PostsController(
    postService,
    actorService,
    uploadService,
    domain
  );
  const commentsController = new comments_controller_1.CommentsController(
    commentService
  );
  // Create the container with all services
  const container = {
    actorService,
    postService,
    authService,
    postsController,
    commentsController,
    commentService,
    notificationService,
    uploadService,
    mediaService,
    activityPubService,
    webfingerService,
    // Implement getService method for flexible service resolution
    getService(name) {
      // Cast to the correct type
      if (name in this) {
        return this[name];
      }
      return null;
    },
  };
  return container;
}
