import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { ActorService } from '../services/actorService';
import { CreateActorRequest } from '../models/actor';
import { UploadService } from '../../media/services/upload.service';
import { PostService } from '../../posts/services/postService';
import { DbUser } from '../../../modules/auth/models/user';
import { AppError, ErrorType } from '../../../utils/errors';

export class ActorsController {
  private actorService: ActorService;
  private uploadService: UploadService;
  private postService: PostService;
  private domain: string;

  constructor(
    actorService: ActorService,
    uploadService: UploadService,
    postService: PostService,
    domain: string
  ) {
    this.actorService = actorService;
    this.uploadService = uploadService;
    this.postService = postService;
    this.domain = domain;
  }

  /**
   * Search actors by query
   */
  async searchActors(req: Request, res: Response): Promise<Response> {
    const { query } = req.query;
    const actors = await this.actorService.searchActors(query as string);
    return res.json(actors);
  }

  /**
   * Create a new actor
   */
  async createActor(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const actorData = req.body;
    const actor = await this.actorService.createActor(actorData);
    return res.status(201).json(actor);
  }

  /**
   * Get actor by username
   */
  async getActorByUsername(req: Request, res: Response): Promise<Response> {
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
  async updateActor(req: Request, res: Response): Promise<Response> {
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
  async deleteActor(req: Request, res: Response): Promise<Response> {
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
  async getActorPosts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      const { username } = req.params;

      // Parse and validate pagination parameters
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      if (isNaN(limit) || limit < 1 || isNaN(offset) || offset < 0) {
        throw new AppError(
          'Invalid pagination parameters',
          400,
          ErrorType.VALIDATION
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
