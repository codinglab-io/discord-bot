import type {
  ChatInputCommandInteraction,
  ClientEvents,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import type { ZodTypeAny } from 'zod';

type slashCommandHandler = (
  interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
) => Promise<void>;

export type EventHandler<T extends keyof ClientEvents = keyof ClientEvents> = (
  ...args: ClientEvents[T]
) => Promise<void>;

export type BotCommand = {
  schema: RESTPostAPIChatInputApplicationCommandsJSONBody;
  handler: slashCommandHandler | Record<string, slashCommandHandler>;
};

export type BotModule = {
  env?: {
    [key: string]: ZodTypeAny;
  };
  slashCommands?: Array<BotCommand>;
  eventHandlers?: {
    [key in keyof ClientEvents]?: EventHandler<key>;
  };
};
