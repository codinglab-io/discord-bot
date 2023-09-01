import { type Guild } from 'discord.js';

import { MUTED_BY_BOT } from '../constants/roles';

export const handleRoleCreation = async (guild: Guild) => {
  const hasMutedByBot = guild.roles.cache.find((role) => role.name === MUTED_BY_BOT);
  if (hasMutedByBot) {
    // delete to unmute all members and re-create it
    await hasMutedByBot.delete();
  }
  await guild.roles.create({
    name: MUTED_BY_BOT,
  });
};
