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
    host: {
      env: 'HOST',
      format: String,
      default: '0.0.0.0',
    },
    backendUrl: {
      env: 'BACKEND_URL',
      format: String,
      default: 'http://localhost',
    },
    frontendUrl: {
      env: 'FRONTEND_URL',
      format: String,
      default: 'http://localhost',
    },
    frontendPort: {
      env: 'FRONTEND_PORT',
      format: 'port',
      default: 3033,
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
  },
});

config.validate({allowed: 'strict'});

export default config;
