//@ts-nocheck
import {buildASTSchema, GraphQLSchema, parse, visit} from 'graphql';
import {cap, findMissingFieldsWithParentTypes} from './findMissingFields';
import {printSchemaWithDirectives} from '@graphql-tools/utils';
import {SubgraphAST} from '../controllers/graphController';

export interface MissingFieldInfo {
  parentTypeName: string | undefined;
  fieldName: string;
  hasGeneratedParentType: boolean;
  isLeaf: boolean;
}

export type ProposedSubgraph = {
  name: string;
  activePartialSchema: {
    sdl: string;
  };
};

export function createProposedSubgraphsFromOperationsMissingFields(
  supergraph: GraphQLSchema,
  subgraphs: SubgraphAST[],
  operation: string
): ProposedSubgraph[] {
  console.log('supergraph here:');
  console.log(printSchemaWithDirectives(supergraph));
  console.log('subgraphs here');
  const forTest = subgraphs.map(({name, schema}) => {
    return {
      name,
      schema: printSchemaWithDirectives(schema),
    };
  });
  console.log(JSON.stringify(forTest, null, 2));
  console.log('operation');
  console.log(operation);

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

    console.log('PRE-sanitization', updatedSubgraph.updatedSchemaString);

    const sanitizedSubgraphString = updatedSubgraph.updatedSchemaString.replace(
      `directive @link(url: String!, as: String, for: link__Purpose, import: [link__Import]) repeatable on SCHEMA

directive @key(fields: FieldSet!, resolvable: Boolean = true) repeatable on OBJECT | INTERFACE

scalar FieldSet

scalar link__Import

enum link__Purpose {
  SECURITY
  EXECUTION
}

`,
      ''
    );

    console.log('POST-sanitization', sanitizedSubgraphString);

    console.log(
      JSON.stringify(
        {
          name: updatedSubgraph.name,
          activePartialSchema: {
            sdl: sanitizedSubgraphString,
          },
        },
        null,
        2
      )
    );
    return {
      name: updatedSubgraph.name,
      activePartialSchema: {
        sdl: sanitizedSubgraphString,
      },
    };
  });
}

export function findSubgraphForMissingTypes(
  subgraphs,
  missingFields: Array<MissingFieldInfo>
) {
  const subgraphMapping = new Map();

  if (subgraphs.length === 0) {
    throw new Error('No subgraphs provided');
  }

  missingFields.forEach((missingField) => {
    const {parentTypeName} = missingField;

    let matchingSubgraph = subgraphs.find(({schema}) => {
      if (!(schema instanceof GraphQLSchema)) {
        throw new Error(
          'Provided subgraph schema is not a GraphQLSchema instance'
        );
      }

      return schema.getType(parentTypeName) !== undefined;
    });

    if (!matchingSubgraph) {
      matchingSubgraph = subgraphs[0];
    }

    const {name, schema} = matchingSubgraph;

    if (!subgraphMapping.has(name)) {
      subgraphMapping.set(name, {
        name,
        schema,
        missingFields: [],
      });
    }
    subgraphMapping.get(name).missingFields.push(missingField);
  });

  return Array.from(subgraphMapping.values());
}

export function addMissingFieldsToSchemaWithVisitor(
  subgraph: {name: string; schema: GraphQLSchema},
  missingFields: Array<MissingFieldInfo>
): {name: string; updatedSchemaString: string} {
  const {name, schema} = subgraph;

  const schemaSDL = printSchemaWithDirectives(schema);

  const documentNode = parse(schemaSDL);

  const fieldsToAdd: Record<string, Array<MissingFieldInfo>> = {};

  missingFields.forEach(
    ({parentTypeName, fieldName, hasGeneratedParentType, isLeaf}) => {
      if (!fieldsToAdd[parentTypeName]) {
        fieldsToAdd[parentTypeName] = [];
      }
      fieldsToAdd[parentTypeName].push({
        fieldName,
        type: isLeaf ? 'String' : cap(fieldName),
        hasGeneratedParentType,
      });
    }
  );

  console.log('[operationToSchema.ts:152] fieldsToAdd:', fieldsToAdd);
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
  const updatedSchemaString = printSchemaWithDirectives(updatedSchema);

  // Print the updated schema
  console.log(`Updated Schema for ${name}:\n`, updatedSchemaString);

  // Return the updated schema along with the subgraph name
  return {name, updatedSchemaString};
}
