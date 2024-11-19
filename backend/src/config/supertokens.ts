import Session from 'supertokens-node/recipe/session';
import ThirdParty from 'supertokens-node/recipe/thirdparty';
import UserMetadata from 'supertokens-node/recipe/usermetadata';
import {TypeInput} from 'supertokens-node/types';
import config from './config';

export function getApiDomain(): string {
  const backendUrl = config.get('server.backendUrl');
  const port = config.get('server.port');
  return `${backendUrl}:${port}`;
}

export function getWebsiteDomain(): string {
  const frontendUrl = config.get('server.frontendUrl');
  const frontendPort = config.get('server.frontendPort');
  return `${frontendUrl}:${frontendPort}`;
}

function getGithubProvider() {
  const clientId = config.get('supertokens.github.clientId');
  const clientSecret = config.get('supertokens.github.clientSecret');

  if (!clientId || !clientSecret) {
    return null;
  }

  return {
    config: {
      thirdPartyId: 'github',
      clients: [
        {
          clientId,
          clientSecret,
        },
      ],
    },
  };
}

function getAzureProvider() {
  const clientId = config.get('supertokens.azure.clientId');
  const clientSecret = config.get('supertokens.azure.clientSecret');

  if (!clientId || !clientSecret) {
    return null;
  }

  return {
    config: {
      thirdPartyId: 'azure',
      name: 'azure',
      clients: [
        {
          clientId,
          clientSecret,
          scope: ['openid', 'email', 'profile', 'User.Read'],
        },
      ],
      authorizationEndpoint:
        'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenEndpoint:
        'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      userInfoEndpoint: 'https://graph.microsoft.com/v1.0/me',
      authorizationEndpointQueryParams: {
        redirect_uri: `${getApiDomain()}/auth/callback/azure`,
      },
      userInfoMap: {
        fromUserInfoAPI: {
          userId: 'id',
          email: 'mail',
        },
      },
    },
  };
}

function getConfiguredProviders() {
  const providers = [];

  const githubProvider = getGithubProvider();
  if (githubProvider) {
    providers.push(githubProvider);
  }

  const azureProvider = getAzureProvider();
  if (azureProvider) {
    providers.push(azureProvider);
  }

  return providers;
}

export const SuperTokensConfig: TypeInput = {
  debug: true,
  supertokens: {
    connectionURI: config.get('supertokens.connectionUri'),
  },
  appInfo: {
    appName: 'Instant Mock',
    apiDomain: getApiDomain(),
    websiteDomain: getWebsiteDomain(),
    apiBasePath: '/auth',
    websiteBasePath: '/auth',
  },
  recipeList: [
    ThirdParty.init({
      override: {
        functions: (originalImplementation) => ({
          ...originalImplementation,
          signInUp: async function (input) {
            const response = await originalImplementation.signInUp(input);
            if (response.status === 'OK') {
              const avatar =
                response.rawUserInfoFromProvider.fromUserInfoAPI?.user
                  ?.avatar_url;
              if (avatar) {
                await UserMetadata.updateUserMetadata(response.user.id, {
                  avatarUrl: avatar,
                });
              }
            }
            return response;
          },
        }),
      },
      signInAndUpFeature: {
        providers: getConfiguredProviders(),
      },
    }),
    Session.init(),
    UserMetadata.init(),
  ],
};
