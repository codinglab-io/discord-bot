import { type Client } from 'discord.js';

import type { BotModule } from '../types/bot';
import { checkUniqueSlashCommandNames } from './checkModules';
import { pushCommands, routeCommands } from './loaderCommands';
import { routeHandlers } from './loaderHandlers';

export const loadModules = async (
  client: Client<true>,
  modulesToLoad: Record<string, BotModule>,
): Promise<void> => {
  const botCommands = Object.values(modulesToLoad).flatMap((module) => module.slashCommands ?? []);

  checkUniqueSlashCommandNames(modulesToLoad);
  routeCommands(client, botCommands);
  await pushCommands(botCommands.map((command) => command.schema));

  routeHandlers(client, modulesToLoad);
};
