import {
  Client,
  REST,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from 'discord.js';

import { config } from '../config';
import type { BotCommand } from '../types/bot';
import { deleteExistingCommands } from './deleteExistingCommands';

const { discord } = config;

export const pushCommands = async (commands: RESTPostAPIChatInputApplicationCommandsJSONBody[]) => {
  const rest = new REST({ version: '10' }).setToken(discord.token);
  await deleteExistingCommands(rest, discord);
  await rest.put(Routes.applicationGuildCommands(discord.clientId, discord.guildId), {
    body: commands,
  });
};

export const routeCommands = (client: Client<true>, botCommands: BotCommand[]) =>
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.inGuild() || !interaction.isChatInputCommand()) {
      return;
    }

    const command = botCommands.find((command) => command.schema.name === interaction.commandName);

    if (!command) {
      await interaction.reply({
        content: `Command not found ${interaction.commandName}`,
        ephemeral: true,
      });
      return;
    }

    if (typeof command.handler === 'function') {
      await command.handler(interaction);
      return;
    }

    const subCommand = command.handler[interaction.options.getSubcommand()];

    if (!subCommand) {
      await interaction.reply({
        content: `Subcommand not found ${
          interaction.commandName
        } ${interaction.options.getSubcommand()}`,
        ephemeral: true,
      });
      return;
    }

    await subCommand(interaction);
  });
