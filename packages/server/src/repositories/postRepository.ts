import { Db, ObjectId } from "mongodb";
import { Post } from "../types/post";

export class PostRepository {
  private db: Db;
  private collection = "posts";

  constructor(db: Db) {
    this.db = db;
  }

  async findById(id: string) {
    return this.db.collection(this.collection).findOne({
      _id: new ObjectId(id),
    });
  }

  async findByAuthor(authorId: string) {
    return this.db
      .collection(this.collection)
      .find({ authorId: new ObjectId(authorId) })
      .toArray();
  }

  async create(post: Partial<Post>) {
    const result = await this.db.collection(this.collection).insertOne(post);
    return result.insertedId;
  }

  async update(id: string, updates: Partial<Post>) {
    return this.db
      .collection(this.collection)
      .updateOne({ _id: new ObjectId(id) }, { $set: updates });
  }

  async delete(id: string) {
    return this.db.collection(this.collection).deleteOne({
      _id: new ObjectId(id),
    });
  }
}
