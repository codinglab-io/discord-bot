import { type ChatInputCommandInteraction, type Message, TextChannel } from 'discord.js';

import { MUTED_BY_BOT } from '../../constants/roles';
import { cache } from '../../core/cache';
import { endWithQuoi } from '../../helpers/regex.helper';

const ONE_MINUTE = 1 * 60 * 1000;

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

  const mutedRole = message.guild?.roles.cache.find((r) => r.name === MUTED_BY_BOT);

  if (!mutedRole?.id) return;

  await message.member?.roles.add(mutedRole.id);

  setTimeout(() => {
    message.member?.roles.remove(mutedRole.id).catch(console.error);
  }, ONE_MINUTE * 5);
};

export const quoiFeurReact = async (message: Message) => {
  const channelIds = await cache.get('quoiFeurChannels', []);
  const channelHasGame = channelIds.find((channelId) => channelId === message.channelId);
  if (!channelHasGame) return;

  if (!endWithQuoi(message.content)) return;

  const probability = 1 / 20;

  try {
    Math.random() <= probability ? await reactWithCoubeh(message) : await reactWithFeur(message);
  } catch (error) {
    console.error(error);
  }
};

export const addQuoiFeurChannel = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.channel;
  if (!channel || !channel.isTextBased()) return;

  const channels = await cache.get('quoiFeurChannels', []);
  if (channels.includes(channel.id)) {
    await interaction.reply('Quoi-feur is already enabled in this channel');
    return;
  }

  const role = interaction.guild?.roles.cache.find((r) => r.name === MUTED_BY_BOT);
  if (!role) {
    throw new Error(`Role ${MUTED_BY_BOT} is missing`);
  }

  if (!(channel instanceof TextChannel)) return;
  await channel.permissionOverwrites.create(role, {
    SendMessages: false,
    CreatePublicThreads: false,
    CreatePrivateThreads: false,
    SendMessagesInThreads: false,
    SendTTSMessages: false,
    AttachFiles: false,
  });
  await cache.set('quoiFeurChannels', [...channels, channel.id]);
  await interaction.reply('Quoi-feur enabled in this channel');
};

export const removeQuoiFeurChannel = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.channel;
  if (!channel || !channel.isTextBased()) return;

  const channels = await cache.get('quoiFeurChannels', []);
  if (!channels.includes(channel.id)) {
    await interaction.reply('Quoi-feur is not enabled in this channel');
    return;
  }

  const role = interaction.guild?.roles.cache.find((r) => r.name === MUTED_BY_BOT);
  if (!role) return;
  if (!(channel instanceof TextChannel)) return;

  await channel.permissionOverwrites.delete(role);
  await cache.set(
    'quoiFeurChannels',
    channels.filter((channelId) => channelId !== channel.id),
  );
  await interaction.reply('Quoi-feur disabled in this channel');
};
