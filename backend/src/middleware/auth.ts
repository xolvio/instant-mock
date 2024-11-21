import {verifySession} from 'supertokens-node/recipe/session/framework/express';
import {middleware, errorHandler} from 'supertokens-node/framework/express';

export const authMiddleware = {
  verify: verifySession({
    sessionRequired: false,
  }),
  init: middleware(),
  error: errorHandler(),
};

// export interface AuthRequest extends Request {
//   session: {
//     getUserId(): string;
//   };
// }
//
// export const requireAuth = (
//   req: AuthRequest,
//   res: express.Response,
//   next: express.NextFunction
// ) => {
//   if (!req.session) {
//     return res.status(401).json({error: 'Unauthorized'});
//   }
//   next();
// };
