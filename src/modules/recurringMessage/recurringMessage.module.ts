import { CronJob } from 'cron';
import { SlashCommandBuilder } from 'discord.js';

import { isModo } from '../../helpers/roles';
import type { BotModule } from '../../types/bot';

const cronTime = {
  daily: '0 0 9 * * *',
  weekly: '0 0 9 * * 1',
  monthly: '0 0 9 1 * *',
};

const frequencyDisplay = {
  daily: 'every day at 9am',
  weekly: 'every monday at 9am',
  monthly: 'the 1st of every month at 9am',
};

export const fart: BotModule = {
  slashCommands: [
    {
      schema: new SlashCommandBuilder()
        .setName('recurrent')
        .setDescription('Manage recurring messages')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('add')
            .setDescription('Add a recurring message')
            .addStringOption((option) =>
              option
                .setName('every')
                .setDescription('How often to send the message')
                .addChoices(
                  { name: 'daily', value: 'daily' },
                  { name: 'weekly', value: 'weekly' },
                  { name: 'monthly', value: 'monthly' },
                )
                .setRequired(true),
            )
            .addStringOption((option) =>
              option.setName('message').setDescription('The message to send').setRequired(true),
            ),
        )
        .toJSON(),
      handler: {
        add: async (interaction) => {
          if (!isModo(interaction.member)) {
            await interaction.reply('You are not allowed to use this command');
            return;
          }
          const frequency = interaction.options.getString('every', true) as keyof typeof cronTime;
          const message = interaction.options.getString('message', true);

          const job = new CronJob(
            cronTime[frequency],
            () => {
              interaction.channel?.send(message).catch(console.error);
            },
            null,
            true,
            'Europe/Paris',
          );
          job.start();

          await interaction.reply(`Recurring message added ${frequencyDisplay[frequency]}`);
        },
      },
    },
  ],
};
