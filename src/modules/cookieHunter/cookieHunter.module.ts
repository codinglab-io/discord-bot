import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import { createModule } from '../../core/createModule';
import {
  addChannelInCache,
  cleanCacheOnChannelDelete,
  removeChannelFromChache,
} from '../../helpers/channels';
import { countCookies, startHunting } from './cookieHunter.helpers';

export const cookieHunter = createModule({
  name: 'cookieHunter',
  slashCommands: () => [
    {
      schema: new SlashCommandBuilder()
        .setName('cookie-hunter')
        .setDescription('Cookie hunting game for the server')
        .addSubcommand((subcommand) =>
          subcommand.setName('start').setDescription('Start the cookie hunt'),
        )
        .addSubcommand((subcommand) =>
          subcommand.setName('enable').setDescription('Enable the cookie hunt in the channel'),
        )
        .addSubcommand((subcommand) =>
          subcommand.setName('disable').setDescription('Disable the cookie hunt in the channel'),
        )
        .addSubcommand((subcommand) =>
          subcommand.setName('add-daily-log').setDescription('Add daily log to the channel'),
        )
        .addSubcommand((subcommand) =>
          subcommand.setName('remove-daily-log').setDescription('Add daily log to the channel'),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .toJSON(),
      handler: {
        'start': (interaction) => startHunting(interaction.client),
        'enable': (interaction) =>
          addChannelInCache(interaction, 'Cookie Hunter', 'cookieHunterChannels'),
        'disable': (interaction) =>
          removeChannelFromChache(interaction, 'Cookie Hunter', 'cookieHunterChannels'),
        'add-daily-log': (interaction) =>
          addChannelInCache(
            interaction,
            'Cookie Hunter Daily logs',
            'cookieHunterDailyLogChannels',
          ),
        'remove-daily-log': (interaction) =>
          removeChannelFromChache(
            interaction,
            'Cookie Hunter Daily logs',
            'cookieHunterDailyLogChannels',
          ),
      },
    },
  ],
  eventHandlers: () => ({
    ready: startHunting,
    messageReactionAdd: countCookies,
    channelDelete: async (channel) => {
      cleanCacheOnChannelDelete(channel, 'cookieHunterChannels');
      cleanCacheOnChannelDelete(channel, 'cookieHunterDailyLogChannels');
    },
  }),
  intents: ['Guilds'],
});
