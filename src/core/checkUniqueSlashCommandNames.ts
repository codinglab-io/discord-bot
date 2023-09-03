import type { BotModule } from '../types/bot';

export const checkUniqueSlashCommandNames = (modulesToLoad: Record<string, BotModule>) => {
  const slashCommandNames = Object.values(modulesToLoad)
    .flatMap((module) => module.slashCommands ?? [])
    .map((command) => command.schema.name);
  const uniqueSlashCommandNames = new Set(slashCommandNames);
  if (uniqueSlashCommandNames.size !== slashCommandNames.length) {
    throw new Error('Found duplicate slash command names');
  }
};
