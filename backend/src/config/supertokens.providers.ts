import config from './config';
import { logger } from '../utilities/logger';
import { ProviderInput } from 'supertokens-node/lib/build/recipe/thirdparty/types';

export function getAuthProviders(): ProviderInput[] {
    const providers = [];

    const githubConfig = config.get('supertokens.github');
    if (githubConfig?.clientId && githubConfig?.clientSecret) {
        providers.push({
            config: {
                thirdPartyId: 'github',
                clientId: githubConfig.clientId,
                clientSecret: githubConfig.clientSecret,
            },
        });
    }

    return providers;
}

