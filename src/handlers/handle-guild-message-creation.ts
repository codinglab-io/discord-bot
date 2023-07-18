import type { Message } from 'discord.js';
import { MessageType } from 'discord.js';

export const handleGuildMessageCreation = async (message: Message) => {
  if (message.author.bot) {
    return;
  }

  if (message.type !== MessageType.Default) {
    return;
  }

  const twitterUrlRegex = /https?:\/\/(mobile\.)?twitter\.com\/\S+/g;
  const twitterUrls = message.content.match(twitterUrlRegex);

  if (twitterUrls === null) {
    return;
  }

  const tweetInfo = await fetch('https://api.vxtwitter.com/' + twitterUrls[0].split('/').pop());
  const tweetInfoJson = await tweetInfo.json();
  if (tweetInfoJson.mediaURLs.length) {
    return;
  }

  const newContent = message.content.replace(twitterUrlRegex, 'https://vxtwitter.com');

  const newMessage = [`<@${message.author.id}>`, newContent].join('\n');

  await message.channel.send(newMessage);
  await message.delete();
};
