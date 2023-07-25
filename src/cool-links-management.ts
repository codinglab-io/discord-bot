import type { Message } from 'discord.js';
import ogs from 'open-graph-scraper';

const getThreadNameFromOpenGraph = async (url: string): Promise<string | null> => {
  try {
    const { result } = await ogs({ url });
    if (!result.success) throw new Error('No OG data found');

    const ogSiteName = result.ogSiteName;
    const ogTitle = result.ogTitle;
    if (ogSiteName && ogTitle) {
      return `${ogSiteName} - ${ogTitle}`;
    } else if (ogSiteName) {
      return ogSiteName;
    } else if (ogTitle) {
      return ogTitle;
    }
  } catch (error) {
    console.error(error);
  }

  return null;
};

export const coolLinksManagement = async (message: Message) => {
  const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  const detectedURLs = message.content.match(urlRegex);

  if (detectedURLs === null) {
    await message.delete();
    return;
  }

  await message.react('✅');
  await message.react('❌');

  const threadName = await getThreadNameFromOpenGraph(detectedURLs[0]);
  await message.startThread({
    name: threadName ?? message.content,
    autoArchiveDuration: 4320,
  });
};
