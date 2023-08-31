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

export const cronCommand = new SlashCommandBuilder()
  .setName('cron')
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
            { name: 'day', value: 'day' },
            { name: 'week', value: 'week' },
            { name: 'month', value: 'month' },
          )
          .setRequired(true),
      )
      .addStringOption((option) =>
        option.setName('message').setDescription('The message to send').setRequired(true),
      ),
  );
