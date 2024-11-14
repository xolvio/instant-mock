import {
  GraphQLSchema,
  DocumentNode,
  TypeInfo,
  visit,
  visitWithTypeInfo,
  GraphQLObjectType,
  parse,
} from 'graphql';
import {MissingFieldInfo} from './operationToSchema';
import {logger} from './logger';

export function findMissingFieldsWithParentTypes(
  operation: string,
  schema: GraphQLSchema
): Array<MissingFieldInfo> {
  const missingFields: Array<MissingFieldInfo> = [];
  const parsedOperation: DocumentNode = parse(operation);
  const typeInfo = new TypeInfo(schema);

  visit(
    parsedOperation,
    visitWithTypeInfo(typeInfo, {
      Field(node, _key, _parent, _path, ancestors) {
        const fieldDef = typeInfo.getFieldDef();
        const parentType = typeInfo.getParentType();
        const isLeaf = !node.selectionSet;

        logger.debug('Processing parent type in field visitor', {parentType});

        if (!fieldDef) {
          let parentTypeName: string | undefined;
          let hasGeneratedParentType = false;

          if (parentType && parentType instanceof GraphQLObjectType) {
            parentTypeName = parentType.name;
          } else {
            const parentField = ancestors[ancestors.length - 2];

            if (
              parentField &&
              'kind' in parentField &&
              parentField.kind === 'Field'
            ) {
              parentTypeName = cap(parentField.name.value);
              hasGeneratedParentType = true;
            } else if (
              ancestors.length >= 2 &&
              'kind' in ancestors[0] &&
              ancestors[0].kind === 'OperationDefinition'
            ) {
              parentTypeName =
                ancestors[0].operation === 'query' ? 'Query' : 'Mutation';
            }
          }

          missingFields.push({
            parentTypeName,
            fieldName: node.name.value,
            hasGeneratedParentType,
            isLeaf,
          });
        }
      },
    })
  );

  return missingFields;
}

export const cap = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
