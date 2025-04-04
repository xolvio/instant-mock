// @ts-nocheck
import Joi from 'joi';
import {isEqual} from 'lodash';
import MockServer from '../MockServer';
import deepMerge from '../utilities/deepMerge';
import {logger} from '../utilities/logger';
import {
  NetworkErrorResponse,
  OperationMatchArguments,
  OperationSeedResponse,
  Seed,
  SeededOperationResponse,
  SeedOptions,
} from './types';

export enum SeedType {
  Operation = 'operation',
  NetworkError = 'network-error',
}

type SeedCacheInstance = {
  type: SeedType;
  options: {
    usesLeft: number;
    partialArgs: boolean;
    statusCode: number;
  };
  seedResponse: OperationSeedResponse;
  operationMatchArguments: OperationMatchArguments;
};

export default class SeedManager {
  private seedCache: Record<string, Record<string, SeedCacheInstance[]>> = {};

  private validateSeedGroupId(seedGroupId: number): boolean {
    if (!seedGroupId || typeof seedGroupId !== 'number') {
      throw new Error('seedGroupId is required');
    }

    return true;
  }

  private validateSeed(type: SeedType, seed: Seed): boolean {
    let error;

    const operationSeedSchema = Joi.object({
      operationName: Joi.string().required(),
      seedResponse: Joi.object({
        data: Joi.object(),
        errors: Joi.array().items(Joi.string(), Joi.object()),
      })
        .or('data', 'errors')
        .required(),
      operationMatchArguments: Joi.object(),
    }).required();

    const networkErrorSeedSchema = Joi.object({
      operationName: Joi.string().required(),
      seedResponse: Joi.alternatives()
        .try(Joi.object(), Joi.string(), null)
        .required(),
      operationMatchArguments: Joi.object(),
    });

    switch (type) {
      case SeedType.Operation:
        ({error} = operationSeedSchema.validate(seed));
        break;
      case SeedType.NetworkError:
        ({error} = networkErrorSeedSchema.validate(seed));
        break;
      default:
        throw new Error('Unable to validate seed: Unknown seed type');
    }

    if (error?.message) {
      throw new Error(error.message);
    }

    return true;
  }

  registerSeed(
    seedGroupId: number,
    type: SeedType,
    seed: Seed,
    {usesLeft, partialArgs, statusCode}: SeedOptions = {}
  ): void {
    this.validateSeedGroupId(seedGroupId);
    this.validateSeed(type, seed);

    const {operationName, seedResponse, operationMatchArguments = {}} = seed;
    this.seedCache[seedGroupId] ??= {};
    this.seedCache[seedGroupId][operationName] ??= [];
    this.seedCache[seedGroupId][operationName].push({
      type,
      seedResponse,
      operationMatchArguments,
      options: {
        usesLeft: usesLeft || -1, // -1 means the seed will never be removed
        partialArgs: partialArgs || false,
        statusCode: statusCode || (type === SeedType.NetworkError ? 500 : 200),
      },
    });
  }

  updateSeed(
    seedGroupId: string,
    oldOperationMatchArguments: OperationMatchArguments,
    seed: Seed
    // {usesLeft, partialArgs, statusCode}: SeedOptions = {}
  ): void {
    this.validateSeed(SeedType.Operation, seed);
    const seedCacheInstance = this.findSeed(
      seedGroupId,
      seed.operationName,
      oldOperationMatchArguments
    );
    seedCacheInstance.seed.operationMatchArguments =
      seed.operationMatchArguments;
    seedCacheInstance.seed.seedResponse = seed.seedResponse;
  }

  deleteSeed(
    seedGroupId: string,
    operationName: string,
    oldOperationMatchArguments: OperationMatchArguments
    // {usesLeft, partialArgs, statusCode}: SeedOptions = {}
  ): void {
    const {seedIndex} = this.findSeed(
      seedGroupId,
      operationName,
      oldOperationMatchArguments
    );

    if (seedIndex !== -1) {
      delete this.seedCache[seedGroupId][operationName][seedIndex];
    }
  }

  // @ts-expect-error TODO fix types
  private maybeDiscardSeed(seedGroupId, operationName, seedIndex): void {
    const seed = this.seedCache[seedGroupId][operationName][seedIndex];
    seed.options.usesLeft -= 1;
    if (seed.options.usesLeft === 0) {
      this.seedCache[seedGroupId][operationName].splice(seedIndex, 1);
    }
  }

