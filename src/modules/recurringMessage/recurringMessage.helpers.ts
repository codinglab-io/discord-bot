import { CronJob } from 'cron';
import { randomUUID } from 'crypto';
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

export type Frequency = keyof typeof cronTime;

export const isFrequency = (frequency: string): frequency is Frequency => {
  return Object.keys(cronTime).includes(frequency);
};

export const hasPermission = (interaction: ChatInputCommandInteraction) => {
  if (!isModo(interaction.member)) {
    void interaction.reply({ content: 'You are not allowed to use this command', ephemeral: true });
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
    await interaction.reply({ content: `${frequency} is not a valid frequency`, ephemeral: true });
    return;
  }
  const message = interaction.options.getString('message', true);

  if (message.length > MAX_MESSAGE_LENGTH) {
    await interaction.reply({
      content: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters)`,
      ephemeral: true,
    });
    return;
  }

  const job = createRecurringMessage(interaction.client, channelId, frequency, message);
  job.start();

  inMemoryJobList.push({ id: jobId, job });

  const recurringMessages = await cache.get('recurringMessages', []);
  await cache.set('recurringMessages', [
    ...recurringMessages,
    { id: jobId, channelId, frequency, message },
  ]);

  await interaction.reply({
    content: `Recurring message added ${frequencyDisplay[frequency]}`,
    ephemeral: true,
  });
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
    await interaction.reply({ content: 'Recurring message not found', ephemeral: true });
    return;
  }

  job.stop();

  await interaction.reply({ content: 'Recurring message removed', ephemeral: true });
};

export const listRecurringMessages = async (interaction: ChatInputCommandInteraction) => {
  const recurringMessages = await cache.get('recurringMessages', []);

  if (recurringMessages.length === 0) {
    await interaction.reply({ content: 'No recurring message found', ephemeral: true });
    return;
  }

  const messagesInCurrentGuild = recurringMessages.filter(
    ({ channelId }) => interaction.guild?.channels.cache.has(channelId),
  );

  const messagesByChannelName = messagesInCurrentGuild.reduce<
    Record<string, Array<{ id: string; frequency: string; message: string }>>
  >((acc, { id, frequency, message, channelId }) => {
    const channel = interaction.guild?.channels.cache.get(channelId);
    if (channel === undefined) throw new Error('Channel not found');

    const { name } = channel;
    const currentMessages = acc[name];

    if (currentMessages === undefined) {
      return { ...acc, [name]: [{ id, frequency, message }] };
    }

    currentMessages.push({ id, frequency, message });

    return acc;
  }, {});

  const embeds = Object.entries(messagesByChannelName).map(([channelName, messages]) => {
    const fields = messages.map(({ id, frequency, message }) => ({
      name: `⏰ - ${frequencyDisplay[frequency as Frequency]} (id: ${id})`,
      value: message.substring(0, 1000) + (message.length > 1000 ? '...' : ''),
    }));

    return {
      title: `# ${channelName}`,
      color: 0x0099ff,
      fields,
    };
  });

  await interaction.reply({ embeds, ephemeral: true });
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
