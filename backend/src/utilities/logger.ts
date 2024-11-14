import pino, {Logger, LoggerOptions} from 'pino';

interface LogDetails {
  [key: string]: unknown;
}

interface LoggerMethods {
  startup: (message: string, details?: LogDetails) => void;
  graph: (message: string, details?: LogDetails) => void;
  db: (message: string, details?: LogDetails) => void;
  api: (message: string, details?: LogDetails) => void;
  polling: (message: string, details?: LogDetails) => void;
  info: (message: string, details?: LogDetails) => void;
  error: (error: Error | string, details?: LogDetails) => void;
  debug: (message: string, details?: LogDetails) => void;
  warn: (message: string, details?: LogDetails) => void;
  test: (message: string, details?: LogDetails) => void;
  http: (message: string, details?: LogDetails) => void;
  security: (message: string, details?: LogDetails) => void;
  metrics: (metric: string, value: number, details?: LogDetails) => void;
}

const createLogger = (options: LoggerOptions = {}): LoggerMethods => {
  const isProduction = process.env.NODE_ENV === 'production';

  const pinoLogger: Logger = pino({
    transport: !isProduction
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            levelFirst: true,
            translateTime: 'HH:MM:ss.l',
            ignore: 'pid,hostname',
            messageFormat: '{msg}',
            errorProps: '*',
            messageKey: 'msg',
            singleLine: false,
          },
        }
      : undefined,
    level: isProduction ? 'info' : 'debug',
    timestamp: pino.stdTimeFunctions.isoTime,
    ...options,
  });

  const sanitizeApiKeys = (message: string): string => {
    if (
      message.toLowerCase().includes('api_key') ||
      message.toLowerCase().includes('key')
    ) {
      return message.replace(
        /(key.*?['"].*?['"])|(api_key.*?['"].*?['"])|(['"].*?['"](?=.*key))/gi,
        "'[REDACTED]'"
      );
    }
    return message;
  };

  const formatMessage = (category: string, message: string): string => {
    const cleanMessage =
      typeof message === 'string' ? message.replace(/\\n/g, '\n') : message;
    return `[${category}] ${sanitizeApiKeys(cleanMessage)}`;
  };

  return {
    startup: (message: string, details?: LogDetails) =>
      pinoLogger.info({msg: formatMessage('Startup', message), ...details}),

    graph: (message: string, details?: LogDetails) =>
      pinoLogger.info({msg: formatMessage('Graph', message), ...details}),

    db: (message: string, details?: LogDetails) =>
      pinoLogger.info({msg: formatMessage('Database', message), ...details}),

    api: (message: string, details?: LogDetails) =>
      pinoLogger.info({msg: formatMessage('API', message), ...details}),

    polling: (message: string, details?: LogDetails) =>
      pinoLogger.info({msg: formatMessage('Polling', message), ...details}),

    error: (error: Error | string, details?: LogDetails) => {
      const errorMessage = error instanceof Error ? error.message : error;
      pinoLogger.error({
        msg: errorMessage,
        error: error instanceof Error ? error : new Error(error),
        ...details,
      });
    },

    debug: (message: string, details?: LogDetails) => {
      pinoLogger.debug({msg: message, ...details});
    },

    warn: (message: string, details?: LogDetails) =>
      pinoLogger.warn({msg: message, ...details}),

    test: (message: string, details?: LogDetails) => {
      if (process.env.NODE_ENV === 'test') {
        pinoLogger.info({msg: formatMessage('Test', message), ...details});
      }
    },
    info: (message: string, details?: LogDetails) =>
      pinoLogger.info({msg: formatMessage('Info', message), ...details}),
    http: (message: string, details?: LogDetails) =>
      pinoLogger.info({msg: formatMessage('HTTP', message), ...details}),

    security: (message: string, details?: LogDetails) =>
      pinoLogger.info({msg: formatMessage('Security', message), ...details}),

    metrics: (metric: string, value: number, details?: LogDetails) =>
      pinoLogger.info({
        msg: formatMessage('Metrics', `${metric}: ${value}`),
        value,
        ...details,
      }),
  };
};
export const logger = createLogger();
