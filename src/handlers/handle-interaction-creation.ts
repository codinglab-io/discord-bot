import type { Interaction } from 'discord.js';

import { addCron } from '../add-cron';
import { createLobby } from '../create-lobby';

export const handleInteractionCreation = async (interaction: Interaction): Promise<void> => {
  if (
    !interaction.isCommand() ||
    !interaction.inGuild() ||
    !interaction.isChatInputCommand() ||
    !['voice-on-demand', 'fart', 'cron'].includes(interaction.commandName)
  ) {
    return;
  }

  switch (interaction.commandName) {
    case 'voice-on-demand':
      if (interaction.options.getSubcommand(true) !== 'create') {
        await interaction.reply('Unknown subcommand');
        return;
      }
      await createLobby(interaction);
      break;
    case 'fart':
      await interaction.reply('https://prout.dev');
      break;
    case 'cron':
      if (interaction.options.getSubcommand(true) !== 'add') {
        await interaction.reply('Unknown subcommand');
        return;
      }
      addCron(interaction);
      break;
  }
};
