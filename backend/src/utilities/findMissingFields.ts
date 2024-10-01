//@ts-nocheck
import {
  GraphQLSchema,
  DocumentNode,
  TypeInfo,
  visit,
  visitWithTypeInfo,
  GraphQLObjectType,
  parse,
} from 'graphql';

interface MissingFieldInfo {
  parentTypeName: string;
  fieldName: string;
  hasGeneratedParentType: boolean;
}

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

        // Only add the field if it does not exist in the schema
        if (!fieldDef) {
          let parentTypeName: string;
          let hasGeneratedParentType = false;

          if (parentType && parentType instanceof GraphQLObjectType) {
            // Use the existing parent type name if it exists
            parentTypeName = parentType.name;
          } else {
            // If no parent type is found in the schema, derive it from the ancestor node
            const parentField = ancestors[ancestors.length - 2];

            if (parentField && parentField.kind === 'Field') {
              parentTypeName = capitalize(parentField.name.value);
              hasGeneratedParentType = true;
            } else if (
              ancestors.length >= 2 &&
              ancestors[0].kind === 'OperationDefinition'
            ) {
              // If it's a top-level field, set the parent type to 'Query' or 'Mutation'
              parentTypeName =
                ancestors[0].operation === 'query' ? 'Query' : 'Mutation';
            }
          }

          // Store the missing field information
          missingFields.push({
            parentTypeName,
            fieldName: node.name.value,
            hasGeneratedParentType,
          });
        }
      },
    })
  );

  return missingFields;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
