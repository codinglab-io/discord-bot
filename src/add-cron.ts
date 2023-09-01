import { CronJob } from 'cron';
import { ChatInputCommandInteraction } from 'discord.js';

import { getCronTime } from './helpers/get-cron-time';
import { isModo } from './helpers/roles';

export const addCron = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  if (!isModo(interaction.member)) {
    await interaction.reply('You are not allowed to use this command');
    return;
  }
  const frequency = interaction.options.getString('every', true);
  const message = interaction.options.getString('message', true);

  const job = new CronJob(
    getCronTime(frequency),
    () => {
      interaction.channel?.send(message).catch(console.error);
    },
    null,
    true,
    'Europe/Paris',
  );
  job.start();

  await interaction.reply(`Recurring message added every ${frequency}`);
};
