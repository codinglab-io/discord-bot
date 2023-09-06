import { ChannelType, type ChatInputCommandInteraction, type Message } from 'discord.js';

import { cache } from '../../core/cache';
import { removeEmoji, removePunctuation } from '../../helpers/regex.helper';

const ONE_MINUTE = 1 * 60 * 1000;

const quoiDetectorRegex = /\bquoi\s*$/i;
const endWithQuoi = (text: string) => quoiDetectorRegex.test(removeEmoji(removePunctuation(text)));

const reactWithFeur = async (message: Message) => {
  await message.react('🇫');
  await message.react('🇪');
  await message.react('🇺');
  await message.react('🇷');
};

const reactWithCoubeh = async (message: Message) => {
  await message.react('🇨');
  await message.react('🇴');
  await message.react('🇺');
  await message.react('🇧');
  await message.react('🇪');
  await message.react('🇭');
  await message.react('🔇');

  await message.member?.timeout(ONE_MINUTE * 5, 'User have the cramptés');
};

export const reactOnEndWithQuoi = async (message: Message) => {
  if (!endWithQuoi(message.content)) return;

  const channelIds = await cache.get('quoiFeurChannels', []);
  const channelHasGame = channelIds.find((channelId) => channelId === message.channelId);
  if (!channelHasGame) return;

  const probability = 1 / 20;

  Math.random() <= probability ? await reactWithCoubeh(message) : await reactWithFeur(message);
};

export const addQuoiFeurToChannel = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.channel;
  if (!channel || !channel.isTextBased() || channel.type !== ChannelType.GuildText) return;

  const channels = await cache.get('quoiFeurChannels', []);
  if (channels.includes(channel.id)) {
    await interaction.reply('Quoi-feur is already enabled in this channel');
    return;
  }

  await cache.set('quoiFeurChannels', [...channels, channel.id]);
  await interaction.reply('Quoi-feur enabled in this channel');
};

export const removeQuoiFeurFromChannel = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.channel;
  if (!channel || !channel.isTextBased() || channel.type !== ChannelType.GuildText) return;

  const channels = await cache.get('quoiFeurChannels', []);
  if (!channels.includes(channel.id)) {
    await interaction.reply('Quoi-feur is not enabled in this channel');
    return;
  }

  await cache.set(
    'quoiFeurChannels',
    channels.filter((channelId) => channelId !== channel.id),
  );
  await interaction.reply('Quoi-feur disabled in this channel');
};
