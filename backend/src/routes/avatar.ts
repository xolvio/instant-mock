import express, {Request, Response} from 'express';
import UserMetadata from 'supertokens-node/recipe/usermetadata';
import {logger} from '../utilities/logger';

const router = express.Router();

router.get('/avatar', async (req: Request, res: Response) => {
  logger.debug('api avatar route hit');
  // @ts-ignore
  const session = req.session;

  if (!session) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'No session found',
    });
  }

  try {
    const userId = session.getUserId();
    const {metadata} = await UserMetadata.getUserMetadata(userId);
    const avatarUrl = metadata.avatarUrl;
    res.json({avatarUrl: avatarUrl || null});
  } catch (error) {
    logger.error('Error fetching avatar', {error});
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch avatar',
    });
  }
});

export default router;
