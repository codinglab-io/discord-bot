import type {
  ChatInputCommandInteraction,
  Client,
  ClientEvents,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';

type slashCommandHandler = (
  interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
) => Promise<void>;

export type CustomClientEvents = Omit<ClientEvents, 'ready'>;

export type EventHandler<T extends keyof CustomClientEvents = keyof CustomClientEvents> = (
  ...args: ClientEvents[T]
) => Promise<void>;

export type BotCommand = {
  schema: RESTPostAPIChatInputApplicationCommandsJSONBody;
  handler: slashCommandHandler | Record<string, slashCommandHandler>;
};

export type BotModule = {
  init?: (client: Client<true>) => Promise<void> | void;
  slashCommands?: Array<BotCommand>;
  eventHandlers?: {
    [key in keyof CustomClientEvents]?: EventHandler<key>;
  };
};
