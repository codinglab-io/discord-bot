import {
  ChannelType,
  type ChatInputCommandInteraction,
  Client,
  Guild,
  type Message,
  Role,
} from 'discord.js';

import { cache } from '../../core/cache';
import { removeEmoji, removePunctuation } from '../../helpers/regex.helper';

const ONE_MINUTE = 1 * 60 * 1000;
const MUTED_BY_BOT = 'Muted by bot';

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

  const mutedRole = message.guild?.roles.cache.find((r) => r.name === MUTED_BY_BOT);

  if (!mutedRole?.id) return;

  await message.member?.roles.add(mutedRole.id);

  setTimeout(() => {
    message.member?.roles.remove(mutedRole.id).catch(console.error);
  }, ONE_MINUTE * 5);
};

export const reactOnEndWithQuoi = async (message: Message) => {
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

export const createRoleMutedByBot = async (guild: Guild | null): Promise<Role> => {
  if (!guild) {
    throw new Error('Guild is null in createRoleMutedByBot');
  }
  const existingMutedByBot = guild.roles.cache.find((role) => role.name === MUTED_BY_BOT);

  return (
    existingMutedByBot ??
    guild.roles.create({
      name: MUTED_BY_BOT,
    })
  );
};

export const deleteRoleMutedByBot = async (client: Client<true>): Promise<void> => {
  const guilds = await client.guilds.fetch().then((guilds) => guilds.map((guild) => guild.fetch()));
  const roles = await Promise.all(guilds).then((guilds) =>
    guilds.map((guild) => guild.roles.cache.find((role) => role.name === MUTED_BY_BOT)),
  );

  for (const role of roles) {
    if (!role) continue;
    await role.delete();
  }
};

export const addQuoiFeurToChannel = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.channel;
  if (!channel || !channel.isTextBased() || channel.type !== ChannelType.GuildText) return;

  const channels = await cache.get('quoiFeurChannels', []);
  if (channels.includes(channel.id)) {
    await interaction.reply('Quoi-feur is already enabled in this channel');
    return;
  }

  const role = await createRoleMutedByBot(interaction.guild);
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

export const removeQuoiFeurFromChannel = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.channel;
  if (!channel || !channel.isTextBased() || channel.type !== ChannelType.GuildText) return;

  const channels = await cache.get('quoiFeurChannels', []);
  if (!channels.includes(channel.id)) {
    await interaction.reply('Quoi-feur is not enabled in this channel');
    return;
  }

  const role = interaction.guild?.roles.cache.find((r) => r.name === MUTED_BY_BOT);
  if (role) {
    await channel.permissionOverwrites.delete(role);
  }
  await cache.set(
    'quoiFeurChannels',
    channels.filter((channelId) => channelId !== channel.id),
  );
  await interaction.reply('Quoi-feur disabled in this channel');
};
