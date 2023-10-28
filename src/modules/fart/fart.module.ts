import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import { createModule } from '../../core/createModule';

export const fart = createModule({
  name: 'fart',
  slashCommands: () => [
    {
      schema: new SlashCommandBuilder()
        .setName('fart')
        .setDescription('Replies with https://prout.dev')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .toJSON(),
      handler: async (interaction) => {
        await interaction.reply('https://prout.dev');
      },
    },
  ],
});
