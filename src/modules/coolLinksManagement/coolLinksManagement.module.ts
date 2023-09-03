import { MessageType, ThreadAutoArchiveDuration } from 'discord.js';
import ogs from 'open-graph-scraper';

import { config } from '../../config';
import { isASocialNetworkUrl } from '../../helpers/regex.helper';
import type { BotModule } from '../../types/bot';
import { getPageSummary } from './summarizeCoolPages';
import { getVideoSummary } from './summarizeCoolVideos';

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

export const coolLinksManagement: BotModule = {
  eventHandlers: {
    messageCreate: async (message) => {
      if (
        message.author.bot ||
        message.type !== MessageType.Default ||
        message.channelId !== config.discord.coolLinksChannelId
      ) {
        return;
      }
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
      if (!youtubeUrlRegex.test(url) && !isASocialNetworkUrl(url)) {
        try {
          const pageSummaryDiscordView = await getPageSummary(url);
          await thread.send(pageSummaryDiscordView);
        } catch (error) {
          console.error(error);
        }
      }
    },
  },
};
