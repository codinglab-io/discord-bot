import type { Message } from 'discord.js';
import { MessageType } from 'discord.js';

import { config } from '../config';
import { coolLinksManagement } from '../cool-links-management';
import { patternReplacement } from '../pattern-replacement';
import { quoiFeurReact } from '../quoi-feur';

export const handleGuildMessageCreation = async (message: Message) => {
  if (message.author.bot) {
    return;
  }

  if (message.type !== MessageType.Default) {
    return;
  }

  if (message.channelId === config.discord.blablaChannelId) {
    await quoiFeurReact(message);
  }

  if (message.channelId === config.discord.coolLinksChannelId) {
    await coolLinksManagement(message);
    return;
  }

  await patternReplacement(message);
};
