import { REST, Routes } from 'discord.js';

import { config } from './config';

export const deleteExistingCommands = async (
  rest: REST,
  discord: typeof config.discord,
): Promise<void> => {
  const guildCommands = (await rest.get(
    Routes.applicationGuildCommands(discord.clientId, discord.guildId),
  )) as { id: string }[];

  await guildCommands.reduce<Promise<void>>(async (promise, guildCommand) => {
    await promise;

    await rest.delete(
      Routes.applicationGuildCommand(discord.clientId, discord.guildId, guildCommand.id),
    );
  }, Promise.resolve());
};
