import { EntityTarget, ObjectLiteral } from 'typeorm';

const getEntityFromProperty = (propertyPath: string) => {
  // This file should be updated as per the entity relation is created.

  const relations: Record<string, ObjectLiteral> = {
    // Add here product: Product....
  };
  return relations[propertyPath] as EntityTarget<ObjectLiteral>;
};

export default getEntityFromProperty;
