import express, {Request, Response} from 'express';
import {DI} from '../server';
import {logger} from '../utilities/logger';
import {ApolloApiKey} from '../models/apolloApiKey';

const router = express.Router();

router.get('/apollo-api-key', async (_: Request, res: Response) => {
  logger.debug('api key route hit');
  const apiKey = await DI.apolloApiKeys.findOne({id: 1});
  if (apiKey) {
    const decryptedKey = apiKey.getDecryptedKey();
    const obfuscatedKey = `${decryptedKey.slice(0, 4)}****${decryptedKey.slice(-4)}`;
    res.json({key: obfuscatedKey});
  } else {
    res.json({key: null});
  }
});

router.post('/apollo-api-key', async (req: Request, res: Response) => {
  const {key} = req.body;

  try {
    let apiKey = await DI.apolloApiKeys.findOne({id: 1});

    if (apiKey) {
      const newApiKey = new ApolloApiKey(key);
      apiKey.encryptedKey = newApiKey.encryptedKey;
      apiKey.iv = newApiKey.iv;
      apiKey.tag = newApiKey.tag;
    } else {
      apiKey = new ApolloApiKey(key);
      DI.em.persist(apiKey);
    }

    await DI.em.flush();
    await DI.apolloClient.updateApiKey(key);

    res.status(200).json({message: 'API key saved successfully'});
  } catch (error) {
    logger.error('Failed to save API key', {error});
    res.status(500).json({message: 'Failed to save API key'});
  }
});

router.delete('/apollo-api-key', async (_: Request, res: Response) => {
  const apiKey = await DI.apolloApiKeys.findOne({id: 1});
  if (apiKey) {
    await DI.em.remove(apiKey).flush();
    await DI.apolloClient.updateApiKey('');
    res.status(200).json({message: 'API key deleted successfully'});
  } else {
    res.status(404).json({message: 'API key not found'});
  }
});

export default router;
