import type { Message } from 'discord.js';
import { MessageType } from 'discord.js';

const urlMappings = [
  {
    pattern: /https?:\/\/(mobile\.)?twitter\.com\/(\S+)\/status\/(\d+)/g,
    replacement: 'https://vxtwitter.com/$3',
  },
];

export const handleGuildMessageCreation = async (message: Message) => {
  if (message.author.bot) {
    return;
  }

  if (message.type !== MessageType.Default) {
    return;
  }

  let modifiedContent = message.content;
  let hasModification = false;

  for (const { pattern, replacement } of urlMappings) {
    if (pattern.test(modifiedContent)) {
      modifiedContent = modifiedContent.replace(pattern, replacement);
      hasModification = true;
    }
  }

  if (!hasModification) {
    return;
  }
  const newMessage = [`<@${message.author.id}>`, modifiedContent].join('\n');

  await message.channel.send(newMessage);
  await message.delete();
};
