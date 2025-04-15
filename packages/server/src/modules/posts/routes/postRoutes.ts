import express, {
  Request,
  Response,
  Router,
  NextFunction,
  RequestHandler,
} from 'express';
import { PostsController } from '../controllers/postsController';
import { CommentsController } from '../../comments/controllers/comments.controller';
import { authenticateToken } from '../../../middleware/auth';
import { ServiceContainer } from '../../../utils/container';

/**
 * Configure post routes with the controller
 */
export function configurePostRoutes(
  serviceContainer: ServiceContainer
): Router {
  const router = express.Router();
  const { postService, actorService, uploadService, commentService } =
    serviceContainer;
  const domain = process.env.DOMAIN || 'localhost:4000';

  // Create controller with injected dependencies
  const postsController = new PostsController(
    postService,
    actorService,
    uploadService,
    domain
  );

  // Create comments controller
  const commentsController = new CommentsController(commentService);

  // Configure media upload middleware with UploadService
  const mediaUpload = uploadService.configureMediaUploadMiddleware({
    fileSizeLimitMB: 10, // 10MB limit
    allowedTypes: ['image/', 'video/', 'audio/'],
  });

  // Create a new post
  const createPostHandler: RequestHandler = async (req, res, next) => {
    const upload = mediaUpload.array('attachments');
    upload(req, res, async err => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      try {
        await postsController.createPost(req, res);
      } catch (error) {
        next(error);
      }
    });
  };
  router.post('/', authenticateToken, createPostHandler);

  // Get feed (public timeline)
  const getFeedHandler: RequestHandler = async (req, res, next) => {
    try {
      await postsController.getFeed(req, res);
    } catch (error) {
      next(error);
    }
  };
  router.get('/', getFeedHandler);

  // Get single post by ID
  const getPostByIdHandler: RequestHandler = async (req, res, next) => {
    try {
      await postsController.getPostById(req, res);
    } catch (error) {
      next(error);
    }
  };
  router.get('/:id', getPostByIdHandler);

  // Update post
  const updatePostHandler: RequestHandler = async (req, res, next) => {
    try {
      await postsController.updatePost(req, res);
    } catch (error) {
      next(error);
    }
  };
  router.put('/:id', authenticateToken, updatePostHandler);

  // Delete post
  const deletePostHandler: RequestHandler = async (req, res, next) => {
    try {
      await postsController.deletePost(req, res);
    } catch (error) {
      next(error);
    }
  };
  router.delete('/:id', authenticateToken, deletePostHandler);

  // Like a post
  const likePostHandler: RequestHandler = async (req, res, next) => {
    try {
      await postsController.likePost(req, res);
    } catch (error) {
      next(error);
    }
  };
  router.post('/:id/like', authenticateToken, likePostHandler);

  // Unlike a post
  const unlikePostHandler: RequestHandler = async (req, res, next) => {
    try {
      await postsController.unlikePost(req, res);
    } catch (error) {
      next(error);
    }
  };
  router.post('/:id/unlike', authenticateToken, unlikePostHandler);

  // COMMENT ROUTES
  // Get comments for a post
  const getPostCommentsHandler: RequestHandler = async (req, res, next) => {
    try {
      await commentsController.getPostComments(
        { ...req, params: { postId: req.params.id } },
        res,
        next
      );
    } catch (error) {
      next(error);
    }
  };
  router.get('/:id/comments', getPostCommentsHandler);

  // Create a comment on a post
  const createPostCommentHandler: RequestHandler = async (req, res, next) => {
    try {
      await commentsController.createComment(
        { ...req, params: { postId: req.params.id } },
        res
      );
    } catch (error) {
      next(error);
    }
  };
  router.post('/:id/comments', authenticateToken, createPostCommentHandler);

  return router;
}
