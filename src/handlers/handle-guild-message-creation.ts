import type { Message } from 'discord.js';

export const handleGuildMessageCreation = async (message: Message) => {
  const urls = message.content.match(/https?:\/\/\S+/g);
  if (urls === null) {
    return;
  }

  const newContent = message.content.replaceAll(
    /https?:\/\/(mobile\.)?twitter\.com/g,
    'https://vxtwitter.com'
  );

  const newMessage = [`<@${message.author.id}>`, newContent].join('\n');

  await message.channel.send(newMessage);
  await message.delete();
};
