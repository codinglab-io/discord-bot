import type { BotCommand } from '../types/bot';

export const checkUniqueSlashCommandNames = (botCommands: BotCommand[]) => {
  const slashCommandNames = botCommands.map((command) => command.schema.name);
  const uniqueSlashCommandNames = new Set(slashCommandNames);
  if (uniqueSlashCommandNames.size !== slashCommandNames.length) {
    throw new Error('Found duplicate slash command names');
  }
};
