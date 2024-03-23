import { CronJob } from 'cron';
import type {
  Client,
  Message,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';

import { cache } from '../../core/cache';
import { ONE_MINUTE } from '../../helpers/timeConstants';

const IT_IS_SNACK_TIME = '0 30 16 * * *'; // 4:30pm every day

let jobCurrentlyRunning: CronJob | null = null;

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
  await cookieMessage.react('🥛');
  await cookieMessage.react('🍪'); // 1 point for grandma here, she beats everyone who doesn't find her

  setTimeout(() => void dailyHuntEnd(client, cookieMessage), ONE_MINUTE);
};

const applyMilkJoker = async () => {
  const milkJokerUserId = await cache.get('milkJokerUserId');
  if (!milkJokerUserId) return;

  const cookieHunterDailyCount = await cache.get('cookieHunterDailyCount', {});
  const userDailyCount = cookieHunterDailyCount[milkJokerUserId] || 0;
  const newDailyCount = { ...cookieHunterDailyCount, [milkJokerUserId]: userDailyCount * 2 };
  await cache.set('cookieHunterDailyCount', newDailyCount);
};

const logDailyCount = async (client: Client<true>) => {
  const dailyLogChannels = await cache.get('cookieHunterDailyLogChannels', []);
  if (!dailyLogChannels.length) return;

  const currentHuntMessageId = await cache.get('currentHuntMessageId');
  if (!currentHuntMessageId)
    throw new Error('Lost the hunt message id before logging the daily count');

  const cookieHunterDailyCount = await cache.get('cookieHunterDailyCount', {});
  const hunterCount = Object.keys(cookieHunterDailyCount).length - 1; // grandma is not a hunter

  const milkJokerUserId = await cache.get('milkJokerUserId');

  const resume = `**🍪 Résumé de la chasse aux cookies du jour**\n`;
  const where = `Mamie a servi des cookies dans <#${currentHuntMessageId}>\n`;
  const baseMessage = `${resume}${where}`;

  const message =
    hunterCount > 0
      ? getHuntersFoundGrandmaMessage(baseMessage, cookieHunterDailyCount, milkJokerUserId)
      : `${baseMessage}**🍪 Personne n'a trouvé Mamie !**\nFaut dire qu'elle se cache bien (et que vous êtes nazes) !`;

  for (const channelId of dailyLogChannels) {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) return;
    await channel.send(message);
  }
};

const getHuntersFoundGrandmaMessage = (
  baseMessage: string,
  cookieHunterDailyCount: Record<string, number>,
  milkJokerUserId: string | undefined,
) => {
  const cookieEatenCount = Object.values(cookieHunterDailyCount).reduce(
    (acc, count) => acc + count,
    0,
  );
  const dailyRank = Object.entries(cookieHunterDailyCount).sort((a, b) => b[1] - a[1]);

  const totalEaten = `Nombre de cookies total mangés : ${cookieEatenCount}\n`;
  const ranking = `**Classement des chasseurs de cookies du jour**\n`;
  const usersRanking = dailyRank.map(([userId, count]) => `<@${userId}>: ${count}\n`).join('\n');
  const milkJoker = milkJokerUserId
    ? `<@${milkJokerUserId}> a accompagné ses cookies d'un grand verre de lait 🥛\n`
    : '';
  const lastWords = `Sacré bande de gourmands !`;

  return `${baseMessage}${totalEaten}${ranking}${usersRanking}${milkJoker}${lastWords}`;
};

const updateGlobalScoreboard = async () => {
  const cookieHunterDailyCount = await cache.get('cookieHunterDailyCount', {});
  const coockieHunterScoreboard = await cache.get('cookieHunterScoreboard', {});
  for (const [userId, count] of Object.entries(cookieHunterDailyCount)) {
    coockieHunterScoreboard[userId] = (coockieHunterScoreboard[userId] || 0) + count;
  }
  await cache.set('cookieHunterScoreboard', coockieHunterScoreboard);
};

const dailyHuntEnd = async (client: Client<true>, cookieMessage: Message) => {
  await cookieMessage.delete();
  await applyMilkJoker();
  await logDailyCount(client);
  await updateGlobalScoreboard();
  await cache.delete('milkJokerUserId');
  await cache.delete('currentHuntMessageId');
  await cache.delete('cookieHunterDailyCount');
};

export const countCookies = async (
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
) => {
  const currentHuntMessageId = await cache.get('currentHuntMessageId');
  if (
    !currentHuntMessageId ||
    reaction.message.id !== currentHuntMessageId ||
    reaction.emoji.name === null ||
    !['🍪', '🥛'].includes(reaction.emoji.name)
  )
    return;

  const isMilkJokerAlreadyFound = await cache.get('milkJokerUserId');

  if (reaction.emoji.name === '🥛') {
    if (isMilkJokerAlreadyFound) {
      reaction.message.reply({
        content: `Il est lent ce lait... 🥛`,
        options: { ephemeral: true },
      });
    } else {
      await cache.set('milkJokerUserId', user.id);
      reaction.message.reply({
        content: `Premier arrivé, premier servit. Cul sec 🥛 !`,
        options: { ephemeral: true },
      });
    }
  }

  const cookieHunterDailyCount = await cache.get('cookieHunterDailyCount', {});
  const userDailyCount = cookieHunterDailyCount[user.id] || 0;
  const newDailyCount = { ...cookieHunterDailyCount, [user.id]: userDailyCount + 1 };
  await cache.set('cookieHunterDailyCount', newDailyCount);
};

export const startHunting = (client: Client<true>) => {
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
