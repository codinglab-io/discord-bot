import {
  ChannelType,
  type ChatInputCommandInteraction,
  type DMChannel,
  type NonThreadGuildBasedChannel,
} from 'discord.js';
import { cache, type CacheEntries } from '../core/cache';

type ChannelArrayCacheKey = Pick<
  CacheEntries,
  'quoiFeurChannels' | 'cookieHunterChannels' | 'cookieHunterDailyLogChannels'
>;

export const addChannelInCache = async (
  interaction: ChatInputCommandInteraction,
  featureName: string,
  cacheKey: keyof ChannelArrayCacheKey,
) => {
  const { channel } = interaction;
  if (!channel || !channel.isTextBased() || channel.type !== ChannelType.GuildText) return;

  const channels = await cache.get(cacheKey, []);
  if (channels.includes(channel.id)) {
    await interaction.reply({
      content: `${featureName} is already enabled in this channel`,
      ephemeral: true,
    });
    return;
  }

  await cache.set(cacheKey, [...channels, channel.id]);
  await interaction.reply({ content: `${featureName} enabled in this channel`, ephemeral: true });
};

export const removeChannelFromChache = async (
  interaction: ChatInputCommandInteraction,
  featureName: string,
  cacheKey: keyof ChannelArrayCacheKey,
) => {
  const { channel } = interaction;
  if (!channel || !channel.isTextBased() || channel.type !== ChannelType.GuildText) return;

  const channels = await cache.get(cacheKey, []);
  if (!channels.includes(channel.id)) {
    await interaction.reply({
      content: `${featureName} is not enabled in this channel`,
      ephemeral: true,
    });
    return;
  }

  await cache.set(
    cacheKey,
    channels.filter((channelId) => channelId !== channel.id),
  );
  await interaction.reply({ content: `${featureName} disabled in this channel`, ephemeral: true });
};

export const cleanCacheOnChannelDelete = async (
  channel: DMChannel | NonThreadGuildBasedChannel,
  cacheKey: keyof ChannelArrayCacheKey,
) => {
  const { id } = channel;
  const channels = await cache.get(cacheKey, []);
  if (!channels.includes(id)) return;

  await cache.set(
    cacheKey,
    channels.filter((channelId) => channelId !== id),
  );
};
