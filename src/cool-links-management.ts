import { type Message, ThreadAutoArchiveDuration } from 'discord.js';
import ogs from 'open-graph-scraper';
import { getVideoSummary } from './summarize-cool-videos';

const getThreadNameFromOpenGraph = async (url: string): Promise<string | null> => {
  try {
    const { result } = await ogs({ url });
    if (!result.success) throw new Error('No OG data found');

    const ogSiteName = result.ogSiteName;
    const ogTitle = result.ogTitle;
    if (ogSiteName && ogTitle) {
      return `${ogSiteName} - ${ogTitle}`;
    }
    if (ogSiteName) {
      return ogSiteName;
    }
    if (ogTitle) {
      return ogTitle;
    }
  } catch (error) {
    console.error(error);
  }

  return null;
};

const youtubeUrlRegex = new RegExp('^(https?)?(://)?(www.)?(m.)?((youtube.com)|(youtu.be))');

export const coolLinksManagement = async (message: Message) => {
  const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  const detectedURLs = message.content.match(urlRegex);

  if (detectedURLs === null) {
    await message.delete();
    return;
  }

  await message.react('✅');
  await message.react('❌');

  const url = detectedURLs[0];
  const threadName = await getThreadNameFromOpenGraph(url);
  const thread = await message.startThread({
    name: threadName ?? message.content,
    autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
  });
  if (thread.joinable) await thread.join();

  if (youtubeUrlRegex.test(url)) {
    const summary = await getVideoSummary(url);
    if (!summary) return;

    await thread.send(summary);
  }
};
