import { SlashCommandBuilder } from 'discord.js';

import type { BotModule } from '../../types/bot';
import {
  addQuoiFeurToChannel,
  cleanCacheOnChannelDelete,
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
          subcommand.setName('enable').setDescription('Enable the quoi-feur game in the channel'),
        )
        .addSubcommand((subcommand) =>
          subcommand.setName('disable').setDescription('Disable the quoi-feur game in the channel'),
        )
        .toJSON(),
      handler: {
        add: addQuoiFeurToChannel,
        remove: removeQuoiFeurFromChannel,
      },
    },
  ],
  eventHandlers: {
    messageCreate: reactOnEndWithQuoi,
    channelDelete: cleanCacheOnChannelDelete,
  },
  intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildMessageReactions'],
};
