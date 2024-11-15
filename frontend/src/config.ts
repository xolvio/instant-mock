import ThirdParty, { Github } from "supertokens-auth-react/recipe/thirdparty";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";
import Session from "supertokens-auth-react/recipe/session";

const BACKEND_PORT = 3033;
const FRONTEND_PORT = 3033;

export const SuperTokensConfig = {
  appInfo: {
    appName: "Instant Mock",
    apiDomain: `http://localhost:${BACKEND_PORT}`,
    websiteDomain: `http://localhost:${FRONTEND_PORT}`,
    apiBasePath: "/auth",
    websiteBasePath: "/auth"
  },
  recipeList: [
    ThirdParty.init({
      signInAndUpFeature: {
        providers: [Github.init()]
      },
    }),
    Session.init()
  ]
};

export const PreBuiltUIList = [ThirdPartyPreBuiltUI];

export const ComponentWrapper = (props: { children: JSX.Element }): JSX.Element => {
  return props.children;
};
export const getApiBaseUrl = () =>
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_API_BASE_URL || 'http://localhost:3033'
    : '';
