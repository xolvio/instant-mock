import express from 'express';
import config from '../config/config';

const router = express.Router();

router.get('/auth-providers', (_, res) => {
  const providers = [];

  if (config.get('supertokens.github.clientId')) {
    providers.push({
      id: 'github',
      name: 'GitHub',
    });
  }

  if (config.get('supertokens.azure.clientId')) {
    providers.push({
      id: 'azure',
      name: 'Microsoft',
    });
  }

  res.json({providers});
});

export default router;
