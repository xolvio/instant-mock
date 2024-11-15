import ThirdParty from 'supertokens-node/recipe/thirdparty';
import Session from 'supertokens-node/recipe/session';
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
  ],
};
