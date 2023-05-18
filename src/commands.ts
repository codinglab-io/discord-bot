import { SlashCommandBuilder } from 'discord.js';

export const voiceOnDemandCommand = new SlashCommandBuilder()
  .setName('voice-on-demand')
  .setDescription('Actions related to the voice lobby')
  .addSubcommand((subcommand) =>
    subcommand.setName('create').setDescription('Creates the voice lobby')
  )
  .toJSON();
