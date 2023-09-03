import { CronJob } from 'cron';
import { randomUUID } from 'crypto';
import type { ChatInputCommandInteraction } from 'discord.js';

import { cache } from '../../core/cache';
import { isModo } from '../../helpers/roles';

const MAX_MESSAGE_LENGTH = 2000;

const cronTime = {
  daily: '0 0 9 * * *',
  weekly: '0 0 9 * * 1',
  monthly: '0 0 9 1 * *',
};

const frequencyDisplay = {
  daily: 'every day at 9am',
  weekly: 'every monday at 9am',
  monthly: 'the 1st of every month at 9am',
};

export const hasPermission = (interaction: ChatInputCommandInteraction) => {
  if (!isModo(interaction.member)) {
    interaction.reply('You are not allowed to use this command').catch(console.error);
    return false;
  }
  return true;
};

export const addRecurringMessage = async (interaction: ChatInputCommandInteraction) => {
  const frequency = interaction.options.getString('every', true) as keyof typeof cronTime;
  const message = interaction.options.getString('message', true);
  const jobId = randomUUID();

  const displayId = `\n (id: ${jobId})`;
  const jobMessage = message + displayId;

  if (jobMessage.length > MAX_MESSAGE_LENGTH) {
    interaction
      .reply(`Message is too long (max ${MAX_MESSAGE_LENGTH - displayId.length} characters)`)
      .catch(console.error);
    return;
  }

  const job = new CronJob(
    cronTime[frequency],
    () => {
      interaction.channel?.send(jobMessage).catch(console.error);
    },
    null,
    true,
    'Europe/Paris',
  );
  job.start();

  const recurringMessages = await cache.get('recurringMessages', []);
  await cache.set('recurringMessages', [...recurringMessages, { id: jobId, job }]);

  await interaction.reply(`Recurring message added ${frequencyDisplay[frequency]}`);
};