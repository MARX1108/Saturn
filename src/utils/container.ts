// Controllers (instantiate after services)
const authController = new AuthController(authService, actorService);
const actorsController = new ActorsController(actorService);
const postsController = new PostsController(postService, actorService);
const commentsController = new CommentsController(commentService);
const notificationsController = new NotificationsController(
  notificationService
);
