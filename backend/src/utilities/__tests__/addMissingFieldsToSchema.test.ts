import {parse, printSchema, buildASTSchema} from 'graphql';
import {
  addMissingFieldsToSchemaWithVisitor,
  MissingFieldInfo,
} from '../addMissingFieldsToSchema';

describe('addMissingFieldsToSchemaWithVisitor', () => {
  const schemaString = `
    type Query {
      product: Product
    }

    type Product {
      id: String
      name: String
    }
  `;

  it('should successfully add missing fields and new types (Pass Test)', () => {
    const missingFields: Array<MissingFieldInfo> = [
      {
        parentTypeName: 'Product',
        fieldName: 'price',
        hasGeneratedParentType: false,
      },
      {
        parentTypeName: 'Category',
        fieldName: 'description',
        hasGeneratedParentType: true,
      },
    ];

    const updatedSchemaString = addMissingFieldsToSchemaWithVisitor(
      schemaString,
      missingFields
    );
    const expectedSchemaString = `
      type Query {
        product: Product
      }

      type Product {
        id: String
        name: String
        price: String
      }

      type Category {
        description: String
      }
    `;

    expect(updatedSchemaString.trim()).toBe(
      printSchema(buildASTSchema(parse(expectedSchemaString))).trim()
    );
  });

  it('should not create new types when hasGeneratedParentType is false (Fail Test)', () => {
    const missingFields: Array<MissingFieldInfo> = [
      {
        parentTypeName: 'NonExistentType',
        fieldName: 'someField',
        hasGeneratedParentType: false,
      },
    ];

    const updatedSchemaString = addMissingFieldsToSchemaWithVisitor(
      schemaString,
      missingFields
    );
    const expectedSchemaString = `
      type Query {
        product: Product
      }

      type Product {
        id: String
        name: String
      }
    `;

    expect(updatedSchemaString.trim()).toBe(
      printSchema(buildASTSchema(parse(expectedSchemaString))).trim()
    );
  });
});
