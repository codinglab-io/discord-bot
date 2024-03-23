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
          subcommand.setName('enable').setDescription('Enable the cookie hunt in the channel'),
        )
        .addSubcommand((subcommand) =>
          subcommand.setName('disable').setDescription('Disable the cookie hunt in the channel'),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .toJSON(),
      handler: {
        enable: (interaction) =>
          addChannelInCache(interaction, 'Cookie Hunter', 'cookieHunterChannels'),
        disable: (interaction) =>
          removeChannelFromChache(interaction, 'Cookie Hunter', 'cookieHunterChannels'),
      },
    },
  ],
  eventHandlers: () => ({
    ready: startHunting,
    messageReactionAdd: countCookies,
    channelDelete: (channel) => cleanCacheOnChannelDelete(channel, 'cookieHunterChannels'),
  }),
  intents: ['Guilds'],
});
