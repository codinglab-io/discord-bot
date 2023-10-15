import {
  Client,
  type Interaction,
  REST,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from 'discord.js';

import type { BotCommand } from '../types/bot';
import { deleteExistingCommands } from './deleteExistingCommands';
import { coreLogger } from './logger';

interface PushCommandsOptions {
  commands: RESTPostAPIChatInputApplicationCommandsJSONBody[];
  clientId: string;
  guildId: string;
  discordToken: string;
}

async function handleInteractionCreate(interaction: Interaction, botCommands: BotCommand[]) {
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
}

export const pushCommands = async ({
  commands,
  clientId,
  guildId,
  discordToken,
}: PushCommandsOptions) => {
  const rest = new REST({ version: '10' }).setToken(discordToken);
  await deleteExistingCommands(rest, clientId, guildId);
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body: commands,
  });
  coreLogger.info('All commands are pushed.');
};

export const routeCommands = (client: Client<true>, botCommands: BotCommand[]) =>
  client.on(
    'interactionCreate',
    (interaction) => void handleInteractionCreate(interaction, botCommands),
  );
