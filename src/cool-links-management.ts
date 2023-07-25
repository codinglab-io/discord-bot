import type { Message } from 'discord.js';
import ogs from 'open-graph-scraper';

export const coolLinksManagement = async (message: Message) => {
  const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  const detectedURLs = message.content.match(urlRegex);

  if (detectedURLs === null) {
    await message.delete();
    return;
  }

  await message.react('✅');
  await message.react('❌');
  const { result, error } = await ogs({ url: detectedURLs[0] });
  const threadName = error ? message.content : `${result.ogSiteName} - ${result.ogTitle}`;
  await message.startThread({
    name: threadName,
  });
};
