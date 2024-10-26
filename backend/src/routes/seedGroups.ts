import express, {Request, Response, Router} from 'express';
import {DI} from '../server';

const router: Router = express.Router();

router.get('/seedGroups', async (_: Request, res: Response) => {
  const seedGroups = await DI.seedGroups.findAll();
  res.json(seedGroups);
});

router.get('/seedGroups/:id', async (req: Request, res: Response) => {
  const seedGroup = await DI.seedGroups.findOne({id: parseInt(req.params.id)});
  seedGroup
    ? res.json(seedGroup)
    : res.status(404).json({message: 'SeedGroup not found'});
});

router.post('/seedGroups', async (req: Request, res: Response) => {
  const {name} = req.body;
  const seedGroup = DI.seedGroups.create({name});
  await DI.em.persistAndFlush(seedGroup);
  res.status(201).json(seedGroup);
});

router.patch('/seedGroups/:id', async (req: Request, res: Response) => {
  const seedGroup = await DI.seedGroups.findOne({id: parseInt(req.params.id)});
  if (!seedGroup) return res.status(404).json({message: 'SeedGroup not found'});
  DI.seedGroups.assign(seedGroup, req.body);
  await DI.em.persistAndFlush(seedGroup);
  res.json(seedGroup);
});

router.delete('/seedGroups/:id', async (req: Request, res: Response) => {
  const seedGroup = await DI.seedGroups.findOne({id: parseInt(req.params.id)});
  if (!seedGroup) return res.status(404).json({message: 'SeedGroup not found'});
  await DI.em.removeAndFlush(seedGroup);
  res.json({message: 'SeedGroup deleted successfully'});
});

export default router;
