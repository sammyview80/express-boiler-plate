/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import {
  DataSource,
  EntityTarget,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { sendResponse } from './responseHandler';
import { CODE } from '../@types/status';
import { MyFindOptionsWhere } from '../@types/crud';
import { isEmpty } from '../utils/isEmpty';
import getEntityFromProperty from './getEntityWithName';
import { DbConnection } from '../db';

export interface ICRUDOptions {
  fallback?: () => void;
  response?: Partial<IEmitSuccess<any>>;
}

/**
 * An object containing properties for initializing the GET_UP_CRE instance.
 */
export interface IGET_UP_CREConstructor<Entity> {
  /**
   * The EntityTarget representing the database entity for data operations.
   */
  entity: EntityTarget<Entity>;

  /**
   * The Express Request object.
   */
  request: Request;

  /**
   * A descriptive name for the GET_UP_CRE instance.
   */
  name: string;

  /**
   * The Express Response object.
   */
  response: Response;

  /**
   * The NextFunction for handling the next middleware.
   */
  next: NextFunction;

  /**
   * An optional DataSource for database operations.
   */
  entityManager?: DataSource;
}

export interface IMetaProps {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  take: number;
  nextPage: number | null;
}

/**
 * An object containing properties for emitting a successful response.
 */
export interface IEmitSuccess<K> {
  /**
   * The Express Response object.
   */
  res: Response;

  /**
   * The response data to be sent.
   */
  data: K;

  /**
   * A descriptive name for the operation.
   */
  name: string;

  /**
   * The status code for the response.
   */
  status?: CODE;

  /**
   * The description  for the response.
   */
  descriptions?: string;

  /**
   * The toast  for the response.
   */
  toast?: string;
  /**
   * The meta  for the pagination and records info.
   */
  meta?: IMetaProps;
}

/**
 * The GET_UP_CRE class provides common functionality for handling data operations.
 * It can be extended for specific data retrieval, update, or creation tasks.
 */
export class GET_UP_CRE<Entity extends ObjectLiteral> {
  /**
   * The DataSource for database operations.
   */
  public entityManager: DataSource = DbConnection;

  /**
   * The repository for database operations.
   */
  public repository: Repository<Entity>;

  /**
   * The Express Request object.
   */
  public request: Request;

  /**
   * The EntityTarget representing the database entity.
   */
  public entity: EntityTarget<Entity>;

  /**
   * The Express Response object.
   */
  public response: Response;

  /**
   * A descriptive name for the GET_UP_CRE instance.
   */
  public name: string;

  /**
   * The NextFunction for handling the next middleware.
   */
  public next: NextFunction;

  /**
   * Creates an instance of GET_UP_CRE.
   *
   * @param props - An object containing properties to initialize the UPDATER.
   * @param props.entity - The EntityTarget representing the database entity for data updates.
   * @param props.request - The Express Request object.
   * @param props.name - A descriptive name for the UPDATER instance.
   * @param props.response - The Express Response object.
   * @param props.next - The NextFunction for handling the next middleware.
   * @param props.entityManager - An optional DataSource for database operations.
   */
  constructor({
    entity,
    request,
    response,
    name,
    next,
    entityManager,
  }: IGET_UP_CREConstructor<Entity>) {
    this.name = name;
    this.entity = entity;
    this.request = request;
    this.response = response;
    this.next = next;
    this.repository = this.entityManager.getRepository(entity);
    if (entityManager) this.entityManager = entityManager;
  }

  /**
   * Emits a successful response with the provided data.
   *
   * @param props - An object containing properties for the successful response.
   * @param props.res - The Express Response object.
   * @param props.key - The key representing the response data ("id" or "all").
   * @param props.data - The response data to be sent.
   * @param props.name - A descriptive name for the operation.
   * @param props.value - An optional value associated with the response.
   * @param props.status - The status code for the response.
   * @returns The response data with the specified status code.
   */
  static emitSuccess<K>(props: IEmitSuccess<K>) {
    const { res, data, name, descriptions, toast, status = 200, meta } = props;
    return sendResponse({
      res: res,
      data: {
        description: descriptions ?? `${name} updated successfully`,
        results: data,
        meta,
        toast: toast ?? `${name} updated successfully`,
      },
      status: status,
    });
  }

  /**
   * Checks if the request has an 'id' query parameter.
   *
   * @returns `true` if the 'id' query parameter exists, `false` otherwise.
   */
  hasId = () => !!this.request.query?.id;

  /**
   * Checks if the request has a specific parameter in the URL path.
   *
   * @param value - The parameter name to check.
   * @returns `true` if the parameter exists, `false` otherwise.
   */
  hasParam = (value: string) => !!this.request.params[value];

  /**
   * Checks if the request has a specific parameter in the URL query.
   *
   * @param value - The parameter name to check.
   * @returns `true` if the parameter exists, `false` otherwise.
   */
  hasQuery = (value: string) => !!this.request.query[value];

  /**
   * Retrieves a specific parameter value from the URL path.
   *
   * @param value - The parameter name to retrieve.
   * @returns The value of the specified parameter.
   */
  getParams = (value: string) => this.request.params[value];

  /**
   * Retrieves an array of property names associated with the entity's relations.
   *
   * @returns An array of property names.
   */
  getPropertyName = (): string[] =>
    this.entityManager
      .getMetadata(this.entity)
      .relations.map((relation) => relation.propertyName);

  getPropertyRelations = () =>
    this.entityManager.getMetadata(this.entity).relations;
  /**
   * Retrieves an array of property names and corresponding entity types based on relations.
   *
   * @returns An object with properties and entities arrays.
   */
  // getEntityAndPropertyName = (): {
  //   properties: string[];
  //   entities: EntityTarget<ObjectLiteral>[];
  // } => {
  //   const properties = this.getPropertyName();
  //   const entities = properties.map((name) => getEntityFromProperty(name));
  //   return { properties, entities };
  // };

  /**
   * Queries the database for related data based on the entity's relations and returns a record of related data.
   *
   * @returns A Promise that resolves to a record of related data.
   */
  // getRelationForCreate = async (): Promise<
  //   Record<string, Record<string, ObjectLiteral>>
  // > => {
  //   const { properties, entities } = this.getEntityAndPropertyName();
  //   const entityAlike: Record<string, ObjectLiteral> = {};
  //   for (const [index, relation] of entities.entries()) {
  //     const result = await this.entityManager.getRepository(relation).find({
  //       where: {
  //         id: this.request.body[properties[index]],
  //       },
  //     });
  //     entityAlike[properties[index]] = result;
  //   }
  //   return entityAlike;
  // };

  /**
   * Checks if related data exists in the database for the specified options and return a response of data and objetData.
   *
   * @param options - FindOptionsWhere used to specify query options.
   * @returns A Promise that resolves to `isPeekSuccess , data and objectData` if all related data exists.
   */

  peek(
    where: MyFindOptionsWhere<Entity>,
    options?: Omit<ICRUDOptions, 'response'>,
  ): Promise<{
    isPeekSuccess: boolean;
    data: Record<string, any>[];
    objectData: Record<string, any>;
  }> {
    return new Promise(async (resolve) => {
      try {
        const purifyWhere = this.purifyWhere({ ...where });
        const whereArray = Object.entries({ ...purifyWhere });
        const hasDataPromises: any = [];

        let entityRepository = this.repository as Repository<ObjectLiteral>;

        const responseObject: Record<string, any> = {};
        for (const [property, id] of whereArray) {
          if (property === 'id') {
            entityRepository = this.repository as Repository<ObjectLiteral>;
          } else {
            entityRepository = this.entityManager.getRepository(
              getEntityFromProperty(property),
            );
          }

          hasDataPromises.push(
            (async () => {
              // If the where is like {product: {id: [1, 23, 4,5 5,5 ]}}
              if (id?.id?.length > 0) {
                const pendingData = id.id.map(
                  async (item: string | number) =>
                    await entityRepository.findOne({
                      where: {
                        id: item,
                      },
                    }),
                );
                const fullfill = await Promise.all(pendingData);
                const filteredData = fullfill.filter(
                  (item: number | string | null) => item !== null,
                );
                // Check if the response object has already the property
                if (property in responseObject) {
                  responseObject[property] = [
                    ...responseObject[property],
                    ...filteredData,
                  ];
                } else responseObject[property] = filteredData;

                return filteredData;
                // If the where is like {product: {id: 1}}
              } else if (id?.id) {
                const nestedData = await entityRepository.findOne({
                  where: {
                    id: id?.id,
                  },
                });
                if (property in responseObject)
                  responseObject[property] = [
                    ...responseObject[property],
                    nestedData,
                  ];
                else responseObject[property] = nestedData;

                return nestedData;
                // If the where is like {id: 1}
              } else if (typeof id === 'number') {
                const nestedData = await entityRepository.findOne({
                  where: {
                    id,
                  },
                });
                if (property in responseObject)
                  responseObject[property] = [
                    ...responseObject[property],
                    nestedData,
                  ];
                else responseObject[property] = nestedData;

                return nestedData;
              }
            })(),
          );
        }

        const hasData = (await Promise.all(hasDataPromises)).filter(
          (item) => item !== null,
        );

        return resolve({
          isPeekSuccess: !isEmpty(hasData.flat()),
          data: hasData as Record<string, any>[],
          objectData: responseObject,
        });
      } catch (e) {
        options?.fallback?.();
        return this.next(e);
      }
    });
  }

  // This function purify where as per our requirement done so that api can be called with {slug: 1, website: 2} instead {slug: {id: 1}, website: {id: 2}}
  purifyWhere(where: MyFindOptionsWhere<Entity>) {
    const newWhere: Record<string, ObjectLiteral> = {};
    const propsArray = Object.entries(where);
    for (const [key, value] of propsArray) {
      if (this.getPropertyName().includes(key)) {
        if (typeof value !== 'object') newWhere[key] = { id: value };
      }
    }
    return {
      // This is type infer done because we use custome WhereType
      ...(where as FindOptionsWhere<Entity>),
      ...newWhere,
    };
  }

  getRelationBasedOnWhere(where: MyFindOptionsWhere<Entity>) {
    const relations: Record<string, boolean> = {};
    const newWhere = Object.entries({ ...where });

    for (const [property] of newWhere) {
      if (this.getPropertyName().includes(property)) relations[property] = true;
    }
    return relations;
  }
  /**
   * Checks if data exists in the database based on the specified options.
   *
   * @param where - FindOptionsWhere used to specify query options.
   * @returns A Promise that resolves to `true` if data exists, `false` otherwise.
   */
  isExists(where: MyFindOptionsWhere<Entity>): Promise<{
    isExists: boolean;
    data: Entity | null;
  }> {
    return new Promise(async (resolve) => {
      const newWhere = this.purifyWhere({ ...where });
      const relations = this.getRelationBasedOnWhere({ ...where });
      const data = await this.repository.findOne({
        where: { ...(newWhere as FindOptionsWhere<Entity>) },
        ...relations,
      });
      return resolve({ isExists: !!data, data });
    });
  }
}
