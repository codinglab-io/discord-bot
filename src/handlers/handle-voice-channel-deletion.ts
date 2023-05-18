import type { VoiceChannel } from 'discord.js';

import { cache } from '../helpers/cache';

export const handleVoiceChannelDeletion = async (channel: VoiceChannel): Promise<void> => {
  const lobbyId = await cache.get('lobbyId');

  const { guild, id } = channel;

  if (id === lobbyId) {
    await cache.delete('lobbyId');
    guild.channels.cache.delete(lobbyId);

    const channels = await cache.get('channels', []);

    await Promise.all(
      channels.map(async (id) => {
        const channel = await guild.channels.fetch(id).catch(() => null);
        if (channel !== null) {
          await guild.channels.delete(id);
          guild.channels.cache.delete(id);
        }
      })
    );
  }
};
