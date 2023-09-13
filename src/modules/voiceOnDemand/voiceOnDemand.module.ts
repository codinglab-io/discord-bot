import { ChannelType, Guild, SlashCommandBuilder } from 'discord.js';

import { cache } from '../../core/cache';
import { createModule } from '../../core/createModule';
import { handleJoin, handleLeave, isJoinState, isLeaveState } from './voiceOnDemand.helpers';

export const voiceOnDemand = createModule({
  name: 'voiceOnDemand',
  slashCommands: () => [
    {
      schema: new SlashCommandBuilder()
        .setName('voice-on-demand')
        .setDescription('Actions related to the voice lobby')
        .addSubcommand((subcommand) =>
          subcommand.setName('create').setDescription('Creates the voice lobby'),
        )
        .toJSON(),
      handler: {
        create: async (interaction): Promise<void> => {
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
        },
      },
    },
  ],
  eventHandlers: () => ({
    voiceStateUpdate: async (oldState, newState) => {
      const lobbyId = await cache.get('lobbyId');
      if (lobbyId === undefined) {
        return;
      }

      if (isLeaveState(oldState)) {
        await handleLeave(oldState);
      }

      if (isJoinState(newState)) {
        await handleJoin(newState, lobbyId);
      }
    },
    channelDelete: async (channel) => {
      if (channel.type !== ChannelType.GuildVoice) {
        return;
      }

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
          }),
        );
      }
    },
  }),
  intents: ['GuildVoiceStates', 'GuildMembers'],
});
