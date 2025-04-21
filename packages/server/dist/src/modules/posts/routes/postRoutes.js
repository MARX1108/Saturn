'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = configurePostRoutes;
const express_1 = require('express');
const auth_1 = require('../../../middleware/auth');
/**
 * Configure post routes with the controller
 */
function configurePostRoutes(postsController, commentsController, authService) {
  const router = (0, express_1.Router)();
  // Public routes
  router.get('/', (0, auth_1.authenticate)(authService), (req, res, next) => {
    postsController.getFeed(req, res, next).catch(next);
  });
  router.get('/:id', (req, res, next) => {
    postsController.getPostById(req, res, next).catch(next);
  });
  router.get('/users/:username', (req, res, next) => {
    postsController.getPostsByUsername(req, res, next).catch(next);
  });
  // Protected routes
  router.post('/', (0, auth_1.authenticate)(authService), (req, res, next) => {
    postsController.createPost(req, res, next).catch(next);
  });
  router.put(
    '/:id',
    (0, auth_1.authenticate)(authService),
    (req, res, next) => {
      postsController.updatePost(req, res, next).catch(next);
    }
  );
  router.delete(
    '/:id',
    (0, auth_1.authenticate)(authService),
    (req, res, next) => {
      postsController.deletePost(req, res).catch(next);
    }
  );
  router.post(
    '/:id/like',
    (0, auth_1.authenticate)(authService),
    (req, res, next) => {
      postsController.likePost(req, res).catch(next);
    }
  );
  router.delete(
    '/:id/like',
    (0, auth_1.authenticate)(authService),
    (req, res, next) => {
      postsController.unlikePost(req, res).catch(next);
    }
  );
  // Comment routes
  router.get('/:id/comments', (req, res, next) => {
    commentsController.getComments(req, res).catch(next);
  });
  router.post(
    '/:id/comments',
    (0, auth_1.authenticate)(authService),
    (req, res, next) => {
      commentsController.createComment(req, res).catch(next);
    }
  );
  router.delete(
    '/comments/:id',
    (0, auth_1.authenticate)(authService),
    (req, res, next) => {
      commentsController.deleteComment(req, res).catch(next);
    }
  );
  return router;
}
