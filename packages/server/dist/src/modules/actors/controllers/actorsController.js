'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ActorsController = void 0;
const errors_1 = require('@/utils/errors');
const mongodb_1 = require('mongodb');
class ActorsController {
  constructor(actorService, uploadService, postService, domain) {
    this.actorService = actorService;
    this.uploadService = uploadService;
    this.postService = postService;
    this.domain = domain;
  }
  /**
   * Search actors by query
   */
  async searchActors(req, res) {
    const { q } = req.query;
    const searchQuery = q || '';
    const actors = await this.actorService.searchActors(searchQuery);
    return res.json(actors);
  }
  /**
   * Create a new actor
   */
  async createActor(req, res, next) {
    try {
      const controllerData = req.body;
      // Map controller DTO to service DTO
      const actorData = { ...controllerData };
      // Add validation here using the DTO
      if (!actorData.username || !actorData.email || !actorData.password) {
        throw new errors_1.AppError(
          'Missing required fields (username, email, password)',
          400,
          errors_1.ErrorType.BAD_REQUEST
        );
      }
      const actor = await this.actorService.createLocalActor(actorData);
      res.status(201).json({ id: actor.id, username: actor.preferredUsername });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Get actor by username
   */
  async getActorByUsername(req, res) {
    const { username } = req.params;
    const actor = await this.actorService.getActorByUsername(username);
    if (!actor) {
      return res.status(404).json({ error: 'Actor not found' });
    }
    // Remove sensitive information from the response
    const { password, email, ...actorWithoutSensitiveInfo } = actor;
    return res.json(actorWithoutSensitiveInfo);
  }
  /**
   * Update actor
   */
  async updateActor(req, res, next) {
    try {
      const actorId = req.params.id; // Assuming this ID is the internal ObjectId
      const updates = req.body;
      // TODO: Add validation
      // TODO: Verify user performing update is authorized (owns the actor or is admin)
      const updatedActor = await this.actorService.updateActorProfile(
        actorId,
        updates
      );
      if (!updatedActor) {
        throw new errors_1.AppError(
          'Actor not found or update failed',
          404,
          errors_1.ErrorType.NOT_FOUND
        );
      }
      // TODO: Format response
      res.status(200).json({
        id: updatedActor.id,
        username: updatedActor.preferredUsername,
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Delete actor
   */
  async deleteActor(req, res, next) {
    try {
      const actorId = req.params.id; // Assuming internal ObjectId
      // TODO: Verify authorization
      // Try to use the service method first
      try {
        const success = await this.actorService.deleteActor(actorId);
        if (success) {
          res.status(204).send();
          return;
        }
      } catch {
        // If service method fails, try repository access as fallback
        const objectId = new mongodb_1.ObjectId(actorId);
        const actorRepository = this.actorService['actorRepository'];
        const success = await actorRepository.deleteById(objectId);
        if (!success) {
          throw new errors_1.AppError(
            'Actor not found',
            404,
            errors_1.ErrorType.NOT_FOUND
          );
        }
        res.status(204).send();
      }
    } catch (error) {
      next(error);
    }
  }
  /**
   * Get posts authored by a specific actor
   */
  getActorPosts(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;
      // Need a method in PostService like getPostsByActorUsername
      // const { posts, total } = await this.postService.getPostsByActorUsername(req.params.username, { limit, offset });
      // Placeholder response
      console.warn('getPostsByActorUsername not implemented in PostService');
      res.json({ posts: [], total: 0, limit, offset });
    } catch (error) {
      next(error);
    }
  }
}
exports.ActorsController = ActorsController;
