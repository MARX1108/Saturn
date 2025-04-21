'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ActorsController = void 0;
const errors_1 = require('../../../utils/errors');
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
  async createActor(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const actorData = req.body;
    const actor = await this.actorService.createActor(
      actorData.username,
      actorData.displayName || actorData.username,
      actorData.avatarUrl || ''
    );
    return res.status(201).json(actor);
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
    return res.json(actor);
  }
  /**
   * Update actor
   */
  async updateActor(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { id } = req.params;
    const actorData = req.body;
    const actor = await this.actorService.updateActor(id, actorData);
    if (!actor) {
      return res.status(404).json({ error: 'Actor not found' });
    }
    return res.json(actor);
  }
  /**
   * Delete actor
   */
  async deleteActor(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { id } = req.params;
    const deleted = await this.actorService.deleteActor(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Actor not found' });
    }
    return res.status(204).end();
  }
  /**
   * Get posts authored by a specific actor
   */
  async getActorPosts(req, res, next) {
    try {
      const { username } = req.params;
      // Parse and validate pagination parameters
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;
      if (isNaN(limit) || limit < 1 || isNaN(offset) || offset < 0) {
        throw new errors_1.AppError(
          'Invalid pagination parameters',
          400,
          errors_1.ErrorType.VALIDATION
        );
      }
      // Cap the limit to prevent excessive queries
      const cappedLimit = Math.min(limit, 50);
      // Get posts by username with pagination
      const result = await this.postService.getPostsByUsername(username, {
        limit: cappedLimit,
        offset,
      });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
exports.ActorsController = ActorsController;
