import { Collection, Db, Filter, OptionalId, Document, ObjectId, OptionalUnlessRequiredId, WithId } from "mongodb";

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
      const result = await this.collection.findOne({ _id: id } as Filter<T>);
      return result;
    } catch (error) {
      console.error(`Error finding document by ID: ${error}`);
      return null;
    }
  }

  async findOne(filter: Filter<T>): Promise<T | null> {
    const result = await this.collection.findOne(filter);
    return result;
  }

  async findAll(filter: Filter<T> = {}): Promise<T[]> {
    const results = await this.collection.find(filter).toArray();
    return results;
  }

  async create(data: OptionalId<T>): Promise<T> {
    const result = await this.collection.insertOne(data as OptionalUnlessRequiredId<T>);
    return { ...data, _id: result.insertedId.toString() } as T;
  }

  async update(id: string, data: Partial<T>): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: id } as Filter<T>,
      { $set: data }
    );
    return result.modifiedCount > 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne(
      { _id: id } as Filter<T>
    );
    return result.deletedCount > 0;
  }
}