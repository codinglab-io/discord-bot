import type { CategoryChannel, GuildChannelCreateOptions, GuildMember } from 'discord.js';
import { ChannelType, OverwriteType } from 'discord.js';

import { cache } from './helpers/cache';
import { normalizeName } from './utils/normalize-name';

export const createUserVoiceChannel = async (
  parent: CategoryChannel | null,
  member: GuildMember,
): Promise<string> => {
  const { displayName, id, guild } = member;

  const name = `voice-${normalizeName(displayName)}`;

  const options: GuildChannelCreateOptions = {
    name,
    type: ChannelType.GuildVoice,
    permissionOverwrites: [
      { type: OverwriteType.Member, id, allow: ['DeafenMembers', 'MuteMembers', 'MoveMembers'] },
    ],
  };

  const channel = await guild.channels.create(parent === null ? options : { ...options, parent });

  const channels = await cache.get('channels', []);

  await cache.set('channels', [...channels, channel.id]);

  return channel.id;
};
