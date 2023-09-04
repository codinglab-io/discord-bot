import { SlashCommandBuilder } from 'discord.js';

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
        add: addQuoiFeurToChannel,
        remove: removeQuoiFeurFromChannel,
      },
    },
  ],
  eventHandlers: {
    // unmute everyone in every server on bot restart
    ready: deleteRoleMutedByBot,
    messageCreate: reactOnEndWithQuoi,
  },
};
