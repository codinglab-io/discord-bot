import { CronJob } from 'cron';
import type {
  ChatInputCommandInteraction,
  Client,
  DMChannel,
  NonThreadGuildBasedChannel,
} from 'discord.js';

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

const generateId = () => Math.random().toString(36).slice(2);

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
  const jobId = generateId();
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

  const messagesInCurrentGuild = recurringMessages.filter(
    ({ channelId }) => interaction.guild?.channels.cache.has(channelId),
  );

  const messagesByChannelName = messagesInCurrentGuild.reduce(
    (acc, { id, frequency, message, channelId }) => {
      const channel = interaction.guild?.channels.cache.get(channelId);
      const channelName = channel?.name ?? 'unknown';

      if (!acc[channelName]) {
        acc[channelName] = [];
      }

      acc[channelName]!.push({ id, frequency, message });

      return acc;
    },
    {} as Record<string, { id: string; frequency: string; message: string }[]>,
  );

  const embeds = Object.entries(messagesByChannelName).map(([channelName, messages]) => {
    const fields = messages.map(({ id, frequency, message }) => ({
      name: `⏰ - ${frequencyDisplay[frequency as Frequency]} (id: ${id})`,
      value: message.substring(0, 1000) + (message.length > 1000 ? '...' : ''),
    }));

    return {
      title: `# ${channelName}`,
      color: 0x0099ff,
      fields,
      footer: {
        text: '\u2800'.repeat(256), // hackish way have even width for all embeds
      },
    };
  });

  await interaction.reply({ embeds });
};

export const relaunchRecurringMessages = async (client: Client<true>) => {
  const recurringMessages = await cache.get('recurringMessages', []);

  const channelsToClear = new Set<string>();
  for (const { id, channelId, frequency, message } of recurringMessages) {
    if (!client.channels.cache.get(channelId)) {
      channelsToClear.add(channelId);
      continue;
    }
    const job = createRecurringMessage(client, channelId, frequency, message);
    job.start();
    inMemoryJobList.push({ id, job });
  }

  await cache.set(
    'recurringMessages',
    recurringMessages.filter(({ channelId }) => !channelsToClear.has(channelId)),
  );
};

export const removeAllFromChannel = async (channel: DMChannel | NonThreadGuildBasedChannel) => {
  const { id } = channel;

  const recurringMessages = await cache.get('recurringMessages', []);
  const jobsToRemove = recurringMessages.filter(({ channelId }) => id === channelId);

  await cache.set(
    'recurringMessages',
    recurringMessages.filter(({ channelId }) => id !== channelId),
  );

  for (const { id } of jobsToRemove) {
    const job = inMemoryJobList.find(({ id: jobId }) => id === jobId)?.job;
    if (!job) continue;
    job.stop();
  }
};
