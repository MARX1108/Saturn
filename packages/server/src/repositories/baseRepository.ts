import { Collection, Db, Filter, OptionalId, Document, ObjectId } from "mongodb";

export interface BaseRepository<T extends Document> {
  findById(id: string): Promise<T | null>;
  findOne(filter: Filter<T>): Promise<T | null>;
  findAll(filter?: Filter<T>): Promise<T[]>;
  create(data: OptionalId<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

export abstract class MongoRepository<T extends Document> implements BaseRepository<T> {
  protected collection: Collection<T>;

  constructor(db: Db, collectionName: string) {
    this.collection = db.collection<T>(collectionName);
  }

  async findById(id: string): Promise<T | null> {
    try {
      return await this.collection.findOne({ _id: new ObjectId(id) } as Filter<T>);
    } catch (error) {
      console.error(`Error finding document by ID: ${error}`);
      return null;
    }
  }

  async findOne(filter: Filter<T>): Promise<T | null> {
    return this.collection.findOne(filter);
  }

  async findAll(filter: Filter<T> = {}): Promise<T[]> {
    return this.collection.find(filter).toArray();
  }

  async create(data: OptionalId<T>): Promise<T> {
    const result = await this.collection.insertOne(data as OptionalId<Document>);
    return { ...data, _id: result.insertedId } as T;
  }

  async update(id: string, data: Partial<T>): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) } as Filter<T>,
      { $set: data }
    );
    return result.modifiedCount > 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne(
      { _id: new ObjectId(id) } as Filter<T>
    );
    return result.deletedCount > 0;
  }
}