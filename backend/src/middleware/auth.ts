import {verifySession} from 'supertokens-node/recipe/session/framework/express';
import {middleware, errorHandler} from 'supertokens-node/framework/express';
import config from '../config/config';

const sessionConfig = {
  sessionRequired: config.get('requireAuth'),
};

export const authMiddleware = {
  verify: verifySession(sessionConfig),
  init: middleware(),
  error: errorHandler(),
};
