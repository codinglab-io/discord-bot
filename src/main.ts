import { ChannelType, Client, MessageType, REST, Routes } from 'discord.js';

import { voiceOnDemandCommand } from './commands';
import { config } from './config';
import { createLobby } from './create-lobby';
import { deleteExistingCommands } from './delete-existing-commands';
import { handleGuildMessageCreation } from './handlers/handle-guild-message-creation';
import { handleVoiceChannelDeletion } from './handlers/handle-voice-channel-deletion';
import {
  handleJoin,
  handleLeave,
  isJoinState,
  isLeaveState,
} from './handlers/voice-state-handlers';
import { cache } from './helpers/cache';

const { discord } = config;

const bootstrap = async (client: Client) => {
  await client.login(discord.token);

  await new Promise<void>((resolve) => {
    client.on('ready', () => {
      resolve();
    });
  });

  if (!client.isReady()) {
    throw new Error('Client should be ready at this stage');
  }
};

const client = new Client({
  intents: ['Guilds', 'GuildVoiceStates', 'GuildMembers', 'GuildMessages', 'MessageContent'],
});

await bootstrap(client);

client.on('channelDelete', async (channel) => {
  if (channel.type === ChannelType.GuildVoice) {
    await handleVoiceChannelDeletion(channel);
  }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  const lobbyId = await cache.get('lobbyId');
  if (lobbyId === undefined) {
    return;
  }

  if (isLeaveState(oldState)) {
    await handleLeave(oldState);
  }

  if (isJoinState(newState)) {
    await handleJoin(newState, lobbyId);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (
    !interaction.isCommand() ||
    !interaction.inGuild() ||
    !interaction.isChatInputCommand() ||
    interaction.commandName !== 'voice-on-demand'
  ) {
    return;
  }

  if (interaction.options.getSubcommand(true) !== 'create') {
    await interaction.reply('Unknown subcommand');
    return;
  }

  await createLobby(interaction);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) {
    return;
  }

  if (message.type !== MessageType.Default) {
    return;
  }

  await handleGuildMessageCreation(message);
});

const rest = new REST({ version: '10' }).setToken(discord.token);

await deleteExistingCommands(rest, discord);

await rest.put(Routes.applicationGuildCommands(discord.clientId, discord.guildId), {
  body: [voiceOnDemandCommand],
});

console.log('Bot started.');
