import { type Client } from 'discord.js';

import type { BotModule } from '../types/bot';
import { checkUniqueSlashCommandNames } from './checkUniqueSlashCommandNames';
import { pushCommands, routeCommands } from './loaderCommands';
import { routeHandlers } from './routeHandlers';

export const loadModules = async (
  client: Client<true>,
  modulesToLoad: Record<string, BotModule>,
): Promise<void> => {
  const botCommands = Object.values(modulesToLoad).flatMap((module) => module.slashCommands ?? []);
  checkUniqueSlashCommandNames(botCommands);
  routeCommands(client, botCommands);

  const clientId = client.application?.id;
  if (!clientId) throw new Error('Client id is not defined');

  const { guilds } = client;

  for (const guild of guilds.cache.values()) {
    await pushCommands(
      botCommands.map((command) => command.schema),
      clientId,
      guild.id,
    );
  }
  routeHandlers(client, modulesToLoad);
};
