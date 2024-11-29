import express, {Response, Request} from 'express';
import {DI} from '../server';
import {logger} from '../utilities/logger';
import {ApolloApiKey} from '../models/apolloApiKey';
import {SessionRequest} from 'supertokens-node/framework/express';
import config from '../config/config';

const router = express.Router();

const handleRequest = async (req: Request | SessionRequest, defaultUserId = 'anonymous') => {
  const userId = (req as SessionRequest).session?.getUserId() || defaultUserId;
  return userId;
};

router.get('/apollo-api-key', async (req: Request | SessionRequest, res: Response) => {
  try {
    const userId = await handleRequest(req);
    const apiKey = await DI.apolloApiKeys.findOne({userId});
    
    if (apiKey) {
      const decryptedKey = apiKey.getDecryptedKey();
      const obfuscatedKey = `${decryptedKey.slice(0, 4)}****${decryptedKey.slice(-4)}`;
      res.json({key: obfuscatedKey});
    } else {
      res.json({key: null});
    }
  } catch (error) {
    logger.error('Failed to fetch API key', {error});
    res.status(500).json({error: 'Failed to fetch API key'});
  }
});

router.post('/apollo-api-key', async (req: Request | SessionRequest, res: Response) => {
  try {
    const userId = await handleRequest(req);
    const {key} = req.body;
    
    if (!key) {
      return res.status(400).json({error: 'API key is required'});
    }

    let apiKey = await DI.apolloApiKeys.findOne({userId});
    if (apiKey) {
      const newApiKey = new ApolloApiKey(key, userId);
      apiKey.encryptedKey = newApiKey.encryptedKey;
      apiKey.iv = newApiKey.iv;
      apiKey.tag = newApiKey.tag;
    } else {
      apiKey = new ApolloApiKey(key, userId);
      DI.em.persist(apiKey);
    }

    await DI.em.flush();
    await DI.apolloClient.updateApiKey(key, userId);
    res.status(200).json({message: 'API key saved successfully'});
  } catch (error) {
    logger.error('Failed to save API key', {error});
    res.status(500).json({error: 'Failed to save API key'});
  }
});

router.delete('/apollo-api-key', async (req: Request | SessionRequest, res: Response) => {
  try {
    const userId = await handleRequest(req);
    const apiKey = await DI.apolloApiKeys.findOne({userId});
    
    if (!apiKey) {
      return res.status(404).json({error: 'API key not found'});
    }

    await DI.em.remove(apiKey).flush();
    await DI.apolloClient.updateApiKey('', userId);
    res.status(200).json({message: 'API key deleted successfully'});
  } catch (error) {
    logger.error('Failed to delete API key', {error});
    res.status(500).json({error: 'Failed to delete API key'});
  }
});

export default router;
