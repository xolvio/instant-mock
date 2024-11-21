import ThirdParty, {Github} from 'supertokens-auth-react/recipe/thirdparty';
import {ThirdPartyPreBuiltUI} from 'supertokens-auth-react/recipe/thirdparty/prebuiltui';
import Session from 'supertokens-auth-react/recipe/session';
import {config} from './config';

export const SuperTokensConfig = {
  appInfo: {
    appName: 'Instant Mock',
    apiDomain: config.backend.url,
    websiteDomain: config.frontend.url,
    apiBasePath: '/auth',
    websiteBasePath: '/auth',
  },
  recipeList: [
    ThirdParty.init({
      signInAndUpFeature: {
        providers: [Github.init()],
      },
    }),
    Session.init(),
  ],
};

export const PreBuiltUIList = [ThirdPartyPreBuiltUI];

export const ComponentWrapper = (props: {
  children: JSX.Element;
}): JSX.Element => {
  return props.children;
};
