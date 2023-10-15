import createLogger, { type LoggerOptions } from 'pino';
import type { PrettyOptions } from 'pino-pretty';

type BotLoggerOptions = LoggerOptions & {
  transport?: { target: 'pino-pretty'; options: PrettyOptions };
};

const developmentOptionsOverride: BotLoggerOptions = {
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
  level: process.env['LOGLEVEL'] ?? 'debug',
};

const defaultLogger = createLogger({
  level: process.env['LOGLEVEL'] ?? 'info',
  ...(process.env['NODE_ENV'] === 'production' ? {} : developmentOptionsOverride),
});

export const createLoggerForModule = (moduleName: string) =>
  defaultLogger.child({ module: moduleName });

export const coreLogger = createLoggerForModule('core');
