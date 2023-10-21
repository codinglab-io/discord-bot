import { ChannelType, SlashCommandBuilder } from 'discord.js';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import { createModule } from '../../core/createModule';
import { EMOJI } from '../../helpers/emoji';

const apiKey = process.env['OPENAI_API_KEY'];
if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not set');
}

const openai = new OpenAI({ apiKey });

const trackedChannels = new Map<
  string,
  {
    user: string;
    messages: ChatCompletionMessageParam[];
  }
>();

export const question = createModule({
  slashCommands: () => [
    {
      schema: new SlashCommandBuilder()
        .setName('question')
        .setDescription('Actions related to asking questions')
        .addSubcommand((subcommand) =>
          subcommand.setName('ask').setDescription('Starts a question workflow'),
        )
        .addSubcommand((subcommand) =>
          subcommand.setName('finish').setDescription('Finishes the question workflow'),
        )
        .toJSON(),
      handler: {
        ask: async (interaction) => {
          const guild = interaction.guild;
          if (!guild) {
            console.error('No guild found');

            await interaction.reply({
              content: 'An error occurred',
              ephemeral: true,
            });

            return;
          }

          const channel = await guild.channels.create({
            name: `question-by-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
              {
                id: guild.roles.everyone.id,
                deny: ['ViewChannel'],
              },
              {
                id: interaction.user.id,
                allow: ['ViewChannel', 'SendMessages'],
              },
            ],
          });

          const systemPrompt = [
            'You are an assistant specializing in helping users articulate technical questions more clearly.',
            "If a user's prompt is split across multiple messages, ensure you piece together the entire context before providing guidance.",
            'Engage in a dialogue, prompting users to provide specifics.',
            'Guide them in breaking down their tech-related problems or queries into clear, concise questions.',
            'Your goal is to facilitate understanding and foster effective communication.',
          ].join('\n');

          trackedChannels.set(channel.id, {
            user: interaction.user.id,
            messages: [
              {
                role: 'system',
                content: systemPrompt,
              },
            ],
          });

          await interaction.reply({
            content: `Your question channel is <#${channel.id}>`,
            ephemeral: true,
          });

          const welcomeMessage = [
            `Hey <@${interaction.user.id}>!`,
            'What is your question?',
            'Please be as detailed as possible, and include any relevant code.',
          ].join('\n');

          await channel.send({
            content: welcomeMessage,
          });

          trackedChannels.set(channel.id, {
            user: interaction.user.id,
            messages: [
              ...(trackedChannels.get(channel.id)?.messages || []),
              {
                role: 'assistant',
                content: welcomeMessage,
              },
            ],
          });
        },
        finish: async (interaction) => {
          if (!interaction.channel) {
            await interaction.reply({
              content: 'No channel found',
              ephemeral: true,
            });

            return;
          }

          const trackedChannel = trackedChannels.get(interaction.channel.id);
          if (!trackedChannel) {
            await interaction.reply({
              content: 'No question channel found',
              ephemeral: true,
            });

            return;
          }

          await interaction.deferReply();

          const response = await openai.chat.completions.create({
            model: 'gpt-4',
            stream: true,
            messages: [...trackedChannel.messages],
          });

          const parts = [];

          for await (const part of response) {
            const currentContent = part.choices?.[0]?.delta.content;
            if (currentContent === '') {
              continue;
            }

            parts.push(currentContent);

            await interaction.editReply({
              content: parts.join('') || 'Waiting',
            });
          }
        },
      },
    },
  ],
  eventHandlers: () => ({
    messageCreate: async (message) => {
      if (message.author.bot) {
        return;
      }

      const trackedChannel = trackedChannels.get(message.channel.id);
      if (!trackedChannel) {
        return;
      }

      if (trackedChannel.user !== message.author.id) {
        return;
      }

      trackedChannels.set(message.channel.id, {
        user: trackedChannel.user,
        messages: [
          ...trackedChannel.messages,
          {
            role: 'user',
            content: message.content,
          },
        ],
      });

      await message.react(EMOJI.OK);
    },
    channelDelete: async (channel) => {
      if (trackedChannels.has(channel.id)) {
        trackedChannels.delete(channel.id);
      }

      return Promise.resolve();
    },
  }),
  intents: ['GuildMessages'],
});
