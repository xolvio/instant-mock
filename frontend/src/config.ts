import ThirdParty, {Github} from 'supertokens-auth-react/recipe/thirdparty';
import {ThirdPartyPreBuiltUI} from 'supertokens-auth-react/recipe/thirdparty/prebuiltui';
import Session from 'supertokens-auth-react/recipe/session';

export const apiDomain = `${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}`;
const websiteDomain = `${process.env.REACT_APP_FRONTEND_URL}:${process.env.REACT_APP_FRONTEND_PORT}`;

export const SuperTokensConfig = {
  appInfo: {
    appName: 'Instant Mock',
    apiDomain,
    websiteDomain,
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
export const getApiBaseUrl = () =>
  process.env.NODE_ENV === 'development' ? websiteDomain : apiDomain; // we serve up the front end in a static bundle in prod
