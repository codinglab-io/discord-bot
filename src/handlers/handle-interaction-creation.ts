import type { Interaction } from 'discord.js';

import { createLobby } from '../create-lobby';

export const handleInteractionCreation = async (interaction: Interaction): Promise<void> => {
  if (
    !interaction.isCommand() ||
    !interaction.inGuild() ||
    !interaction.isChatInputCommand() ||
    interaction.commandName !== 'voice-on-demand'
  ) {
    return;
  }

  if (interaction.options.getSubcommand(true) !== 'create') {
    await interaction.reply('Unknown subcommand');
    return;
  }

  await createLobby(interaction);
};
