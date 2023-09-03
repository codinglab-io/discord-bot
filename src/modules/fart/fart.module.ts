import { SlashCommandBuilder } from 'discord.js';

import type { BotModule } from '../../types/bot';

export const fart: BotModule = {
  slashCommands: [
    {
      schema: new SlashCommandBuilder()
        .setName('fart')
        .setDescription('Replies with https://prout.dev')
        .toJSON(),
      handler: async (interaction) => {
        await interaction.reply('https://prout.dev');
      },
    },
  ],
};
