import { Router } from 'express';
import { PostsController } from '../controllers/postsController';
import { CommentsController } from '../../comments/controllers/comments.controller';
import { authenticate } from '../../../middleware/auth';
import { AuthService } from '../../auth/services/auth.service';

/**
 * Configure post routes with the controller
 */
export default function configurePostRoutes(
  postsController: PostsController,
  commentsController: CommentsController,
  authService: AuthService
): Router {
  const router = Router();

  // Public routes
  router.get('/posts', (req, res) => postsController.getFeed(req, res));
  router.get('/posts/:id', (req, res) => postsController.getPostById(req, res));
  router.get('/users/:username/posts', (req, res) =>
    postsController.getPostsByUsername(req, res)
  );

  // Protected routes
  router.post('/posts', authenticate(authService), (req, res) =>
    postsController.createPost(req, res)
  );
  router.put('/posts/:id', authenticate(authService), (req, res) =>
    postsController.updatePost(req, res)
  );
  router.delete('/posts/:id', authenticate(authService), (req, res) =>
    postsController.deletePost(req, res)
  );
  router.post('/posts/:id/like', authenticate(authService), (req, res) =>
    postsController.likePost(req, res)
  );
  router.delete('/posts/:id/like', authenticate(authService), (req, res) =>
    postsController.unlikePost(req, res)
  );

  // Comment routes
  router.get('/posts/:id/comments', (req, res) =>
    commentsController.getComments(req, res)
  );
  router.post('/posts/:id/comments', authenticate(authService), (req, res) =>
    commentsController.createComment(req, res)
  );
  router.delete('/comments/:id', authenticate(authService), (req, res) =>
    commentsController.deleteComment(req, res)
  );

  return router;
}
