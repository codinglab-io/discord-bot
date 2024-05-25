import { red, white } from 'colorette';
import pretty from 'pino-pretty';

export default (opts: Parameters<typeof pretty>) =>
  pretty({
    ...opts,
    colorize: true,
    messageFormat: white(`[${red('{module}')}] {msg}`),
    hideObject: true,
    ignore: 'pid,hostname',
  });
