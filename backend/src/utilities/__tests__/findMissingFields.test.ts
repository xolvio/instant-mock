//@ts-nocheck
import {readFileSync} from 'fs';
import {join} from 'path';
import {parse, buildASTSchema} from 'graphql';
import {findMissingFieldsWithParentTypes} from '../findMissingFields';

// Load and parse the supergraph schema from a local file
const supergraphSchemaRaw = readFileSync(
  join(__dirname, 'fixtures', 'supergraph.graphql'),
  'utf8'
);
const supergraphSchema = buildASTSchema(parse(supergraphSchemaRaw));

describe('findMissingFieldsWithParentTypes', () => {
  it('should detect missing fields in a top-level GraphQL operation', () => {
    const operationString = `
      query ProductQuery($productID: String) {
        product(id: $productID) {
          id
          name
          description
          price
          stock
          category
          brand
          reviews
          theNewField
        }
      }
    `;
    const missingFields = findMissingFieldsWithParentTypes(
      operationString,
      supergraphSchema
    );

    expect(missingFields).toEqual([
      {
        parentTypeName: 'Product',
        fieldName: 'theNewField',
        hasGeneratedParentType: false,
      },
    ]);
  });
  it('should detect missing fields in a nested GraphQL object', () => {
    const operationString = `
      query ProductWithCategory {
        product(id: "123") {
          id
          name
          category {
            id
            name
            description
            products {
              id
              name
              theNewNestedField
            }
            newCategoryField
          }
        }
      }
    `;
    const missingFields = findMissingFieldsWithParentTypes(
      operationString,
      supergraphSchema
    );

    expect(missingFields).toEqual([
      {
        parentTypeName: 'Product',
        fieldName: 'theNewNestedField',
        hasGeneratedParentType: false,
      },
      {
        parentTypeName: 'Category',
        fieldName: 'newCategoryField',
        hasGeneratedParentType: false,
      },
    ]);
  });
  it('should detect missing fields involving a new type with new fields', () => {
    const operationString = `
    query NewEntityQuery {
      newEntity {
        id
        nestedEntity {
          id
          name
        }
      }
    }
  `;
    const missingFields = findMissingFieldsWithParentTypes(
      operationString,
      supergraphSchema
    );

    expect(missingFields).toEqual([
      {
        parentTypeName: 'Query',
        fieldName: 'newEntity',
        hasGeneratedParentType: false, // This is a top-level field under Query, so not generated
      },
      {
        parentTypeName: 'NewEntity',
        fieldName: 'id',
        hasGeneratedParentType: true,
      },
      {
        parentTypeName: 'NewEntity',
        fieldName: 'nestedEntity',
        hasGeneratedParentType: true,
      },
      {
        parentTypeName: 'NestedEntity',
        fieldName: 'id',
        hasGeneratedParentType: true,
      },
      {
        parentTypeName: 'NestedEntity',
        fieldName: 'name',
        hasGeneratedParentType: true,
      },
    ]);
  });
});
