import '@keyv/redis';

import Keyv from 'keyv';

import type { Frequency } from '../modules/recurringMessage/recurringMessage.helpers';
import { env } from './env';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CacheGet<Entries extends Record<string, any>> {
  <Key extends keyof Entries>(key: Key): Promise<Entries[Key] | undefined>;
  <Key extends keyof Entries>(key: Key, defaultValue: Entries[Key]): Promise<Entries[Key]>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Cache<Entries extends Record<string, any>> {
  get: CacheGet<Entries>;
  set: <Key extends keyof Entries>(key: Key, value: Entries[Key]) => Promise<void>;
  delete: <Key extends keyof Entries>(key: Key) => Promise<void>;
  has: <Key extends keyof Entries>(key: Key) => Promise<boolean>;
  clear: () => Promise<void>;
}

interface CacheEntries {
  lobbyIds: string[];
  onDemandChannels: string[];
  quoiFeurChannels: string[];
  recurringMessages: { id: string; channelId: string; frequency: Frequency; message: string }[];
}

class CacheImpl implements Cache<CacheEntries> {
  private readonly backend = new Keyv(env.redisUrl);

  public get<Key extends keyof CacheEntries>(key: Key): Promise<CacheEntries[Key] | undefined>;
  public get<Key extends keyof CacheEntries>(
    key: Key,
    defaultValue: CacheEntries[Key],
  ): Promise<CacheEntries[Key]>;
  public async get<Key extends keyof CacheEntries>(
    key: Key,
    defaultValue?: CacheEntries[Key],
  ): Promise<CacheEntries[Key] | undefined> {
    const value = (await this.backend.get(key)) as CacheEntries[Key] | undefined;

    return value === undefined ? defaultValue : value;
  }

  public async set<Key extends keyof CacheEntries>(
    key: Key,
    value: CacheEntries[Key],
  ): Promise<void> {
    await this.backend.set(key, value);
  }

  public async delete<Key extends keyof CacheEntries>(key: Key): Promise<void> {
    await this.backend.delete(key);
  }

  public async has<Key extends keyof CacheEntries>(key: Key): Promise<boolean> {
    return this.backend.has(key);
  }

  public async clear(): Promise<void> {
    await this.backend.clear();
  }
}

export const cache = new CacheImpl();
