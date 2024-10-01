import {readFileSync} from 'fs';
import {join} from 'path';
import {parse, buildASTSchema} from 'graphql';
import {findMissingFields} from '../findMissingFields';

// Load and parse the supergraph schema from a local file
const supergraphSchemaRaw = readFileSync(
  join(__dirname, 'fixtures', 'supergraph.graphql'),
  'utf8'
);
const supergraphSchema = buildASTSchema(parse(supergraphSchemaRaw));

describe('findMissingFields', () => {
  it('should detect missing fields in a GraphQL operation', () => {
    const operationString = `
      query TestQuery {
        user {
          id
          name
        }
      }
    `;
    const operation = parse(operationString);
    const missingFields = findMissingFields(operation, supergraphSchema);

    // Example assertion
    expect(missingFields).toEqual(['name']); // Adjust based on actual expected missing fields
  });
});
