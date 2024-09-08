import {Request, Response} from 'express';
import mockInstances from '../mockInstances';
import {MockService} from '../service/mockService';

export default class MockController {
  private mockService: MockService;

  constructor() {
    this.mockService = MockService.getInstance();
    this.startNewMockInstance = this.startNewMockInstance.bind(this);
  }

  async startNewMockInstance(req: Request, res: Response) {
    const {graphId, variantName} = req.query;
    if (!variantName) {
      return res.status(400).send('Variant Name is required');
    }

    if (mockInstances[graphId as string][variantName as string]) {
      return (
        res
          .status(409)
          //   TODO remove that
          .send(
            `A mocking service is already running for variant name ${variantName} on port ${mockInstances[variantName as string]}`
          )
      );
    }

    try {
      await this.mockService.startNewMockServer(
        graphId as string,
        variantName as string
      );
      res.json({
        variantName,
        message: `Mocking service started with SDL from ${variantName}`,
      });
    } catch (error) {
      console.error('Error in starting mocking service:', error);
      res.status(500).send('Error starting mocking service');
    }
  }
}
