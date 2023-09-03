import { SlashCommandBuilder } from 'discord.js';

import { config } from '../../config';
import type { BotModule } from '../../types/bot';
import {
  addQuoiFeurToChannel,
  deleteRoleMutedByBot,
  reactOnEndWithQuoi,
  removeQuoiFeurFromChannel,
} from './quoiFeur.helpers';

export const quoiFeur: BotModule = {
  slashCommands: [
    {
      schema: new SlashCommandBuilder()
        .setName('quoi-feur')
        .setDescription('Manage quoi-feur game in the channel')
        .addSubcommand((subcommand) =>
          subcommand.setName('add').setDescription('Add the quoi-feur game to the channel'),
        )
        .addSubcommand((subcommand) =>
          subcommand.setName('remove').setDescription('Remove the quoi-feur game from the channel'),
        )
        .toJSON(),
      handler: {
        add: async (interaction) => {
          await addQuoiFeurToChannel(interaction).catch(console.error);
        },
        remove: async (interaction) => {
          await removeQuoiFeurFromChannel(interaction).catch(console.error);
        },
      },
    },
  ],
  eventHandlers: {
    ready: async (client) => {
      const guild = client.guilds.cache.get(config.discord.guildId) ?? null;
      // unmute everyone on bot restart
      await deleteRoleMutedByBot(guild).catch(console.error);
    },
    messageCreate: async (message) => {
      await reactOnEndWithQuoi(message).catch(console.error);
    },
  },
};
