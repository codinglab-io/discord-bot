import { CronJob } from 'cron';
import { ChatInputCommandInteraction } from 'discord.js';

import { getCronTime } from './helpers/get-cron-time';

export const addCron = (interaction: ChatInputCommandInteraction): void => {
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
};
