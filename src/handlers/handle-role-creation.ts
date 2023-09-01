import { type Guild, TextChannel } from 'discord.js';

import { MUTED_BY_BOT } from '../constants.ts/roles';

const createMutedByBotRole = async (guild: Guild) => {
  const role = await guild.roles.create({
    name: MUTED_BY_BOT,
  });
  guild.channels.cache.forEach((channel) => {
    if (!(channel instanceof TextChannel)) return;
    channel.permissionOverwrites
      .create(role, {
        SendMessages: false,
        CreatePublicThreads: false,
        CreatePrivateThreads: false,
        SendMessagesInThreads: false,
        SendTTSMessages: false,
        AttachFiles: false,
      })
      .catch(console.error);
  });
};

export const handleRoleCreation = async (guild: Guild) => {
  const hasMutedByBot = guild.roles.cache.find((role) => role.name === MUTED_BY_BOT);
  if (hasMutedByBot) {
    // delete to unmute all members and re-create it
    await hasMutedByBot.delete();
  }
  await createMutedByBotRole(guild);
};
