import { ChannelType, Guild, SlashCommandBuilder } from 'discord.js';

import { cache } from '../../core/cache';
import type { BotModule } from '../../types/bot';
import { handleJoin, handleLeave, isJoinState, isLeaveState } from './voiceOnDemand.helpers';

export const voiceOnDemand: BotModule = {
  slashCommands: [
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
          const { guild } = interaction;

          if (!(guild instanceof Guild)) {
            await interaction.reply({
              content: 'This command is only available in guilds',
              ephemeral: true,
            });

            return;
          }
          const lobbyIds = await cache.get('lobbyIds', []);
          const lobbyId = lobbyIds.find((lobbyId) => guild.channels.cache.has(lobbyId));

          if (lobbyId !== undefined) {
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

          //NOTES: this is a potential race condition.
          await cache.set('lobbyIds', [...lobbyIds, id]);

          await interaction.reply({
            content: 'Created voice on demand voice channel.',
            ephemeral: true,
          });
        },
      },
    },
  ],
  eventHandlers: {
    voiceStateUpdate: async (oldState, newState) => {
      const lobbyIds = await cache.get('lobbyIds', []);
      const lobbyId = lobbyIds.find((lobbyId) => newState.channelId === lobbyId);

      if (lobbyId === undefined) {
        return;
      }

      if (isLeaveState(oldState)) {
        await handleLeave(oldState);
      }

      if (isJoinState(newState)) {
        await handleJoin(newState);
      }
    },
    channelDelete: async (channel) => {
      if (channel.type !== ChannelType.GuildVoice) {
        return;
      }

      const lobbyIds = await cache.get('lobbyIds', []);
      const { guild, id } = channel;

      if (lobbyIds.includes(id)) return;

      await cache.set(
        'lobbyIds',
        lobbyIds.filter((lobbyId) => lobbyId !== id),
      );

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
    },
  },
  intents: ['GuildVoiceStates', 'GuildMembers'],
};
