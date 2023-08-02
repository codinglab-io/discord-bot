import type { Message } from 'discord.js';
import { MessageType } from 'discord.js';

import { config } from '../config';
import { coolLinksManagement } from '../cool-links-management';
import { patternReplacement } from '../pattern-replacement';

export const handleGuildMessageCreation = async (message: Message) => {
  if (message.author.bot) {
    return;
  }

  if (message.type !== MessageType.Default) {
    return;
  }

  if (message.channelId === config.discord.coolLinksChannelId) {
    await coolLinksManagement(message);
    return;
  }

  const content = message.content.toLowerCase().replace(/[^a-z]/g, '');
  const feurPattern = /\bfe+u+r+\b/;
  if (feurPattern.test(content)) {
    await message.delete();
    return;
  }

  await patternReplacement(message);
};
