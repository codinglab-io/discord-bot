import { ChannelType, type Message } from 'discord.js';

import { cache } from '../../core/cache';
import type { Emoji } from '../../helpers/emoji';
import { EMOJI } from '../../helpers/emoji';
import {
  removeEmoji,
  removeMarkdown,
  removeNonASCII,
  removePunctuation,
} from '../../helpers/regex.helper';
import { ONE_MINUTE } from '../../helpers/timeConstants';

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
