import { type Client } from 'discord.js';

import { checkUniqueSlashCommandNames } from './checkUniqueSlashCommandNames';
import type { CreatedModule } from './createModule';
import { env } from './env';
import { pushCommands, routeCommands } from './loaderCommands';
import { routeHandlers } from './routeHandlers';

export const loadModules = async (
  client: Client<true>,
  modules: CreatedModule[],
): Promise<void> => {
  await Promise.allSettled(modules.map((module) => module.eventHandlers?.ready?.(client)));

  const botCommands = modules.flatMap((module) => module.slashCommands ?? []);

  checkUniqueSlashCommandNames(botCommands);
  routeCommands(client, botCommands);

  const clientId = client.application?.id;
  if (!clientId) throw new Error('Client id is not defined');

  const { guilds } = client;

  for (const guild of guilds.cache.values()) {
    await pushCommands({
      commands: botCommands.map((command) => command.schema),
      clientId: clientId,
      guildId: guild.id,
      discordToken: env.discordToken,
    });
  }

  routeHandlers(client, modules);
};
