import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageType } from 'discord.js';
import { z } from 'zod';

import { createModule } from '../../core/createModule';
import { resolveCatch } from '../../helpers/resolveCatch.helper';

const FXTwitterResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  tweet: z.object({
    media: z
      .object({
        videos: z
          .array(
            z
              .object({
                type: z.enum(['gif', 'video']),
                url: z.string(),
              })
              .optional(),
          )
          .optional(),
      })
      .optional(),
  }),
});

type URLMapping = {
  pattern: RegExp;
  replacement: string;
};

const modulePrefixButtonId = 'fixEmbedTwitterVideo-';
const deleteBotAnswerPrefixButtonId = modulePrefixButtonId + 'deleteBotAnswer-';
const deleteBotAnswerButtonId = deleteBotAnswerPrefixButtonId + '$authorIdMessage';
const ignoreConfirmationButtonId = modulePrefixButtonId + 'ignoreBotButtons';

const twitterUrlMappings: URLMapping[] = [
  {
    pattern: /https?:\/\/(mobile\.)?(twitter|x)\.com\/(\S+)\/status\/(\d+)/g,
    replacement: 'https://fxtwitter.com/$3/status/$4',
  },
];

const FXTwitterUrlMappings: URLMapping[] = [
  {
    pattern: /https?:\/\/fxtwitter\.com\/(\S+)\/status\/(\d+)/g,
    replacement: 'https://api.fxtwitter.com/$1/status/$2',
  },
];

const matchAndReplaceTweetLink = (message: string, urlMappings: URLMapping[]) => {
  let tweetLink = '';

  for (const urlMapping of urlMappings) {
    const twitterLinks = message.match(urlMapping.pattern);

    if (twitterLinks && twitterLinks.length > 0) {
      tweetLink = twitterLinks[0].replace(urlMapping.pattern, urlMapping.replacement);

      break;
    }
  }

  return tweetLink;
};

const isTwitterVideo = async (tweetURL: string): Promise<boolean> => {
  const twitterId = tweetURL.split('/').pop();
  if (!twitterId) return false;

  const apiFxTweetURL = matchAndReplaceTweetLink(tweetURL, FXTwitterUrlMappings);
  const [tweetInfoError, tweetInfo] = await resolveCatch(fetch(apiFxTweetURL, { method: 'GET' }));

  if (tweetInfoError) return false;

  const tweetInfoJson = FXTwitterResponseSchema.safeParse(await tweetInfo.json());
  if (!tweetInfoJson.success) return false;

  if (tweetInfoJson.data.code !== 200) return false;

  const video = tweetInfoJson.data.tweet.media?.videos?.at(0);

  return video ? video.type === 'video' : false;
};

export const fixEmbedTwitterVideo = createModule({
  env: {
    EXCLUDED_CHANNEL_ID: z.string().nonempty(),
  },
  eventHandlers: ({ env }) => ({
    messageCreate: async (message) => {
      if (
        message.author.bot ||
        message.type !== MessageType.Default ||
        message.channelId === env.EXCLUDED_CHANNEL_ID
      ) {
        return;
      }

      const tweetLink = matchAndReplaceTweetLink(message.content, twitterUrlMappings);
      if (tweetLink === '') return;

      const isTwitterVideoLink = await isTwitterVideo(tweetLink);
      if (!isTwitterVideoLink) return;

      const cancel = new ButtonBuilder()
        .setCustomId(deleteBotAnswerButtonId.replace('$authorIdMessage', message.id))
        .setLabel('Remove bot answer')
        .setEmoji('🚮')
        .setStyle(ButtonStyle.Primary);

      const ignore = new ButtonBuilder()
        .setCustomId(ignoreConfirmationButtonId)
        .setLabel('Ignore bot buttons')
        .setEmoji('💨')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(cancel, ignore);

      await message.suppressEmbeds(true);
      await message.reply({
        content: tweetLink,
        components: [row],
      });
    },
    interactionCreate: async (interaction) => {
      if (!interaction.isButton()) return;
      if (!interaction.customId.startsWith(modulePrefixButtonId)) return;
      if (!interaction.message.author?.bot) return;

      if (interaction.customId === ignoreConfirmationButtonId) {
        await interaction.update({ components: [] });

        return;
      }

      if (interaction.customId.startsWith(deleteBotAnswerPrefixButtonId))
        await interaction.message.delete();

      const authorMessageId = interaction.customId.split('-')[2];
      if (!authorMessageId) return;

      const authorMessage = await interaction.channel?.messages.fetch(authorMessageId);
      if (!authorMessage) return;

      await authorMessage.suppressEmbeds(false);
    },
    // Added this handler in case if the user has ignored the bot buttons and still wants to delete the bot answer
    messageReactionAdd: async (reaction, user) => {
      if (user.bot) return;

      if (
        reaction.message.author?.bot &&
        reaction.message.content?.includes('fxtwitter.com') &&
        reaction.emoji.name === '🚮' &&
        reaction.message.type === MessageType.Reply
      ) {
        const referenceMessageId = reaction.message.reference?.messageId;
        if (!referenceMessageId) return;

        const reference = await reaction.message.channel.messages.fetch(referenceMessageId);
        if (!reference) return;

        if (reference.author.id !== user.id) return;

        await reaction.message.delete();
        await reference.suppressEmbeds(false);
      }
    },
  }),
  intents: ['GuildMessages', 'MessageContent', 'GuildMessageReactions'],
});
