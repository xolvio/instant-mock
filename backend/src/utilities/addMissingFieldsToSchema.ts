//@ts-nocheck
import {parse, visit, DocumentNode, buildASTSchema, printSchema} from 'graphql';

export interface MissingFieldInfo {
  parentTypeName: string; // The name of the parent type in the schema, e.g., "Product" or "Query"
  fieldName: string; // The name of the field that is missing, e.g., "price" or "description"
  hasGeneratedParentType: boolean; // Indicates if the parent type was generated (true) or already existed in the schema (false)
}

export function addMissingFieldsToSchemaWithVisitor(
  schemaString: string,
  missingFields: Array<MissingFieldInfo>
): string {
  // Parse the schema string into an AST
  const schemaAst: DocumentNode = parse(schemaString);

  // Track the types and fields we need to add
  const fieldsToAdd: Record<
    string,
    Array<{fieldName: string; type: string; hasGeneratedParentType: boolean}>
  > = {};

  missingFields.forEach(
    ({parentTypeName, fieldName, hasGeneratedParentType}) => {
      if (!fieldsToAdd[parentTypeName]) {
        fieldsToAdd[parentTypeName] = [];
      }
      fieldsToAdd[parentTypeName].push({
        fieldName,
        type: 'String',
        hasGeneratedParentType,
      });
    }
  );

  // Visit the AST and modify it
  const modifiedAst = visit(schemaAst, {
    ObjectTypeDefinition(node) {
      if (fieldsToAdd[node.name.value]) {
        // Add missing fields to existing types
        const additionalFields = fieldsToAdd[node.name.value]
          .filter((field) => !field.hasGeneratedParentType) // Only add to existing types
          .map((field) => ({
            kind: 'FieldDefinition',
            name: {kind: 'Name', value: field.fieldName},
            type: {
              kind: 'NamedType',
              name: {kind: 'Name', value: field.type},
            },
          }));

        return {
          ...node,
          fields: [...(node.fields || []), ...additionalFields],
        };
      }
      return undefined; // No modification
    },
    Document: {
      leave(node) {
        // Add new types only if they are marked with hasGeneratedParentType = true
        const newTypeDefinitions = Object.entries(fieldsToAdd)
          .filter(
            ([typeName, fields]) =>
              fields.some((field) => field.hasGeneratedParentType) &&
              !node.definitions.some(
                (def) =>
                  def.kind === 'ObjectTypeDefinition' &&
                  def.name.value === typeName
              )
          )
          .map(([typeName, fields]) => ({
            kind: 'ObjectTypeDefinition',
            name: {kind: 'Name', value: typeName},
            fields: fields.map((field) => ({
              kind: 'FieldDefinition',
              name: {kind: 'Name', value: field.fieldName},
              type: {
                kind: 'NamedType',
                name: {kind: 'Name', value: field.type},
              },
            })),
          }));

        return {
          ...node,
          definitions: [...node.definitions, ...newTypeDefinitions],
        };
      },
    },
  });

  // Convert the modified AST back to a schema
  const updatedSchema = buildASTSchema(modifiedAst);
  const updatedSchemaString = printSchema(updatedSchema);

  // Print the updated schema
  console.log('Updated Schema:\n', updatedSchemaString);

  // Return the updated schema as a string
  return updatedSchemaString;
}
