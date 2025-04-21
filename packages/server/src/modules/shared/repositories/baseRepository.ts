import {
  Collection,
  Db,
  Filter,
  FindOptions,
  ModifyResult,
  OptionalId,
  Document,
  ObjectId,
  OptionalUnlessRequiredId,
  UpdateFilter,
  WithId,
  CountDocumentsOptions,
  DeleteOptions,
} from 'mongodb';

export interface BaseRepository<T extends Document> {
  findById(id: string | ObjectId): Promise<WithId<T> | null>;
  findOne(filter: Filter<T>): Promise<WithId<T> | null>;
  find(filter?: Filter<T>, options?: FindOptions<T>): Promise<WithId<T>[]>;
  create(data: OptionalUnlessRequiredId<T>): Promise<WithId<T>>;
  updateById(
    id: string | ObjectId,
    data: UpdateFilter<T> | Partial<T>
  ): Promise<boolean>;
  deleteById(id: string | ObjectId): Promise<boolean>;
  findOneAndUpdate(
    filter: Filter<T>,
    update: UpdateFilter<T>,
    options?: FindOptions<T>
  ): Promise<WithId<T> | null>;
  countDocuments(
    filter?: Filter<T>,
    options?: CountDocumentsOptions
  ): Promise<number>;
  deleteOne(filter: Filter<T>, options?: DeleteOptions): Promise<boolean>;
}

export abstract class MongoRepository<T extends Document>
  implements BaseRepository<T>
{
  protected collection: Collection<T>;

  constructor(db: Db, collectionName: string) {
    this.collection = db.collection<T>(collectionName);
  }

  private toObjectId(id: string | ObjectId): ObjectId {
    if (typeof id === 'string') {
      try {
        return new ObjectId(id);
      } catch (error) {
        throw new Error(`Invalid ID format: ${id}`);
      }
    } else if (id instanceof ObjectId) {
      return id;
    } else {
      throw new Error(`Unsupported ID type: ${typeof id}`);
    }
  }

  async findById(id: string | ObjectId): Promise<WithId<T> | null> {
    try {
      const objectId = this.toObjectId(id);
      const result = await this.collection.findOne({
        _id: objectId,
      } as Filter<T>);
      return result;
    } catch (error) {
      console.error(`Error finding document by ID: ${error}`);
      return null;
    }
  }

  async findOne(filter: Filter<T>): Promise<WithId<T> | null> {
    const result = await this.collection.findOne(filter);
    return result;
  }

  async find(
    filter: Filter<T> = {},
    options?: FindOptions<T>
  ): Promise<WithId<T>[]> {
    const cursor = this.collection.find(filter, options);
    return cursor.toArray();
  }

  async create(data: OptionalUnlessRequiredId<T>): Promise<WithId<T>> {
    const result = await this.collection.insertOne(data);
    return { ...data, _id: result.insertedId } as WithId<T>;
  }

  async createWithId(
    id: string | ObjectId,
    data: Omit<T, '_id'>
  ): Promise<WithId<T>> {
    const objectId = this.toObjectId(id);
    const docToInsert = { ...data, _id: objectId };
    await this.collection.insertOne(docToInsert as any);
    return docToInsert as WithId<T>;
  }

  async updateById(
    id: string | ObjectId,
    data: UpdateFilter<T> | Partial<T>
  ): Promise<boolean> {
    const objectId = this.toObjectId(id);
    const updateDoc =
      (data as any).$set ||
      (data as any).$inc ||
      (data as any).$addToSet ||
      (data as any).$pull
        ? data
        : { $set: data };
    const result = await this.collection.updateOne(
      { _id: objectId } as Filter<T>,
      updateDoc as any
    );
    return result.modifiedCount > 0;
  }

  async findOneAndUpdate(
    filter: Filter<T>,
    update: UpdateFilter<T>,
    options?: FindOptions<T>
  ): Promise<WithId<T> | null> {
    const result = await this.collection.findOneAndUpdate(filter, update, {
      ...options,
      returnDocument: 'after',
    } as any);
    return result?.value as WithId<T> | null;
  }

  async deleteById(id: string | ObjectId): Promise<boolean> {
    const objectId = this.toObjectId(id);
    const result = await this.collection.deleteOne({
      _id: objectId,
    } as Filter<T>);
    return result.deletedCount > 0;
  }

  async deleteOne(
    filter: Filter<T>,
    options?: DeleteOptions
  ): Promise<boolean> {
    const result = await this.collection.deleteOne(filter, options);
    return result.deletedCount > 0;
  }

  async countDocuments(
    filter: Filter<T> = {},
    options?: CountDocumentsOptions
  ): Promise<number> {
    return this.collection.countDocuments(filter, options);
  }
}
