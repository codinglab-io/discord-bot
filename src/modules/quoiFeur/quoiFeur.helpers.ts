import {
  PermissionFlagsBits,
  ChannelType,
  type ChatInputCommandInteraction,
  DMChannel,
  type Channel,
  type User,
  type Message,
  type NonThreadGuildBasedChannel,
} from 'discord.js';

import { cache } from '../../core/cache';
import type { Emoji } from '../../helpers/emoji';
import { EMOJI } from '../../helpers/emoji';
import {
  removeEmoji,
  removeMarkdown,
  removeNonASCII,
  removePunctuation,
} from '../../helpers/regex.helper';

const ONE_MINUTE = 1 * 60 * 1000;

const quoiDetectorRegex = /\bquoi\s*$/i;
const endWithQuoi = (text: string) =>
  quoiDetectorRegex.test(removeNonASCII(removeEmoji(removePunctuation(removeMarkdown(text)))));

const reactWith = async (message: Message, reactions: Emoji[]) => {
  for (const reaction of reactions) {
    await message.react(reaction);
  }
};

const reactWithCoubeh = async (message: Message) =>
  reactWith(message, [EMOJI.C, EMOJI.O, EMOJI.U, EMOJI.B, EMOJI.E, EMOJI.H, EMOJI.MUTED]);

const reactWithFeur = async (message: Message) =>
  reactWith(message, [EMOJI.F, EMOJI.E, EMOJI.U, EMOJI.R]);

export const reactOnEndWithQuoi = async (message: Message) => {
  if (!endWithQuoi(message.content)) return;

  const channelIds = await cache.get('quoiFeurChannels', []);

  const messageParentId =
    message.channel.type === ChannelType.PublicThread ? message.channel.parentId : null;

  const isMessageInQuoiFeurChannel =
    channelIds.includes(message.channelId) ||
    (messageParentId && channelIds.includes(messageParentId));

  if (!isMessageInQuoiFeurChannel) return;

  const probability = 1 / 6;

  if (Math.random() <= probability) {
    await reactWithCoubeh(message);
    await message.member?.timeout(
      ONE_MINUTE * 5,
      `${message.member.displayName} have the cramptés`,
    );
    return;
  }

  await reactWithFeur(message);
};

const isOwner = (channel : Channel, user : User) => {
  if(channel.type == ChannelType.PublicThread){
    if(user.id == channel.ownerId) return true;       
  }
  console.log("lol");
  return;  
}

export const addQuoiFeurToChannel = async (interaction: ChatInputCommandInteraction) => {
  const { channel, memberPermissions, user } = interaction;  
  
  if (!memberPermissions || !channel || !channel.isTextBased() || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.PublicThread)) return;
  if (!memberPermissions.has(PermissionFlagsBits.ManageChannels) && !isOwner(channel, user) ){
    await interaction.reply({ content: 'You don\'t have permissions to enable Quoi-feur in this channel', ephemeral: true });
    return;
  }
  
  const channels = await cache.get('quoiFeurChannels', []);
  if (channels.includes(channel.id)) {
    await interaction.reply({
      content: 'Quoi-feur is already enabled in this channel',
      ephemeral: true,
    });
    return;
  }

  await cache.set('quoiFeurChannels', [...channels, channel.id]);
  await interaction.reply({ content: 'Quoi-feur enabled in this channel', ephemeral: true });
};

export const removeQuoiFeurFromChannel = async (interaction: ChatInputCommandInteraction) => {
  const { channel, memberPermissions, user } = interaction;

  if (!memberPermissions || !channel || !channel.isTextBased() || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.PublicThread)) return;
  if (!memberPermissions.has(PermissionFlagsBits.ManageChannels) && !isOwner(channel, user) ){
    await interaction.reply({ content: 'You don\'t have permissions to disable Quoi-feur in this channel', ephemeral: true });
    return;
  }
  
  const channels = await cache.get('quoiFeurChannels', []);
  if (!channels.includes(channel.id)) {
    await interaction.reply({
      content: 'Quoi-feur is not enabled in this channel',
      ephemeral: true,
    });
    return;
  }

  await cache.set(
    'quoiFeurChannels',
    channels.filter((channelId) => channelId !== channel.id),
  );
  await interaction.reply({ content: 'Quoi-feur disabled in this channel', ephemeral: true });
};

export const cleanCacheOnChannelDelete = async (
  channel: DMChannel | NonThreadGuildBasedChannel,
) => {
  const { id } = channel;
  const channels = await cache.get('quoiFeurChannels', []);
  if (!channels.includes(id)) return;

  await cache.set(
    'quoiFeurChannels',
    channels.filter((channelId) => channelId !== id),
  );
};
