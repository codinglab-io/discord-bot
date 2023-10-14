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

export const isLeaveState = (oldState: VoiceState): oldState is CheckedVoiceState =>
  oldState.channel !== null && oldState.channelId !== null && oldState.member !== null;

export const handleJoinLobby = async (state: CheckedVoiceState): Promise<void> => {
  const channel = await createUserVoiceChannel(state.channel.parent, state.member);
  await state.member.voice.setChannel(channel);
};

export const handleLeaveOnDemand = async (state: CheckedVoiceState): Promise<void> => {
  const channels = await cache.get('onDemandChannels', []);

  const { channel } = state;
  const { id, members, guild } = channel;

  if (channels.includes(id) && members.size === 0) {
    await channel.delete();
    guild.channels.cache.delete(id);

    const filtered = channels.filter((channelId) => channelId !== id);
    await cache.set('onDemandChannels', filtered);
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

  const channels = await cache.get('onDemandChannels', []);

  await cache.set('onDemandChannels', [...channels, channel.id]);

  return channel.id;
};
