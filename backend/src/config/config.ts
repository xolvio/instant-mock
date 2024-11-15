import convict from 'convict';
import dotenv from 'dotenv';

dotenv.config();

export enum NodeEnvironment {
  Production = 'production',
  Development = 'development',
  Test = 'test',
}

const config = convict({
  node: {
    env: {
      env: 'NODE_ENV',
      format: Object.values(NodeEnvironment),
      default: NodeEnvironment.Development,
    },
  },
  server: {
    port: {
      env: 'PORT',
      format: 'port',
      default: 3033,
    },
    apiUrl: {
      env: 'API_URL',
      format: String,
      default: 'http://localhost:3033',
    },
    websiteUrl: {
      env: 'WEBSITE_URL',
      format: String,
      default: 'http://localhost:3000',
    },
  },
  supertokens: {
    connectionUri: {
      env: 'SUPERTOKENS_CONNECTION_URI',
      format: String,
      default: 'http://supertokens:3567',
    },
    apiKey: {
      env: 'SUPERTOKENS_API_KEY',
      format: '*',
      sensitive: true,
      default: null,
    },
    azure: {
      clientId: {
        env: 'AZURE_CLIENT_ID',
        format: '*',
        default: null,
      },
      clientSecret: {
        env: 'AZURE_CLIENT_SECRET',
        format: '*',
        sensitive: true,
        default: null,
      },
      tenantId: {
        env: 'AZURE_TENANT_ID',
        format: '*',
        default: null,
      },
    },
    github: {
      clientId: {
        env: 'GITHUB_CLIENT_ID',
        format: '*',
        default: null,
      },
      clientSecret: {
        env: 'GITHUB_CLIENT_SECRET',
        format: '*',
        sensitive: true,
        default: null,
      },
    },
    google: {
      clientId: {
        env: 'GOOGLE_CLIENT_ID',
        format: '*',
        default: null,
      },
      clientSecret: {
        env: 'GOOGLE_CLIENT_SECRET',
        format: '*',
        sensitive: true,
        default: null,
      },
    },
    aws: {
      clientId: {
        env: 'AWS_CLIENT_ID',
        format: '*',
        default: null,
      },
      clientSecret: {
        env: 'AWS_CLIENT_SECRET',
        format: '*',
        sensitive: true,
        default: null,
      },
      region: {
        env: 'AWS_REGION',
        format: String,
        default: 'us-east-1',
      },
      userPoolId: {
        env: 'AWS_USER_POOL_ID',
        format: '*',
        default: null,
      },
    },
  },
});

config.validate({allowed: 'strict'});

export default config;
