import createLogger, { type LoggerOptions } from 'pino';

const developmentOptionsOverride: LoggerOptions = {
  transport: {
    target: './pinoTransportModule',
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
