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
  try {
    const { result } = await ogs({ url: detectedURLs[0] });
    const threadName = result.success
      ? `${result.ogSiteName} - ${result.ogTitle}`
      : message.content;
    await message.startThread({
      name: threadName,
      autoArchiveDuration: 4320,
    });
  } catch (error) {
    console.error(error);
  }
};
