import { Db } from "mongodb";
import { MongoRepository } from "../../shared/repositories/baseRepository";

// Define basic Media metadata type - expand as needed
interface Media {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  path: string;
  userId: string;
  uploadedAt: Date;
  [key: string]: any;
}

export class MediaRepository extends MongoRepository<Media> {
  constructor(db: Db) {
    super(db, "media");

    // Create indexes for common media queries
    this.collection.createIndex({ id: 1 }, { unique: true });
    this.collection.createIndex({ userId: 1 });
  }

  async findById(id: string): Promise<Media | null> {
    return this.findOne({ id });
  }

  async findByUserId(userId: string, page = 1, limit = 20): Promise<Media[]> {
    const skip = (page - 1) * limit;
    return this.collection
      .find({ userId })
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }
}
