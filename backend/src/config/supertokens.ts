import Session from 'supertokens-node/recipe/session';
import ThirdParty from 'supertokens-node/recipe/thirdparty';
import UserMetadata from 'supertokens-node/recipe/usermetadata';
import {TypeInput} from 'supertokens-node/types';
import config from './config';

export function getApiDomain(): string {
  return config.get('server.apiUrl');
}

export function getWebsiteDomain(): string {
  return config.get('server.websiteUrl');
}

export const SuperTokensConfig: TypeInput = {
  supertokens: {
    connectionURI:
      config.get('supertokens.connectionUri') || 'http://localhost:3567',
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
        functions: (originalImplementation) => {
          return {
            ...originalImplementation,
            // override the thirdparty sign in / up API
            signInUp: async function (input) {
              const response = await originalImplementation.signInUp(input);

              if (response.status === 'OK') {
                const avatar =
                  response.rawUserInfoFromProvider.fromUserInfoAPI?.user
                    .avatar_url;
                if (avatar) {
                  await UserMetadata.updateUserMetadata(response.user.id, {
                    avatarUrl: avatar,
                  });
                }
              }

              return response;
            },
          };
        },
      },
      signInAndUpFeature: {
        providers: [
          {
            config: {
              thirdPartyId: 'github',
              clients: [
                {
                  clientId: (() => {
                    const clientId = config.get('supertokens.github.clientId');
                    if (!clientId)
                      throw new Error(
                        'GITHUB_CLIENT_ID is required for authentication'
                      );
                    return clientId;
                  })(),
                  clientSecret: (() => {
                    const clientSecret = config.get(
                      'supertokens.github.clientSecret'
                    );
                    if (!clientSecret)
                      throw new Error(
                        'GITHUB_CLIENT_SECRET is required for authentication'
                      );
                    return clientSecret;
                  })(),
                },
              ],
            },
          },
        ],
      },
    }),
    Session.init(),
    UserMetadata.init(),
  ],
};
