'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.MediaService = void 0;
const promises_1 = __importDefault(require('fs/promises'));
class MediaService {
  constructor(repository, uploadPath) {
    this.repository = repository;
    this.uploadPath = uploadPath;
  }
  async createMedia(mediaData) {
    return await this.repository.create(mediaData);
  }
  async getMediaById(id) {
    return await this.repository.findById(id);
  }
  async deleteMedia(id) {
    const media = await this.repository.findById(id);
    if (media) {
      // Delete the physical file
      try {
        await promises_1.default.unlink(media.path);
      } catch (error) {
        console.warn('Failed to delete physical file:', error);
      }
      // Delete the database record
      await this.repository.deleteById(id);
    }
  }
  async getMediaByUserId(userId, page = 1, limit = 20) {
    return await this.repository.findByUserId(userId, page, limit);
  }
}
exports.MediaService = MediaService;
