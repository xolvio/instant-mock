import type {CodegenConfig} from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'https://graphql.api.apollographql.com/api/graphql',
  documents: ['src/graphql/**/*.ts'],
  generates: {
    './src/graphql/apollo/types/': {
      preset: 'client',
    },
  },
  config: {
    namingConvention: {
      enumValues: './codegen.enum-naming.ts',
    },
  },
};
export default config;
