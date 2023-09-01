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
  .setDescription('Replies with https://prout.dev')
  .toJSON();

export const quoiFeurCommand = new SlashCommandBuilder()
  .setName('quoi-feur')
  .setDescription('Add quoi-feur game to the channel')
  .toJSON();
