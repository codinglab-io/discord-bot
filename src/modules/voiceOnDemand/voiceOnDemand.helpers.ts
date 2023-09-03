import type {
  CategoryChannel,
  GuildChannelCreateOptions,
  GuildMember,
  VoiceState,
} from 'discord.js';
import { ChannelType, OverwriteType } from 'discord.js';
import type { SetNonNullable } from 'type-fest';

import { cache } from '../../core/cache';
import { normalizeName } from '../../helpers/normalizeName.helper';

type CheckedVoiceState = SetNonNullable<VoiceState, 'channel' | 'channelId' | 'member'>;

export const isJoinState = (newState: VoiceState): newState is CheckedVoiceState =>
  newState.channel !== null && newState.channelId !== null && newState.member !== null;

export const isLeaveState = (oldDate: VoiceState): oldDate is CheckedVoiceState =>
  oldDate.channel !== null && oldDate.channelId !== null && oldDate.member !== null;

export const handleJoin = async (state: CheckedVoiceState, lobbyId: string): Promise<void> => {
  if (state.channelId !== lobbyId) {
    return;
  }

  const channel = await createUserVoiceChannel(state.channel.parent, state.member);
  await state.member.voice.setChannel(channel);
};

export const handleLeave = async (state: CheckedVoiceState): Promise<void> => {
  const channels = await cache.get('channels', []);

  const { channel } = state;
  const { id, members, guild } = channel;

  if (channels.includes(id) && members.size === 0) {
    await channel.delete();
    guild.channels.cache.delete(id);

    const filtered = channels.filter((channelId) => channelId !== id);
    await cache.set('channels', filtered);
  }
};

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
