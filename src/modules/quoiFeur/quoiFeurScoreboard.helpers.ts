import { type ChatInputCommandInteraction } from 'discord.js';

import { cache } from '../../core/cache';

export const addUserMutedInDB = async (
  id: string | undefined,
  username: string | undefined | null,
) => {
  if (!id || !username) return;
  const allUsersMutedinDB = await cache.get('scoreQuoiFeur', []);
  const foundUserInDB = allUsersMutedinDB.find((user) => user.id === id);

  if (foundUserInDB) {
    foundUserInDB.score++;
  } else {
    allUsersMutedinDB.push({ id, username, score: 1 });
  }

  await cache.set('scoreQuoiFeur', allUsersMutedinDB);
};

export const showScoreboardQuoi = async (interaction: ChatInputCommandInteraction) => {
  const allUsersMuted = await cache.get('scoreQuoiFeur', []);
  const sortedUsers = allUsersMuted.sort((a, b) => b.score - a.score);
  const getOnlyTop3 = sortedUsers.slice(0, 3);
  await interaction.reply(
    '### Top 3 Coubeh' +
      '\n' +
      getOnlyTop3.map((user) => `${user.username} : ${user.score} fois coubehed.`).join('\n'),
  );
};
