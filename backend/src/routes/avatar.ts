import express, {Request, Response} from 'express';
import UserMetadata from 'supertokens-node/recipe/usermetadata';
import {logger} from '../utilities/logger';

const router = express.Router();

router.get('/avatar', async (req: Request, res: Response) => {
  logger.debug('api avatar route hit');
  // @ts-ignore
  const session = req.session;
  const userId = session.getUserId();
  const {metadata} = await UserMetadata.getUserMetadata(userId);
  const avatarUrl = metadata.avatarUrl;
  if (avatarUrl) {
    res.json({avatarUrl: avatarUrl});
  } else {
    res.json({avatarUrl: null});
  }
});

export default router;
