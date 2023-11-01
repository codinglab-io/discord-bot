// import { type ChatInputCommandInteraction } from 'discord.js';

import { cache } from '../../core/cache';

export const addUserMutedInDB = async (
  id: string | undefined,
  username: string | undefined | null,
) => {
  if (!id || !username) return;
  const allUsersMutedinDB = await cache.get('score', []);
  const foundUserInDB = allUsersMutedinDB.find((user) => user.id === id);

  if (foundUserInDB) {
    foundUserInDB.score++;
  } else {
    allUsersMutedinDB.push({ id, username, score: 1 });
  }

  await cache.set('score', allUsersMutedinDB);
  console.log(allUsersMutedinDB);
};

export const showScoreboardQuoi = async () => {
  const allUsersMuted = await cache.get('score', []);
  // const sortedUsers = allUsers.sort((a, b) => b.score - a.score);
  console.log(allUsersMuted);
  // await interaction.reply();
};
