import {
  Model,
  FindOptions,
  ModelStatic,
  WhereOptions,
  CreationAttributes,
} from 'sequelize';

export type FilterArgs<T> = Partial<T> | Record<string, unknown>;
export type UpdateAttributes<T> = Partial<T>;

export class BaseRepository<T extends Model> {
  protected modelConstructor: ModelStatic<T>;
  protected modelName: string;

  constructor(modelConstructor: ModelStatic<T>, modelName: string) {
    this.modelConstructor = modelConstructor;
    this.modelName = modelName;
  }

  async delete(filter: FilterArgs<T>): Promise<number> {
    const model = this.modelConstructor;
    try {
      const result = await model.destroy({
        where: filter as WhereOptions<T>,
      });
      return result;
    } catch (_error) {
      console.error(
        `Error deleting ${this.modelName}:`,
        JSON.stringify(_error)
      );
      throw new Error(`Error deleting ${this.modelName}`);
    }
  }

  async findAll(options: FindOptions<T> = {}): Promise<T[]> {
    const model = this.modelConstructor;
    try {
      const results = await model.findAll(options);
      return results;
    } catch (_error) {
      console.error(
        `Error finding all ${this.modelName}:`,
        JSON.stringify(_error)
      );
      throw new Error(`Error finding all ${this.modelName}`);
    }
  }

  async findById(
    id: string | number,
    options: FindOptions<T> = {}
  ): Promise<T | null> {
    const model = this.modelConstructor;
    try {
      const result = await model.findByPk(id, options);
      return result;
    } catch (_error) {
      console.error(
        `Error finding ${this.modelName} by ID:`,
        JSON.stringify(_error)
      );
      throw new Error(`Error finding ${this.modelName} by ID`);
    }
  }

  async findOne(options: FindOptions<T> = {}): Promise<T | null> {
    const model = this.modelConstructor;
    try {
      const result = await model.findOne(options);
      return result;
    } catch (_error) {
      console.error(
        `Error finding one ${this.modelName}:`,
        JSON.stringify(_error)
      );
      throw new Error(`Error finding one ${this.modelName}`);
    }
  }

  async update(
    filter: FilterArgs<T>,
    update: UpdateAttributes<T>
  ): Promise<[number, T[]]> {
    const model = this.modelConstructor;
    try {
      const result = await model.update(update as CreationAttributes<T>, {
        where: filter as WhereOptions<T>,
        returning: true,
      });
      return result as unknown as [number, T[]];
    } catch (_error) {
      console.error(
        `Error updating ${this.modelName}:`,
        JSON.stringify(_error)
      );
      throw new Error(`Error updating ${this.modelName}`);
    }
  }
}
