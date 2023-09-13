import { SlashCommandBuilder } from 'discord.js';

import { createModule } from '../../core/createModule';
import {
  addQuoiFeurToChannel,
  cleanCacheOnChannelDelete,
  reactOnEndWithQuoi,
  removeQuoiFeurFromChannel,
} from './quoiFeur.helpers';

export const quoiFeur = createModule({
  name: 'quoiFeur',
  slashCommands: () => [
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
        enable: addQuoiFeurToChannel,
        disable: removeQuoiFeurFromChannel,
      },
    },
  ],
  eventHandlers: () => ({
    messageCreate: reactOnEndWithQuoi,
    channelDelete: cleanCacheOnChannelDelete,
  }),
  intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildMessageReactions'],
});
