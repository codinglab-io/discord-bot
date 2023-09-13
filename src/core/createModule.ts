import type { ClientEvents, ClientOptions } from 'discord.js';
import type { ZodTypeAny } from 'zod';
import { z } from 'zod';

import type { BotCommand, EventHandler } from '../types/bot';

type InferredZodShape<Shape extends Record<string, ZodTypeAny>> = {
  [K in keyof Shape]: Shape[K]['_type'];
};

interface Context<Env extends Record<string, ZodTypeAny>> {
  env: InferredZodShape<Env>;
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

interface CreatedModule {
  intents: ClientOptions['intents'];
  slashCommands: Array<BotCommand>;
  eventHandlers: EventHandlers;
}

interface CreatedModuleInput {
  env: unknown;
  cache: unknown;
}

export const createModule = <Env extends Record<string, ZodTypeAny>>(
  module: BotModule<Env>,
): ((input: CreatedModuleInput) => Promise<CreatedModule>) => {
  return async (input) => {
    const env = await z.object(module.env ?? ({} as Env)).parseAsync(input.env);

    const context = {
      env,
    };

    return {
      intents: module.intents ?? [],
      slashCommands: module.slashCommands?.(context) ?? [],
      eventHandlers: module.eventHandlers?.(context) ?? {},
    };
  };
};
