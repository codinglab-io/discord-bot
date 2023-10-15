import createLogger, { type LoggerOptions } from 'pino';
import type pinodev from 'pino-dev';
import type { PrettyOptions } from 'pino-pretty';

type PrettyDevOptions = Parameters<typeof pinodev>[0];
type BotLoggerOptions = LoggerOptions &
  (
    | { transport?: { target: 'pino-dev'; options: PrettyDevOptions } }
    | { transport?: { target: 'pino-pretty'; options: PrettyOptions } }
  );

const developmentOptionsOverride: BotLoggerOptions = {
  transport: {
    target: 'pino-dev',
    options: {
      colorize: true,
      // propertyMap: {
      //   module: '[module]',
      // },
    },
  },
  // transport: {
  //   target: 'pino-pretty',
  //   options: {
  //     customPrettifiers: {
  //       // module: (name) => `[${name}]`,
  //     },
  //   },
  // },
  level: process.env['LOGLEVEL'] ?? 'debug',
};

const defaultLogger = createLogger({
  level: process.env['LOGLEVEL'] ?? 'info',
  ...(process.env['NODE_ENV'] === 'production' ? {} : developmentOptionsOverride),
});

export const createLoggerForModule = (moduleName: string) =>
  defaultLogger.child({ module: moduleName });

export const coreLogger = createLoggerForModule('core');
