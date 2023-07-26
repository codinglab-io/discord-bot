import '@keyv/redis';

import Keyv from 'keyv';

import { config } from '../config';

export const store = new Keyv(config.redis.url);

export const getUserAccount = async (userId: string): Promise<number | undefined> => {
  return (await store.get(`bank:${userId}`)) as number | undefined;
};

export const setUserAccount = async (userId: string, amount: number): Promise<void> => {
  await store.set(`bank:${userId}`, amount);
};
