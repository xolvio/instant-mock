import escapeStringRegexp from 'escape-string-regexp';
import cloneDeep from 'lodash/cloneDeep';
import MockServer from '../MockServer';

/**
 * Append key to a path
 */
function buildRollingKey(currentKey: string, key: string): string {
  return currentKey ? `${currentKey}.${key}` : key;
}

/**
 * Creates a map of array item overrides based on the short-hand notation
 */
function buildShorthandOverridesMap(
  object: Record<string, unknown>,
  metaPropertyPrefix: string
): Record<number, unknown> {
  return Object.entries(object).reduce(
    (map, [key, value]) => {
      const overrideIndexWithoutPrefix = Number.parseInt(
        key.replace(
          new RegExp(`^${escapeStringRegexp(metaPropertyPrefix)}`),
          ''
        )
      );
      if (Number.isInteger(overrideIndexWithoutPrefix)) {
        map[overrideIndexWithoutPrefix] = value;
      }
      return map;
    },
    {} as Record<number, unknown>
  );
}

/**
 * Returns the result of merging target into source
 */
async function deepMerge(
  source: Record<string, unknown>,
  seed: Record<string, unknown>,
  graphqlContext: {
    query: string;
    variables: Record<string, unknown>;
    operationName: string;
    mockServer: MockServer;
  },
  options: {
    rollingKey?: string;
    metaPropertyPrefix?: string;
  } = {}
): Promise<{
  data: Record<string, unknown>;
  warnings: string[];
}> {
  const {query, operationName, mockServer, variables} = graphqlContext;
  const warnings = new Set<string>();

  async function merge(
    source: Record<string, unknown>,
    target: Record<string, unknown>,
    {
      rollingKey = '',
      metaPropertyPrefix = '$',
    }: {rollingKey?: string; metaPropertyPrefix?: string}
  ): Promise<Record<string, unknown>> {
    if (
      source.__typename &&
      target.__typename &&
      source.__typename !== target.__typename
    ) {
      source = await mockServer.getNewMock({
        query,
        variables,
        typeName: target.__typename as string,
        operationName,
        rollingKey,
      });
    }

    for (const [targetKey, targetValue] of Object.entries(target)) {
      const newRollingKey = buildRollingKey(rollingKey, targetKey);
      if (source[targetKey]) {
        if (
          typeof targetValue === 'object' &&
          targetValue !== null &&
          Number.isInteger(
            (targetValue as Record<string, unknown>)[
              `${metaPropertyPrefix}length`
            ]
          )
        ) {
          const sourceItem =
            source[targetKey] instanceof Array &&
            (source[targetKey][0] as Record<string, unknown>);
          if (sourceItem) {
            source[targetKey] = [];
            for (
              let i = 0;
              i <
              (targetValue as Record<string, number>)[
                `${metaPropertyPrefix}length`
              ];
              i++
            ) {
              const newSourceItemData = await mockServer.getNewMock({
                query,
                variables,
                typeName: sourceItem.__typename as string,
                operationName,
                rollingKey: newRollingKey,
              });
              (source[targetKey] as Array<Record<string, unknown>>).push(
                await merge(
                  newSourceItemData,
                  targetValue as Record<string, unknown>,
                  {
                    rollingKey: newRollingKey,
                    metaPropertyPrefix,
                  }
                )
              );
            }

            const shorthandOverrides = buildShorthandOverridesMap(
              targetValue as Record<string, unknown>,
              metaPropertyPrefix
            );

            for (const [index, overrideValue] of Object.entries(
              shorthandOverrides
            )) {
              if (
                source[targetKey] instanceof Array &&
                source[targetKey][+index] instanceof Object
              ) {
                source[targetKey][+index] = await merge(
                  cloneDeep(
                    source[targetKey][+index] as Record<string, unknown>
                  ),
                  overrideValue as Record<string, unknown>,
                  {rollingKey: newRollingKey, metaPropertyPrefix}
                );
              }
            }
          }
        } else if (Array.isArray(targetValue)) {
          if (Array.isArray(source[targetKey])) {
            const sourceItem = (
              source[targetKey] as Array<Record<string, unknown>>
            )[0];
            if (typeof sourceItem === 'object' && sourceItem !== null) {
              source[targetKey] = [];
              for (const item of targetValue) {
                if (typeof item !== 'object' || item === null) {
                  (source[targetKey] as unknown[]).push(item);
                } else {
                  if (Object.entries(item).length) {
                    (source[targetKey] as Array<Record<string, unknown>>).push(
                      await merge(
                        cloneDeep(sourceItem),
                        item as Record<string, unknown>,
                        {
                          rollingKey: newRollingKey,
                          metaPropertyPrefix,
                        }
                      )
                    );
                  } else {
                    (source[targetKey] as Array<Record<string, unknown>>).push(
                      sourceItem
                    );
                  }
                }
              }
            }
          } else {
            warnings.add(
              `Skipping "${newRollingKey}": source doesn't define an array at this path.`
            );
          }
        } else if (typeof targetValue === 'object' && targetValue !== null) {
          source[targetKey] = await merge(
            source[targetKey] as Record<string, unknown>,
            targetValue as Record<string, unknown>,
            {rollingKey: newRollingKey, metaPropertyPrefix}
          );
        } else {
          source[targetKey] = targetValue;
        }
      } else if (
        source[targetKey] === null ||
        source[targetKey] === false ||
        source[targetKey] === 0 ||
        source[targetKey] === ''
      ) {
        source[targetKey] = targetValue;
      } else {
        if (!targetKey.startsWith(metaPropertyPrefix)) {
          warnings.add(`Skipping "${newRollingKey}": key not found in source.`);
        }
      }
    }
    return source;
  }

  const data = await merge(source, seed, options);

  return {
    data,
    warnings: Array.from(warnings),
  };
}

export default deepMerge;
