import { CronJob } from 'cron';
import { cache } from '../../core/cache';
import type {
  Client,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';
import { ONE_MINUTE } from '../../helpers/timeConstants';

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
  const cookieMessage = await channelToSend.send('**👵 Qui veut des cookies ?**');
  await cache.set('currentHuntMessageId', cookieMessage.id);
  await cache.set('cookieHunterDailyCount', {});
  cookieMessage.react('🥛');
  cookieMessage.react('🍪'); // 1 point for grandma here, she beats everyone who doesn't find her

  setTimeout(() => {
    cookieMessage.delete();
    logDailyCount();
    // TODO : add the daily count into the global scoreboard
  }, ONE_MINUTE);
};

export const countCookies = async (
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
) => {
  const currentHuntMessageId = await cache.get('currentHuntMessageId');
  if (
    !currentHuntMessageId ||
    reaction.message.id !== currentHuntMessageId ||
    reaction.emoji.name !== '🍪'
  )
    return;

  const cookieHunterDailyCount = await cache.get('cookieHunterDailyCount', {});
  const userDailyCount = cookieHunterDailyCount[user.id] || 0;
  const newDailyCount = { ...cookieHunterDailyCount, [user.id]: userDailyCount + 1 };
  await cache.set('cookieHunterDailyCount', newDailyCount);
};

const logDailyCount = async () => {
  const cookieHunterDailyCount = await cache.get('cookieHunterDailyCount', {});
  console.log(cookieHunterDailyCount);
  // TODO : command to log the daily count in a channel in order to keep track of
  // where and when the message is sent, and who reacted to it
};
