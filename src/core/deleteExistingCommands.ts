import { REST, Routes } from 'discord.js';

export const deleteExistingCommands = async (
  rest: REST,
  clientId: string,
  guildId: string,
): Promise<void> => {
  const guildCommands = (await rest.get(Routes.applicationGuildCommands(clientId, guildId))) as {
    id: string;
  }[];

  await guildCommands.reduce<Promise<void>>(async (promise, guildCommand) => {
    await promise;

    await rest.delete(Routes.applicationGuildCommand(clientId, guildId, guildCommand.id));
  }, Promise.resolve());
};
