import express, {Request, Response} from 'express';
import {DI} from '../server';

const router = express.Router();

router.get('/apollo-api-key', async (_: Request, res: Response) => {
  console.log('api key route hit');
  const apiKey = await DI.apolloApiKeys.findOne({id: 1});
  const obfuscatedKey = apiKey
    ? `${apiKey.key.slice(0, 4)}****${apiKey.key.slice(-4)}`
    : null;
  res.json({key: obfuscatedKey});
});

router.post('/apollo-api-key', async (req: Request, res: Response) => {
  const {key} = req.body;

  let apiKey = await DI.apolloApiKeys.findOne({id: 1});

  if (apiKey) {
    apiKey.key = key;
  } else {
    apiKey = DI.apolloApiKeys.create({id: 1, key});
    DI.em.persist(apiKey);
  }

  await DI.em.flush();

  await DI.apolloClient.updateApiKey(key);

  res.status(200).json({message: 'API key saved successfully'});
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
