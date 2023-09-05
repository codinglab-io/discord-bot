import type {
  ChatInputCommandInteraction,
  ClientEvents,
  ClientOptions,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';

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
  slashCommands?: Array<BotCommand>;
  eventHandlers?: {
    [key in keyof ClientEvents]?: EventHandler<key>;
  };
  intents?: ClientOptions['intents'];
};
