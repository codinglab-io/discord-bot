import { CronJob } from 'cron';
import { cache } from '../../core/cache';
import type { Client } from 'discord.js';

const IT_IS_SNACK_TIME = '0 30 16 * * *'; // 4:30pm every day

let jobCurrentlyRunning: CronJob | null = null;

export const startHunting = async (client: Client<true>) => {
  console.log('Cookie hunter started');
  if (jobCurrentlyRunning !== null) {
    // needed in case that the bot fire multiple ready event
    jobCurrentlyRunning.stop();
  }
  jobCurrentlyRunning = new CronJob(
    IT_IS_SNACK_TIME,
    () => sendMessageInRandomChannel(client),
    null,
    true,
    'Europe/Paris',
  );
};

const sendMessageInRandomChannel = async (client: Client<true>) => {
  const channel = await cache.get('cookieHunterChannels', []);
  if (!channel.length) return;

  const randomChannel = channel[Math.floor(Math.random() * channel.length)];
  if (!randomChannel) return;

  const channelToSend = await client.channels.fetch(randomChannel);

  if (!channelToSend || !channelToSend.isTextBased()) return;

  const cookieMessage = await channelToSend.send('👵 Qui veut des cookies ? 🍪');
  await cache.set('currentHuntMessageId', cookieMessage.id);
  cookieMessage.react('🥛');
  cookieMessage.react('🍪');
};
