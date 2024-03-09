import bcrypt from 'bcrypt';
import { ApiError } from '../errors/ApiError';
import { GET_UP_CRE, ICRUDOptions, IGET_UP_CREConstructor } from './BaseClass';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsRelations,
  FindOptionsWhere,
  ObjectLiteral,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { isEmpty } from '../utils/isEmpty';
import { DEFAULT_PAGINATION } from '../constants/pagination';
import { MyFindOptionsWhere, WithPagination } from '../@types/crud';

/**
 * The CRUD class provides functionality for updating data in the application.
 * It extends the GET_UP_CRE class.
 */
export class CRUD<Entity extends ObjectLiteral> extends GET_UP_CRE<Entity> {
  /**
   * Creates an instance of CRUD.
   *
   * @param props - An object containing properties to initialize the CRUD.
   * @param props.entity - The EntityTarget representing the database entity for data updates.
   * @param props.request - The Express Request object.
   * @param props.name - A descriptive name for the CRUD instance.
   * @param props.response - The Express Response object.
   * @param props.next - The NextFunction for handling the next middleware.
   * @param props.entityManager - An optional DataSource for database operations.
   */
  constructor(props: IGET_UP_CREConstructor<Entity>) {
    super({ ...props });
  }

  /**
   * Create a meta data for pagination.
   *
   * @param page, take - page and take for pagination.
   */
  private createMeta(page: number, take: number, totalRecords: number) {
    const currentPage = page || DEFAULT_PAGINATION.page,
      currentTake = take || DEFAULT_PAGINATION.take,
      currentTotalRecords = totalRecords || DEFAULT_PAGINATION.totalRecords;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const skip = (currentPage - 1) * currentTake;

    const totalPages = Math.ceil(currentTotalRecords / currentTake);
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;

    return { currentPage, totalPages, totalRecords, nextPage, take };
  }

  /**
   * GET skip and take from page and take.
   *
   * @param page, take - .
   */
  private getSkipAndTake(page: number, take: number) {
    const currentPage = page || DEFAULT_PAGINATION.page,
      currentTake = take || DEFAULT_PAGINATION.take;
    const skip = (currentPage - 1) * currentTake;

    return { skip, take };
  }

  /**
   * Retrieves data from the database based on provided options.
   *
   * @param props - FindManyOptions to specify query options.
   */

  async find(
    props: MyFindOptionsWhere<Entity> & Partial<WithPagination<number>>,
    relations?: FindOptionsRelations<Entity> | string[],
    options?: ICRUDOptions,
  ) {
    try {
      const { page, take, ...rest } = props;

      const currentPage = page || DEFAULT_PAGINATION.page;
      const currentTake = take || DEFAULT_PAGINATION.take;
      const { skip } = this.getSkipAndTake(currentPage, +currentTake);

      const newProps = rest as MyFindOptionsWhere<Entity>;

      // Get a relation object : example {slug: true, website: true} based on where {slug: {id: 1}, website: {id: 2}} (Note: Only for relation)
      const addedRelations = this.getRelationBasedOnWhere({ ...newProps });

      // This is done so that api can be called with {slug: 1, website: 2} as well as  {slug: {id: 1}, website: {id: 2}}
      const purifyWhere = this.purifyWhere({ ...newProps });

      const [data, totalRecords] = await this.repository.findAndCount({
        relations: {
          // Added newly generated relations
          ...addedRelations,
          ...relations,
        },
        skip,
        take,
        where: {
          ...purifyWhere,
        },
      });

      const meta = this.createMeta(currentPage, currentTake, totalRecords);

      if (isEmpty(data)) {
        return this.next(ApiError.notfound(`${this.name} not found.`));
      }

      return CRUD.emitSuccess({
        data,
        name: this.name,
        res: this.response,
        descriptions: `${this.name} fetched Successfully`,
        toast: `${this.name} fetched Successfully`,
        ...(data.length > 1 && { meta }),
        ...(options?.response && { ...options?.response }),
      });
    } catch (e) {
      options?.fallback?.();
      this.next(e);
    }
  }

