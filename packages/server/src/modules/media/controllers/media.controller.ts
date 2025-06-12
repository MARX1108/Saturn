// Media controller implementation
import { Request, Response } from 'express';
import { MediaService } from '../services/media.service';
import { UploadService } from '../services/upload.service';
import path from 'path';
import config from '../../../config';
import { ObjectId } from 'mongodb';

export class MediaController {
  private service: MediaService;
  private uploadService: UploadService;

  constructor(service: MediaService) {
    this.service = service;
    this.uploadService = new UploadService();
  }

  // Handler for uploading media
  async uploadMedia(req: Request, res: Response): Promise<void> {
    try {
      // Configure multer middleware for media uploads
      const upload = this.uploadService.configureMediaUploadMiddleware({
        fileSizeLimitMB: 10,
        uploadDir: config.uploads.tempDir,
        allowedTypes: ['image/', 'video/', 'audio/'],
      });

      // Use multer to handle the file upload
      upload.single('file')(req, res, async err => {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }

        if (!req.file) {
          res.status(400).json({ error: 'No file provided' });
          return;
        }

        if (!req.user?.id) {
          res.status(401).json({ error: 'User not authenticated' });
          return;
        }

        try {
          // Move file to permanent location
          const fileInfo = await this.uploadService.moveUploadedFile(
            req.file,
            config.uploads.mediaDir
          );

          // Save media record to database
          const mediaId = new ObjectId().toString();
          const media = await this.service.createMedia({
            id: mediaId,
            filename: fileInfo.filename,
            originalFilename: fileInfo.originalName,
            mimeType: fileInfo.mimetype,
            size: fileInfo.size,
            path: fileInfo.path,
            userId: req.user.id,
            uploadedAt: new Date(),
          });

          // Return media info
          res.status(201).json({
            id: media.id,
            url: `/api/media/${media.id}`,
            type: media.mimeType,
            size: media.size,
          });
        } catch (error) {
          console.error('Error saving media:', error);
          res.status(500).json({ error: 'Failed to save media' });
        }
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error uploading media:', error.message, {
          stack: error.stack,
        });
      } else {
        console.error('Unknown error uploading media:', error);
      }
      res.status(500).json({ error: 'Failed to upload media' });
    }
  }

  // Handler for retrieving media
  async getMedia(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const media = await this.service.getMediaById(id);

      if (!media) {
        res.status(404).json({ error: 'Media not found' });
        return;
      }

      res.json({
        id: media.id,
        url: `/api/media/${media.id}`,
        type: media.mimeType,
        size: media.size,
        createdAt: media.uploadedAt,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error retrieving media:', error.message, {
          stack: error.stack,
        });
      } else {
        console.error('Unknown error retrieving media:', error);
      }
      res.status(500).json({ error: 'Failed to retrieve media' });
    }
  }

  // Handler for deleting media
  async deleteMedia(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const media = await this.service.getMediaById(id);
      if (!media) {
        res.status(404).json({ error: 'Media not found' });
        return;
      }

      // Check if user owns the media
      if (media.userId !== req.user.id) {
        res.status(403).json({ error: 'Not authorized to delete this media' });
        return;
      }

      await this.service.deleteMedia(id);
      res.status(204).send();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error deleting media:', error.message, {
          stack: error.stack,
        });
      } else {
        console.error('Unknown error deleting media:', error);
      }
      res.status(500).json({ error: 'Failed to delete media' });
    }
  }
}
