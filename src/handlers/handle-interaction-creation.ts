import type { Interaction } from 'discord.js';

import { createLobby } from '../create-lobby';
import { addQuoiFeurChannel, removeQuoiFeurChannel } from '../quoi-feur';

export const handleInteractionCreation = async (interaction: Interaction): Promise<void> => {
  if (
    !interaction.isCommand() ||
    !interaction.inGuild() ||
    !interaction.isChatInputCommand() ||
    !['voice-on-demand', 'fart', 'quoi-feur'].includes(interaction.commandName)
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
    case 'quoi-feur':
      if (interaction.options.getSubcommand(true) === 'add') {
        await addQuoiFeurChannel(interaction);
        return;
      }
      if (interaction.options.getSubcommand(true) === 'remove') {
        await removeQuoiFeurChannel(interaction);
        return;
      }
      await interaction.reply('Unknown subcommand');
      break;
  }
};
