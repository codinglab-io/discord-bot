import { CronJob } from 'cron';
import { randomUUID } from 'crypto';
import type { ChatInputCommandInteraction, Client } from 'discord.js';

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

const inMemoryJobList: { id: string; job: CronJob }[] = [];

export type Frequency = keyof typeof cronTime;

export const isFrequency = (frequency: string): frequency is Frequency => {
  return Object.keys(cronTime).includes(frequency);
};

export const hasPermission = (interaction: ChatInputCommandInteraction) => {
  if (!isModo(interaction.member)) {
    interaction.reply('You are not allowed to use this command').catch(console.error);
    return false;
  }
  return true;
};

export const createRecurringMessage = (
  client: Client<true>,
  channelId: string,
  frequency: Frequency,
  message: string,
): CronJob => {
  return new CronJob(
    cronTime[frequency],
    () => {
      const channel = client.channels.cache.get(channelId);
      if (!channel || !channel.isTextBased()) {
        console.error(`Channel ${channelId} not found`);
        return;
      }
      void channel.send(message);
    },
    null,
    true,
    'Europe/Paris',
  );
};

export const addRecurringMessage = async (interaction: ChatInputCommandInteraction) => {
  const jobId = randomUUID();
  const channelId = interaction.channelId;
  const frequency = interaction.options.getString('frequency', true);
  if (!isFrequency(frequency)) {
    await interaction.reply(`${frequency} is not a valid frequency`);
    return;
  }
  const message = interaction.options.getString('message', true);

  const displayIdInMessage = `\n (id: ${jobId})`;
  const jobMessage = message + displayIdInMessage;

  if (jobMessage.length > MAX_MESSAGE_LENGTH) {
    await interaction.reply(
      `Message is too long (max ${MAX_MESSAGE_LENGTH - displayIdInMessage.length} characters)`,
    );
    return;
  }

  const job = createRecurringMessage(interaction.client, channelId, frequency, jobMessage);
  job.start();

  inMemoryJobList.push({ id: jobId, job });

  const recurringMessages = await cache.get('recurringMessages', []);
  await cache.set('recurringMessages', [
    ...recurringMessages,
    { id: jobId, channelId, frequency, message },
  ]);

  await interaction.reply(`Recurring message added ${frequencyDisplay[frequency]}`);
};

export const removeRecurringMessage = async (interaction: ChatInputCommandInteraction) => {
  const jobId = interaction.options.getString('id', true);

  console.log(jobId, inMemoryJobList);

  const recurringMessages = await cache.get('recurringMessages', []);
  await cache.set(
    'recurringMessages',
    recurringMessages.filter(({ id }) => id !== jobId),
  );

  const job = inMemoryJobList.find(({ id }) => id === jobId)?.job;
  if (!job) {
    await interaction.reply('Recurring message not found');
    return;
  }

  job.stop();

  await interaction.reply('Recurring message removed');
};

export const listRecurringMessages = async (interaction: ChatInputCommandInteraction) => {
  const recurringMessages = await cache.get('recurringMessages', []);

  if (recurringMessages.length === 0) {
    await interaction.reply('No recurring message found');
    return;
  }

  const recurringMessagesList = recurringMessages
    .map(
      ({ id, frequency, message }) =>
        `id: ${id} - frequency: ${frequency} - ${message.substring(0, 50)}${
          message.length > 50 ? '...' : ''
        }`,
    )
    .join('\n');

  await interaction.reply(recurringMessagesList);
};

export const relaunchRecurringMessages = async (client: Client<true>) => {
  const recurringMessages = await cache.get('recurringMessages', []);

  recurringMessages.forEach(({ id, channelId, frequency, message }) => {
    const job = createRecurringMessage(client, channelId, frequency, message);
    job.start();
    inMemoryJobList.push({ id, job });
  });
};
