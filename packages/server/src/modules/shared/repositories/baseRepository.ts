import {
  Collection,
  Db,
  Filter,
  FindOptions,
  ModifyResult as _ModifyResult,
  OptionalId as _OptionalId,
  Document,
  ObjectId,
  OptionalUnlessRequiredId,
  UpdateFilter,
  WithId,
  CountDocumentsOptions,
  DeleteOptions,
  FindOneAndUpdateOptions,
} from 'mongodb';
import logger from '../../../utils/logger';

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
    options?: FindOneAndUpdateOptions
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
        logger.error({ id, err: error }, 'Invalid ObjectId format');
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
      logger.error({ id, err: error }, 'Error finding document by ID');
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
    await this.collection.insertOne(
      docToInsert as unknown as OptionalUnlessRequiredId<T>
    );
    return docToInsert as WithId<T>;
  }

  async updateById(
    id: string | ObjectId,
    data: UpdateFilter<T> | Partial<T>
  ): Promise<boolean> {
    try {
      const objectId = this.toObjectId(id);

      const isUpdateOperator =
        '$set' in data ||
        '$inc' in data ||
        '$addToSet' in data ||
        '$pull' in data;

      const updateDoc = isUpdateOperator
        ? (data as UpdateFilter<T>)
        : ({ $set: data } as UpdateFilter<T>);

      const result = await this.collection.updateOne(
        { _id: objectId } as Filter<T>,
        updateDoc
      );
      return result.modifiedCount > 0;
    } catch (error) {
      logger.error({ id, err: error }, 'Error updating document by ID');
      return false;
    }
  }

  async findOneAndUpdate(
    filter: Filter<T>,
    update: UpdateFilter<T>,
    options?: FindOneAndUpdateOptions
  ): Promise<WithId<T> | null> {
    const result = await this.collection.findOneAndUpdate(
      filter,
      update,
      options || {}
    );
    return result as WithId<T> | null;
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
    try {
      const result = await this.collection.deleteOne(filter, options);
      return result.deletedCount > 0;
    } catch (error) {
      logger.error({ filter, err: error }, 'Error deleting document');
      return false;
    }
  }

  async countDocuments(
    filter: Filter<T> = {},
    options?: CountDocumentsOptions
  ): Promise<number> {
    return this.collection.countDocuments(filter, options);
  }
}
