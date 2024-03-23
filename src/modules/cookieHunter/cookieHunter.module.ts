import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import { createModule } from '../../core/createModule';
import {
  addChannelInCache,
  cleanCacheOnChannelDelete,
  removeChannelFromChache,
} from '../../helpers/channels';
import { countCookies, displayScoreboard, startHunting } from './cookieHunter.helpers';

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
        .addSubcommand((subcommand) =>
          subcommand.setName('scoreboard').setDescription('Show the scoreboard'),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .toJSON(),
      handler: {
        // eslint-disable-next-line @typescript-eslint/require-await
        'start': async (interaction) => startHunting(interaction.client),
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
        'scoreboard': async (interaction) => displayScoreboard(interaction),
      },
    },
  ],
  eventHandlers: () => ({
    // eslint-disable-next-line @typescript-eslint/require-await
    ready: async (client) => startHunting(client),
    messageReactionAdd: countCookies,
    channelDelete: async (channel) => {
      await cleanCacheOnChannelDelete(channel, 'cookieHunterChannels');
      await cleanCacheOnChannelDelete(channel, 'cookieHunterDailyLogChannels');
    },
  }),
  intents: ['Guilds'],
});
