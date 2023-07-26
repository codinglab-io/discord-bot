import { SlashCommandBuilder } from 'discord.js';

export const voiceOnDemandCommand = new SlashCommandBuilder()
  .setName('voice-on-demand')
  .setDescription('Actions related to the voice lobby')
  .addSubcommand((subcommand) =>
    subcommand.setName('create').setDescription('Creates the voice lobby'),
  )
  .toJSON();

export const fartCommand = new SlashCommandBuilder()
  .setName('fart')
  .setDescription("Replies with http://prout.dev, the YaourtGG's masterpiece")
  .toJSON();

export const bankCommand = new SlashCommandBuilder()
  .setName('bank')
  .setDescription('Know your cookie balance or someone else')
  .addUserOption((option) =>
    option.setName('user').setDescription('The user to get the balance of'),
  )
  .toJSON();
