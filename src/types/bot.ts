import type {
  ChatInputCommandInteraction,
  ClientEvents,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
type slashCommandHandler = (
  interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
) => Promise<void>;

export type BotCommand = {
  schema: RESTPostAPIChatInputApplicationCommandsJSONBody;
  handler: slashCommandHandler | Record<string, slashCommandHandler>;
};

export type BotModule = {
  slashCommands?: Array<BotCommand>;
  eventHandlers?: {
    [key in keyof ClientEvents]?: (...args: ClientEvents[key]) => Promise<void>;
  };
};
