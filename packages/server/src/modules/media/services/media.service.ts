// Media service implementation
import { Db } from "mongodb";
import { MediaRepository } from "../repositories/media.repository";

export class MediaService {
  private repository: MediaRepository;
  private uploadPath: string;

  constructor(db: Db, uploadPath: string) {
    this.repository = new MediaRepository(db);
    this.uploadPath = uploadPath;
  }

  // Add Media related methods here (upload, retrieve, delete media files, etc.)
}