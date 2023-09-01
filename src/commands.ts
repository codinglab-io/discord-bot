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
  .setDescription('Manage quoi-feur game in the channel')
  .addSubcommand((subcommand) =>
    subcommand.setName('add').setDescription('Add the quoi-feur game in the channel'),
  )
  .addSubcommand((subcommand) =>
    subcommand.setName('remove').setDescription('Remove the quoi-feur game in the channel'),
  )
  .toJSON();
