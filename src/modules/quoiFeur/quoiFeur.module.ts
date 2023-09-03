import { SlashCommandBuilder } from 'discord.js';

import { config } from '../../config';
import { MUTED_BY_BOT } from '../../constants/roles';
import type { BotModule } from '../../types/bot';
import { addQuoiFeurChannel, quoiFeurReact, removeQuoiFeurChannel } from './quoiFeur.helpers';

export const quoiFeur: BotModule = {
  slashCommands: [
    {
      schema: new SlashCommandBuilder()
        .setName('quoi-feur')
        .setDescription('Manage quoi-feur game in the channel')
        .addSubcommand((subcommand) =>
          subcommand.setName('add').setDescription('Add the quoi-feur game in the channel'),
        )
        .addSubcommand((subcommand) =>
          subcommand.setName('remove').setDescription('Remove the quoi-feur game in the channel'),
        )
        .toJSON(),
      handler: {
        add: async (interaction) => {
          await addQuoiFeurChannel(interaction);
        },
        remove: async (interaction) => {
          await removeQuoiFeurChannel(interaction);
        },
      },
    },
  ],
  eventHandlers: {
    ready: async (client) => {
      const guild = await client.guilds.fetch(config.discord.guildId);
      const hasMutedByBot = guild.roles.cache.find((role) => role.name === MUTED_BY_BOT);
      if (hasMutedByBot) {
        // delete to unmute all members and re-create it
        await hasMutedByBot.delete();
      }
      await guild.roles.create({
        name: MUTED_BY_BOT,
      });
    },
    messageCreate: async (message) => {
      await quoiFeurReact(message);
    },
  },
};
