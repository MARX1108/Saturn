// Media service implementation
import { MediaRepository } from '../repositories/media.repository';
import fs from 'fs/promises';
import { WithId } from 'mongodb';

// Media input type for creation
interface MediaInput {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  path: string;
  userId: string;
  uploadedAt: Date;
}

export class MediaService {
  private repository: MediaRepository;
  private uploadPath: string;

  constructor(repository: MediaRepository, uploadPath: string) {
    this.repository = repository;
    this.uploadPath = uploadPath;
  }

  async createMedia(mediaData: MediaInput): Promise<any> {
    return await this.repository.create(mediaData as any);
  }

  async getMediaById(id: string): Promise<any> {
    return await this.repository.findById(id);
  }

  async deleteMedia(id: string): Promise<void> {
    const media = await this.repository.findById(id);
    if (media) {
      // Delete the physical file
      try {
        await fs.unlink(media.path);
      } catch (error) {
        console.warn('Failed to delete physical file:', error);
      }

      // Delete the database record
      await this.repository.deleteById(id);
    }
  }

  async getMediaByUserId(userId: string, page = 1, limit = 20): Promise<any[]> {
    return await this.repository.findByUserId(userId, page, limit);
  }
}
