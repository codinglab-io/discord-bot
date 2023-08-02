import type { Message } from 'discord.js';

const urlMappings = [
  {
    pattern: /https?:\/\/(mobile\.)?twitter\.com\/(\S+)\/status\/(\d+)/g,
    replacement: 'https://vxtwitter.com/$2/status/$3',
  },
];

export const patternReplacement = async (message: Message) => {
  let modifiedContent = message.content;

  for (const { pattern, replacement } of urlMappings) {
    if (pattern.test(modifiedContent)) {
      modifiedContent = modifiedContent.replace(pattern, replacement);
    }
  }

  const hasModification = message.content !== modifiedContent;
  if (!hasModification) return;

  const newMessage = [`<@${message.author.id}>`, modifiedContent].join('\n');

  await message.channel.send(newMessage);
  await message.delete();
};
