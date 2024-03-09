/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { EqualOperator, FindOperator, ObjectId } from 'typeorm';

export type MyFindOptionsWhereProperty<
  PropertyToBeNarrowed,
  Property = PropertyToBeNarrowed,
> = PropertyToBeNarrowed extends number
  ? number | Property | Property[] | FindOperator<Property> // Overwrite the behavior for numbers
  : PropertyToBeNarrowed extends Promise<infer I>
    ? MyFindOptionsWhereProperty<NonNullable<I>>
    : PropertyToBeNarrowed extends Array<infer I>
      ? MyFindOptionsWhereProperty<NonNullable<I>>
      : PropertyToBeNarrowed extends Function
        ? never
        : PropertyToBeNarrowed extends Buffer
          ? Property | FindOperator<Property>
          : PropertyToBeNarrowed extends Date
            ? Property | FindOperator<Property>
            : PropertyToBeNarrowed extends ObjectId
              ? Property | FindOperator<Property>
              : PropertyToBeNarrowed extends string
                ? Property | FindOperator<Property>
                : PropertyToBeNarrowed extends boolean
                  ? Property | FindOperator<Property>
                  : PropertyToBeNarrowed extends object
                    ?
                        | MyFindOptionsWhere<Property>
                        | MyFindOptionsWhere<Property>[]
                        | EqualOperator<Property>
                        | FindOperator<any>
                        | boolean
                        | number
                    : Property | FindOperator<Property> | Property;

// Use MyFindOptionsWhereProperty in your FindOptionsWhere type
export type MyFindOptionsWhere<Entity> = {
  [P in keyof Entity]?: P extends 'toString'
    ? unknown
    : MyFindOptionsWhereProperty<NonNullable<Entity[P]>>;
};

export interface WithPagination<T> {
  page: T;
  take: T;
}
