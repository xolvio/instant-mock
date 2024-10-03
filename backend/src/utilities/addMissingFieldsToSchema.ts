//@ts-nocheck
import {buildASTSchema, GraphQLSchema, parse, visit} from 'graphql';
import {findMissingFieldsWithParentTypes} from './findMissingFields';
import {printSchemaWithDirectives} from '@graphql-tools/utils';

export interface MissingFieldInfo {
  parentTypeName: string; // The name of the parent type in the schema, e.g., "Product" or "Query"
  fieldName: string; // The name of the field that is missing, e.g., "price" or "description"
  hasGeneratedParentType: boolean; // Indicates if the parent type was generated (true) or already existed in the schema (false)
}

export function createProposedSubgraphsFromOperationsMissingFields(
  supergraph,
  subgraphs,
  operation: string
) {
  const missingFields: Array<MissingFieldInfo> =
    findMissingFieldsWithParentTypes(operation, supergraph);
  const subgraphsWithMissingFields = findSubgraphForMissingTypes(
    subgraphs,
    missingFields
  );
  return subgraphsWithMissingFields.map(({name, schema, missingFields}) => {
    const updatedSubgraph = addMissingFieldsToSchemaWithVisitor(
      {name, schema},
      missingFields
    );

    //remove all the extra stuff we had to add
    const sanitizedSubgraphString = updatedSubgraph.updatedSchemaString.replace(
      `directive @link(url: String!, as: String, for: link__Purpose, import: [link__Import]) repeatable on SCHEMA

directive @key(fields: FieldSet!, resolvable: Boolean = true) repeatable on OBJECT | INTERFACE

scalar FieldSet

scalar link__Import

enum link__Purpose {
  """
  \`SECURITY\` features provide metadata necessary to securely resolve fields.
  """
  SECURITY
  """
  \`EXECUTION\` features provide metadata necessary for operation execution.
  """
  EXECUTION
}

`,
      ''
    );
    console.log('sanitizedSubgraphString');
    console.log(sanitizedSubgraphString);
    // Build and return subgraph input for Apollo
    return {
      name: updatedSubgraph.name,
      activePartialSchema: {
        sdl: sanitizedSubgraphString,
      },
    };
  });
}

export function findSubgraphForMissingTypes(subgraphs, missingFields) {
  // Create a result map to hold subgraph names and their corresponding missing fields
  const subgraphMapping = new Map();

  // Ensure there's at least one subgraph available
  if (subgraphs.length === 0) {
    throw new Error('No subgraphs provided');
  }

  // Iterate over each missing field to determine the subgraph containing its parent type
  missingFields.forEach((missingField) => {
    const {parentTypeName} = missingField;

    // Find the appropriate subgraph that contains the parent type
    let matchingSubgraph = subgraphs.find(({schema}) => {
      // Ensure we are working with a GraphQLSchema instance
      if (!(schema instanceof GraphQLSchema)) {
        throw new Error(
          'Provided subgraph schema is not a GraphQLSchema instance'
        );
      }

      // Check if the type exists in the subgraph
      return schema.getType(parentTypeName) !== undefined;
    });

    // If no matching subgraph is found, use the first subgraph
    if (!matchingSubgraph) {
      matchingSubgraph = subgraphs[0];
    }

    const {name, schema} = matchingSubgraph;

    // Add the missing field to the subgraph entry
    if (!subgraphMapping.has(name)) {
      subgraphMapping.set(name, {
        name,
        schema,
        missingFields: [],
      });
    }
    subgraphMapping.get(name).missingFields.push(missingField);
  });

  // Convert the map to an array of objects for easier iteration
  return Array.from(subgraphMapping.values());
}

export function addMissingFieldsToSchemaWithVisitor(
  subgraph: {name: string; schema: GraphQLSchema},
  missingFields: Array<MissingFieldInfo>
): {name: string; updatedSchemaString: string} {
  const {name, schema} = subgraph;

  // Step 1: Convert the GraphQLSchema to SDL string representation
  const schemaSDL = printSchemaWithDirectives(schema);

  // Step 2: Parse the SDL string to a DocumentNode
  const documentNode = parse(schemaSDL);

  // Track the types and fields we need to add
  const fieldsToAdd: Record<
    string,
    Array<{fieldName: string; type: string; hasGeneratedParentType: boolean}>
  > = {};

  // Organize missing fields to be added
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
  const modifiedAst = visit(documentNode, {
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
              fields.some((field) => field.hasGeneratedParentType)
            // !node.definitions.some(
            //   (def) =>
            //     def.kind === 'ObjectTypeDefinition' &&
            //     def.name.value === typeName
            // )
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
  const updatedSchemaString = printSchemaWithDirectives(updatedSchema);

  // Print the updated schema
  console.log(`Updated Schema for ${name}:\n`, updatedSchemaString);

  // Return the updated schema along with the subgraph name
  return {name, updatedSchemaString};
}
