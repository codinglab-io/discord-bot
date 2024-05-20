import type {
  ChatInputCommandInteraction,
  ClientEvents,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';

type SlashCommandHandler = (
  interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
) => Promise<void>;

export type EventHandler<T extends keyof ClientEvents = keyof ClientEvents> = (
  ...args: ClientEvents[T]
) => Promise<void>;

export type BotCommand = {
  schema: RESTPostAPIChatInputApplicationCommandsJSONBody;
  handler: SlashCommandHandler | Record<string, SlashCommandHandler>;
};
