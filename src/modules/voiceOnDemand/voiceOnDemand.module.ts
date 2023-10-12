import { ChannelType, Guild, SlashCommandBuilder } from 'discord.js';

import { cache } from '../../core/cache';
import { createModule } from '../../core/createModule';
import {
  handleJoinLobby,
  handleLeaveOnDemand,
  isJoinState,
  isLeaveState,
} from './voiceOnDemand.helpers';

export const voiceOnDemand = createModule({
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
  eventHandlers: () => ({
    voiceStateUpdate: async (oldState, newState) => {
      const lobbyIds = await cache.get('lobbyIds', []);
      const onDemandChannels = await cache.get('onDemandChannels', []);

      const isLobbyChannel = lobbyIds.includes(newState.channelId ?? '');
      const isOnDemandChannel = onDemandChannels.includes(oldState.channelId ?? '');

      if (!isOnDemandChannel && !isLobbyChannel) {
        return;
      }

      if (isOnDemandChannel && isLeaveState(oldState)) {
        await handleLeaveOnDemand(oldState);
      }

      if (isLobbyChannel && isJoinState(newState)) {
        await handleJoinLobby(newState);
      }
    },
    channelDelete: async (channel) => {
      if (channel.type !== ChannelType.GuildVoice) {
        return;
      }

      const lobbyIds = await cache.get('lobbyIds', []);
      const isLobbyChannel = lobbyIds.includes(channel.id);

      if (!isLobbyChannel) {
        return;
      }

      await cache.set(
        'lobbyIds',
        lobbyIds.filter((lobbyId) => lobbyId !== channel.id),
      );
    },
  }),
  intents: ['GuildVoiceStates', 'GuildMembers'],
});
