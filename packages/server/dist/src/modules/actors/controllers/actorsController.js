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
    const {
      password: _password,
      email: _email,
      ...actorWithoutSensitiveInfo
    } = actor;
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
  /**
   * Update actor by username
   */
  async updateActorByUsername(req, res, next) {
    try {
      const username = req.params.username;
      const updates = req.body;
      console.log(
        `[ActorsController] Attempting to update actor with username: ${username}`
      );
      console.log(
        `[ActorsController] Update payload:`,
        JSON.stringify(updates)
      );
      console.log(
        `[ActorsController] Current user:`,
        req.user?.preferredUsername
      );
      // Authorization check: Only allow users to update their own profiles (or admin users)
      // Cast req.user to our interface that includes isAdmin
      const user = req.user;
      if (user?.preferredUsername !== username && !(user?.isAdmin === true)) {
        console.error(
          `[ActorsController] Authorization failed - user ${user?.preferredUsername} attempted to update ${username}`
        );
        throw new errors_1.AppError(
          'Not authorized to update this actor',
          403,
          errors_1.ErrorType.FORBIDDEN
        );
      }
      // Find the actor first to verify it exists
      const actor = await this.actorService.getActorByUsername(username);
      if (!actor) {
        throw new errors_1.AppError(
          'Actor not found with username: ' + username,
          404,
          errors_1.ErrorType.NOT_FOUND
        );
      }
      console.log(`Updating actor with username ${username}, ID: ${actor._id}`);
      // Create clean update object
      const cleanUpdates = {};
      // Only include fields that are actually provided
      if (updates.displayName !== undefined)
        cleanUpdates.displayName = updates.displayName;
      if (updates.summary !== undefined) cleanUpdates.summary = updates.summary;
      if (updates.icon !== undefined) cleanUpdates.icon = updates.icon;
      console.log(
        `[ActorsController] Cleaned update object:`,
        JSON.stringify(cleanUpdates)
      );
      // CHANGE: Use updateActor method which updates by username rather than ID
      // since we're having issues with the ObjectId lookups
      try {
        const updatedActor = await this.actorService.updateActor(
          username,
          cleanUpdates
        );
        if (!updatedActor) {
          console.error(
            `[ActorsController] Actor update failed, returned null for username: ${username}`
          );
          throw new errors_1.AppError(
            'Actor update failed',
            500,
            errors_1.ErrorType.INTERNAL_SERVER_ERROR
          );
        }
        console.log(
          `[ActorsController] Successfully updated actor: ${updatedActor.preferredUsername}`
        );
        res.status(200).json({
          id: updatedActor.id,
          username: updatedActor.preferredUsername,
          displayName: updatedActor.displayName,
        });
      } catch (updateError) {
        console.error(
          `[ActorsController] Error updating actor with username ${username}:`,
          updateError
        );
        // Handle error with proper type casting
        const errorMessage =
          updateError instanceof Error ? updateError.message : 'Unknown error';
        throw new errors_1.AppError(
          `Actor update failed: ${errorMessage}`,
          500,
          errors_1.ErrorType.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error) {
      console.error(
        `[ActorsController] Error in updateActorByUsername:`,
        error
      );
      next(error);
    }
  }
}
exports.ActorsController = ActorsController;
