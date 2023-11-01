import { cache } from '../../core/cache';

export const addUserMutedInDB = async (
  id: string | undefined,
  username: string | undefined | null,
) => {
  if (!id || !username) return;
  const allUsersMutedinDB = await cache.get('score', []);
  const ifUserExistInDB = allUsersMutedinDB.find((user) => user.id === id);
  if (ifUserExistInDB) {
    await cache.set('score', [{ ...ifUserExistInDB, score: ifUserExistInDB.score + 1 }]);
  } else {
    await cache.set('score', [{ id, username, score: 1 }]);
  }
};
