import type {CodegenConfig} from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [
    {
      'https://api.apollographql.com/api/graphql': {
        headers: {
          'x-api-key': process.env.APOLLO_API_KEY as string,
          'apollo-client-name': 'xolvio',
          'apollo-client-version': '1.0.0-alpha',
        },
      },
    },
  ],
  documents: ['src/graphql/**/*.ts'],
  generates: {
    './src/graphql/apollo/types/': {
      preset: 'client',
    },
  },
  // config: {
  //   namingConvention: {
  //     enumValues: './codegen.enum-naming.ts',
  //   },
  // },
};
export default config;
