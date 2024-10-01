import {GraphQLSchema, DocumentNode} from 'graphql';
import {TypeInfo, visit, visitWithTypeInfo} from 'graphql';

export function findMissingFields(
  operation: DocumentNode,
  schema: GraphQLSchema
): string[] {
  const missingFields: string[] = [];

  const typeInfo = new TypeInfo(schema);
  // const context = new ValidationContext(schema, operation, typeInfo, []);

  // Custom validation to detect missing fields
  const visitor = visitWithTypeInfo(typeInfo, {
    Field(node) {
      const fieldDef = typeInfo.getFieldDef();
      if (!fieldDef) {
        missingFields.push(node.name.value);
      }
    },
  });

  visit(operation, visitor);

  return missingFields;
}
