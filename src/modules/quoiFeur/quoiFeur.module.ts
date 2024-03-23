import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import { createModule } from '../../core/createModule';
import { reactOnEndWithQuoi } from './quoiFeur.helpers';
import {
  addChannelInCache,
  cleanCacheOnChannelDelete,
  removeChannelFromChache,
} from '../../helpers/channels';

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
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .toJSON(),
      handler: {
        enable: (interaction) => addChannelInCache(interaction, 'Quoi-Feur', 'quoiFeurChannels'),
        disable: (interaction) =>
          removeChannelFromChache(interaction, 'Quoi-Feur', 'quoiFeurChannels'),
      },
    },
  ],
  eventHandlers: () => ({
    messageCreate: reactOnEndWithQuoi,
    channelDelete: (channel) => cleanCacheOnChannelDelete(channel, 'quoiFeurChannels'),
  }),
  intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildMessageReactions'],
});
