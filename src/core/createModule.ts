import { constantCase } from 'change-case';
import type { ClientEvents, ClientOptions } from 'discord.js';
import type { Logger } from 'pino';
import type { ZodTypeAny } from 'zod';
import { z } from 'zod';

import type { BotCommand, EventHandler } from '../types/bot';

type InferredZodShape<Shape extends Record<string, ZodTypeAny>> = {
  [K in keyof Shape]: Shape[K]['_type'];
};

interface Context<Env extends Record<string, ZodTypeAny>> {
  env: InferredZodShape<Env>;
  logger: Logger;
}

type ModuleFunction<Env extends Record<string, ZodTypeAny>, ReturnType> = (
  context: Context<Env>,
) => ReturnType;

type EventHandlers = {
  [K in keyof ClientEvents]?: EventHandler<K>;
};

type BotModule<Env extends Record<string, ZodTypeAny>> = {
  name: string;
  env?: Env;
  intents?: ClientOptions['intents'];
  slashCommands?: ModuleFunction<Env, Array<BotCommand>>;
  eventHandlers?: ModuleFunction<Env, EventHandlers>;
};

interface CreatedModuleInput {
  env: unknown;
  logger: Logger;
}

type ModuleFactory = (input: CreatedModuleInput) => Promise<CreatedModule>;

export interface CreatedModule {
  intents: ClientOptions['intents'];
  slashCommands: Array<BotCommand>;
  eventHandlers: EventHandlers;
}

export interface ModuleCreator {
  name: string;
  factory: ModuleFactory;
}

export const createModule = <Env extends Record<string, ZodTypeAny>>(
  module: BotModule<Env>,
): ModuleCreator => ({
  name: module.name,
  factory: async (input) => {
    const result = await z.object(module.env ?? ({} as Env)).safeParseAsync(input.env);

    if (!result.success) {
      const constantName = constantCase(module.name);
      const zodErrors = result.error.flatten().fieldErrors;

      const errors = Object.entries(zodErrors).reduce<Record<string, string[]>>(
        (acc, [key, value]) => ({
          ...acc,
          ...(Array.isArray(value) ? { [`${constantName}_${key}`]: value } : {}),
        }),
        {},
      );

      const formattedErrors = Object.entries(errors).reduce(
        (acc, [key, values]) => values.reduce((acc, value) => `${acc}\n\t- ${key}: ${value}`, acc),
        '',
      );

      throw new Error(
        `Encountered errors while validating environment variables for module ${module.name}:${formattedErrors}`,
      );
    }

    const context = {
      env: result.data,
    };

    return {
      intents: module.intents ?? [],
      slashCommands: module.slashCommands?.(context) ?? [],
      eventHandlers: module.eventHandlers?.(context) ?? {},
    };
  },
});
