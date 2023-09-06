import { ChannelType, type ChatInputCommandInteraction, type Message } from 'discord.js';

import { cache } from '../../core/cache';
import { removeEmoji, removePunctuation } from '../../helpers/regex.helper';

const ONE_MINUTE = 1 * 60 * 1000;

const quoiDetectorRegex = /\bquoi\s*$/i;
const endWithQuoi = (text: string) => quoiDetectorRegex.test(removeEmoji(removePunctuation(text)));

const reactWith = async (message: Message, reactions: string[]) => {
  for (const reaction of reactions) {
    await message.react(reaction);
  }
};

const reactWithCoubeh = async (message: Message) => {
  await reactWith(message, ['🇨', '🇴', '🇺', '🇧', '🇪', '🇭', '🔇']);
};

const reactWithFeur = async (message: Message) => {
  await reactWith(message, ['🇫', '🇪', '🇺', '🇷']);
};

export const reactOnEndWithQuoi = async (message: Message) => {
  if (!endWithQuoi(message.content)) return;

  const channelIds = await cache.get('quoiFeurChannels', []);
  const channelHasGame = channelIds.find((channelId) => channelId === message.channelId);
  if (!channelHasGame) return;

  const probability = 1 / 20;

  if (Math.random() <= probability) {
    await reactWithCoubeh(message);
    await message.member?.timeout(ONE_MINUTE * 5, 'User have the cramptés');
    return;
  }

  await reactWithFeur(message);
};

export const addQuoiFeurToChannel = async (interaction: ChatInputCommandInteraction) => {
  const { channel } = interaction;
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
  const { channel } = interaction;
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
