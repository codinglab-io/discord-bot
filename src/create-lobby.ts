import type { Guild } from 'discord.js';
import { ChannelType, ChatInputCommandInteraction } from 'discord.js';

import { cache } from './helpers/cache';

export const createLobby = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  const guild = interaction.guild as Guild;

  const lobbyId = await cache.get('lobbyId');

  if (lobbyId !== undefined && guild.channels.cache.has(lobbyId)) {
    guild.channels.cache.delete(lobbyId);
  }

  const channel =
    lobbyId === undefined ? null : await guild.channels.fetch(lobbyId).catch(() => null);

  if (channel !== null) {
    await interaction.reply({
      content: 'Voice on demand voice lobby already exists.',
      ephemeral: true,
    });

    return;
  }

  const { id } = await guild.channels.create({
    name: 'Lobby',
    type: ChannelType.GuildVoice,
  });

  await cache.set('lobbyId', id);

  await interaction.reply({
    content: 'Created voice on demand voice channel.',
    ephemeral: true,
  });
};
