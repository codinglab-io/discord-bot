import {
  Client,
  REST,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from 'discord.js';

import type { BotCommand } from '../types/bot';
import { deleteExistingCommands } from './deleteExistingCommands';
import { isDiffBetweenLocalCommandsAndRemoteCommands } from './isDiffBetweenLocalCommandsAndRemoteCommands';

interface PushCommandsOptions {
  commands: RESTPostAPIChatInputApplicationCommandsJSONBody[];
  clientId: string;
  guildId: string;
  discordToken: string;
}

const pushOnlyNewCommands = async (
  discordToken: string,
  clientId: string,
  guildId: string,
  commands: RESTPostAPIChatInputApplicationCommandsJSONBody[],
) => {
  const rest = new REST({ version: '10' }).setToken(discordToken);
  const remoteCommands = await rest.get(Routes.applicationGuildCommands(clientId, guildId));
  const getLocalCommands = commands;
  const isDiff = isDiffBetweenLocalCommandsAndRemoteCommands(
    getLocalCommands,
    remoteCommands as RESTPostAPIChatInputApplicationCommandsJSONBody[],
  );
  if (isDiff) {
    console.log('DIFFERENCE EVIDENTE');
    await deleteExistingCommands(rest, clientId, guildId);
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
  }
  console.log('PAS DE DIFF');
};

export const pushCommands = async ({
  commands,
  clientId,
  guildId,
  discordToken,
}: PushCommandsOptions) => {
  await pushOnlyNewCommands(discordToken, clientId, guildId, commands);
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
