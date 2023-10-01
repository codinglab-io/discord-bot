import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageType } from 'discord.js';
import { z } from 'zod';

import { createModule } from '../../core/createModule';
import { resolveCatch } from '../../helpers/resolveCatch.helper';

interface FXTwitterResponse {
  code: number;
  message: string;
  tweet: {
    media?: {
      videos?: {
        type: 'gif' | 'video';
        url: string;
      }[];
    };
  };
}

const modulePrefixButtonId = 'removetwittervideo-';
const deleteBotAnswerPrefixButtonId = modulePrefixButtonId + 'deleteBotAnswer-';
const deleteBotAnswerButtonId = deleteBotAnswerPrefixButtonId + '$authorIdMessage';
const ignoreConfirmationButtonId = modulePrefixButtonId + 'ignoreBotButtons';

const tweetRegex = /https?:\/\/(mobile\.)?twitter\.com\/(\S+)\/status\/(\d+)/g;

const isTwitterVideo = async (tweetURL: string): Promise<boolean> => {
  const twitterId = tweetURL.split('/').pop();
  if (!twitterId) return false;

  const apiFxTweetURL = tweetURL.replace('twitter.com', 'api.fxtwitter.com');
  const [tweetInfoError, tweetInfo] = await resolveCatch(fetch(apiFxTweetURL));

  if (tweetInfoError) return false;

  const [tweetInfoJsonError, tweetInfoJson] = await resolveCatch(
    tweetInfo.json() as Promise<FXTwitterResponse>,
  );

  if (tweetInfoJsonError || tweetInfoJson.code !== 200) return false;

  const video = tweetInfoJson.tweet.media?.videos?.at(0);

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

      const twitterLinks = message.content.match(tweetRegex);

      if (!twitterLinks || twitterLinks.length === 0) return;

      const isTwitterVideoLink = await isTwitterVideo(twitterLinks[0]);
      if (!isTwitterVideoLink) return;

      const twitterVideoLink = twitterLinks[0].replace('twitter.com', 'fxtwitter.com');

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
        content: twitterVideoLink,
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