  // @ts-expect-error TODO fix types
  private matchArguments(
    source: Record<string, unknown>,
    target: Record<string, unknown>
  ): boolean {
    return Object.entries(source).every(([argumentName, argumentValue]) => {
      if (typeof argumentValue === 'object' && argumentValue != null) {
        return this.matchArguments(
          argumentValue as Record<string, unknown>,
          target[argumentName] as Record<string, unknown>
        );
      }
      return isEqual(target[argumentName], argumentValue);
    });
  }

  // @ts-expect-error TODO fix types
  private argumentCount(args: Record<string, unknown>): number {
    return Object.entries(args).reduce((acc, [, value]) => {
      if (typeof value === 'object' && value != null) {
        return acc + this.argumentCount(value as Record<string, unknown>) + 1;
      }
      return acc + 1;
    }, 0);
  }

  // @ts-expect-error TODO fix types
  private findSeed(
    seedGroupId,
    operationName,
    operationArguments
  ): {
    seed: SeedCacheInstance | Record<string, never>;
    seedIndex: number;
  } {
    if (
      seedGroupId === undefined ||
      !this.seedCache[seedGroupId] ||
      !this.seedCache[seedGroupId][operationName]
    ) {
      logger.info(
        `No matching seed found for operationName: ${operationName}`,
        {
          seedGroupId,
        }
      );
      return {
        seed: {},
        seedIndex: -1,
      };
    }

    const seedIndex = this.seedCache[seedGroupId][operationName].findLastIndex(
      (seedDefinition) => {
        const argsMatch = this.matchArguments(
          seedDefinition.operationMatchArguments,
          operationArguments
        );

        if (seedDefinition.options.partialArgs) {
          return argsMatch;
        }

        const sameNumberOfArgs =
          this.argumentCount(operationArguments) ===
          this.argumentCount(seedDefinition.operationMatchArguments);

        return argsMatch && sameNumberOfArgs;
      }
    );

    const seed = this.seedCache[seedGroupId][operationName][seedIndex] || {};

    if (seedIndex === -1) {
      logger.debug(`No matching seed found for operation arguments`, {
        operationArguments,
        seedGroupId,
      });
    } else {
      logger.debug(`Found matching seed`, {seedGroupId});
    }

    return {
      seed,
      seedIndex,
    };
  }

  async mergeOperationResponse({
    operationName,
    variables,
    operationMock,
    seedGroupId,
    mockServer,
    query,
  }: {
    operationName: string;
    variables: Record<string, unknown>;
    operationMock: {data: Record<string, unknown>; errors?: object[]};
    seedGroupId: number;
    mockServer: MockServer;
    query: string;
  }): Promise<{
    operationResponse: SeededOperationResponse | NetworkErrorResponse;
    statusCode: number;
  }> {
    const {seed, seedIndex} = this.findSeed(
      seedGroupId,
      operationName,
      variables
    );

    if (Object.entries(seed).length) {
      const validSeed = seed as SeedCacheInstance;

      if (validSeed.type === SeedType.Operation) {
        const errors =
          validSeed.seedResponse.errors || operationMock.errors || [];
        const seededMock = await deepMerge(
          {data: operationMock.data || null},
          {data: validSeed.seedResponse.data || {}},
          {
            mockServer,
            query,
            variables,
            operationName,
          }
        );
        this.maybeDiscardSeed(seedGroupId, operationName, seedIndex);
        return {
          operationResponse: {
            data: seededMock.data.data as Record<string, unknown>,
            ...(errors.length && {errors}),
            ...(seededMock.warnings.length && {
              warnings: seededMock.warnings,
            }),
          },
          statusCode: validSeed.options.statusCode,
        };
      }

      if (validSeed.type === SeedType.NetworkError) {
        this.maybeDiscardSeed(seedGroupId, operationName, seedIndex);
        return Promise.resolve({
          operationResponse: validSeed.seedResponse,
          statusCode: validSeed.options.statusCode,
        });
      }
    }

    return {
      operationResponse: operationMock,
      statusCode: 200,
    };
  }
}
