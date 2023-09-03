import { SlashCommandBuilder } from 'discord.js';

import type { BotModule } from '../../types/bot';
import { addRecurringMessage, hasPermission } from './recurringMessage.helpers';

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
        .addSubcommand((subcommand) =>
          subcommand.setName('remove').setDescription('Remove a recurring message'),
        )
        .addSubcommand((subcommand) =>
          subcommand.setName('list').setDescription('List recurring messages'),
        )
        .toJSON(),
      handler: {
        add: async (interaction) => {
          if (!hasPermission(interaction)) return;

          await addRecurringMessage(interaction);
        },
        remove: async (interaction) => {
          if (!hasPermission(interaction)) return;

          await interaction.reply('Not implemented yet');
        },
        list: async (interaction) => {
          if (!hasPermission(interaction)) return;

          await interaction.reply('Not implemented yet');
        },
      },
    },
  ],
};
