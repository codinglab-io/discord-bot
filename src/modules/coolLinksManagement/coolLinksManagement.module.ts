import { MessageType, ThreadAutoArchiveDuration } from 'discord.js';
import ogs from 'open-graph-scraper';
import { z } from 'zod';

import { createModule } from '../../core/createModule';
import { EMOJI } from '../../helpers/emoji';
import { isASocialNetworkUrl } from '../../helpers/regex.helper';
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

export const coolLinksManagement = createModule({
  env: {
    CHANNEL_ID: z.string().nonempty(),
    PAGE_SUMMARIZER_BASE_URL: z.string().url(),
  },
  eventHandlers: ({ env }) => ({
    messageCreate: async (message) => {
      if (
        message.author.bot ||
        message.type !== MessageType.Default ||
        message.channelId !== env.CHANNEL_ID
      ) {
        return;
      }
      const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
      const detectedURLs = message.content.match(urlRegex);

      if (detectedURLs === null) {
        await message.delete();
        return;
      }

      await message.react(EMOJI.OK);
      await message.react(EMOJI.NOT_OK);

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
          // const parseBaseUrl = `${env.PAGE_SUMMARIZER_BASE_URL}/convert.php?type=expand&lang=en&langfrom=user&url=`;
          const fullUrl = new URL('/convert.php', env.PAGE_SUMMARIZER_BASE_URL);
          const searchParams = new URLSearchParams([
            ['type', 'expand'],
            ['lang', 'en'],
            ['langfrom', 'user'],
            ['url', url],
          ]);

          fullUrl.search = searchParams.toString();

          const pageSummaryDiscordView = await getPageSummary(fullUrl.toString());
          await thread.send(pageSummaryDiscordView);
        } catch (error) {
          console.error(error);
        }
      }
    },
  }),
  intents: ['GuildMessages', 'MessageContent', 'GuildMessageReactions'],
});