  /**
   * Deletes data from the database based on provided options.
   *
   * @param props - FindOneOptions to specify the data to be deleted.
   */
  async delete(props: FindOneOptions<Entity>, options?: ICRUDOptions) {
    try {
      const data = await this.repository.findOne(props);
      if (isEmpty(data) && !data) {
        return this.next(ApiError.notfound(`${this.name} not found.`));
      }
      if (data) this.repository.remove(data);
      return CRUD.emitSuccess({
        data,
        name: this.name,
        res: this.response,
        descriptions: `${this.name} delete Successfully.`,
        toast: `${this.name} delete Successfully.`,
        ...(options?.response && { ...options?.response }),
      });
    } catch (e) {
      options?.fallback?.();
      this.next(e);
    }
  }

  /**
   * Deletes all data from the database based on provided options.
   *
   * @param options - FindManyOptions to specify the data to be deleted.
   */
  async deleteAll(options?: FindManyOptions<Entity>) {
    try {
      const data = await this.repository.find(options);
      if (isEmpty(data) && !data) {
        return this.next(ApiError.notfound(`${this.name} not found.`));
      }
      if (data) {
        for (const item of data) {
          await this.repository.remove(item);
        }
      }
      return CRUD.emitSuccess({
        data: [],
        descriptions: 'Deletion Successful',
        name: this.name,
        res: this.response,
      });
    } catch (e) {
      this.next(e);
    }
  }

  /**
   * Creates new data in the database based on the provided entity-like object.
   *
   * @param entityLike - DeepPartial representing the data to be created.
   */
  async create(
    entityLike: DeepPartial<Entity> & { password?: string },
    options?: ICRUDOptions,
  ) {
    try {
      if (entityLike.password) {
        const hashedPassword = await bcrypt.hash(entityLike.password, 10);
        entityLike.password = hashedPassword;
      }
      const data = await this.repository.create({
        ...entityLike,
      });
      await this.repository.manager.save(data);
      return CRUD.emitSuccess({
        data,
        name: this.name,
        res: this.response,
        descriptions: `${this.name} created Successfully.`,
        toast: `${this.name} was created Successfully.`,
        ...(options?.response && { ...options?.response }),
      });
    } catch (e) {
      options?.fallback?.();
      return this.next(e);
    }
  }

  /**
   * Retrieves all data from the database and emits a successful response.
   */
  async getAll(
    props: FindManyOptions<Entity> & Partial<WithPagination<number>>,
    options?: ICRUDOptions,
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { page, take, ...rest } = props;

      const currentPage = page || DEFAULT_PAGINATION.page;
      const currentTake = take || DEFAULT_PAGINATION.take;
      const { skip } = this.getSkipAndTake(currentPage, currentTake);

      const [data, totalRecords] = await this.repository.findAndCount({
        ...props,
        skip,
        take,
      });
      const meta = this.createMeta(currentPage, currentTake, totalRecords);

      return CRUD.emitSuccess({
        data,
        name: this.name,
        res: this.response,
        descriptions: `${this.name}s fetched Successfully`,
        toast: `${this.name}s fetch Successfully`,
        meta,
        ...(options?.response && { ...options?.response }),
      });
    } catch (e) {
      options?.fallback?.();
      this.next(e);
    }
  }

  /**
   * Updates data in the database based on provided criteria and a partial entity.
   *
   * @param criteria - FindOptionsWhere to specify the data to be updated.
   * @param partialEntity - QueryDeepPartialEntity with optional password field for updates.
   */
  update = async (
    criteria: FindOptionsWhere<Entity>,
    partialEntity: QueryDeepPartialEntity<Entity> & { password?: string },
    options?: ICRUDOptions,
  ) => {
    try {
      if (partialEntity.password) {
        const hashedPassword = await bcrypt.hash(partialEntity.password, 10);
        partialEntity.password = hashedPassword;
      }
      await this.repository.update(criteria, partialEntity);

      const updatedUser = await this.repository.findOne({ where: criteria });

      return CRUD.emitSuccess({
        data: updatedUser,
        name: this.name,
        res: this.response,
        descriptions: `${this.name} updated Successfully.`,
        toast: `${this.name} was updated Successfully.`,
        ...(options?.response && { ...options?.response }),
      });
    } catch (e) {
      options?.fallback?.();
      this.next(e);
    }
  };
}
