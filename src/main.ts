import { Client, REST, Routes } from 'discord.js';

import { fartCommand, quoiFeurCommand, voiceOnDemandCommand } from './commands';
import { config } from './config';
import { deleteExistingCommands } from './delete-existing-commands';
import { handleGuildMessageCreation } from './handlers/handle-guild-message-creation';
import { handleInteractionCreation } from './handlers/handle-interaction-creation';
import { handleRoleCreation } from './handlers/handle-role-creation';
import { handleVoiceChannelDeletion } from './handlers/handle-voice-channel-deletion';
import { handleVoiceStateUpdate } from './handlers/handle-voice-state-update';

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
  await handleVoiceChannelDeletion(channel);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  await handleVoiceStateUpdate(oldState, newState);
});

client.on('interactionCreate', async (interaction) => {
  await handleInteractionCreation(interaction);
});

client.on('messageCreate', async (message) => {
  await handleGuildMessageCreation(message);
});

const rest = new REST({ version: '10' }).setToken(discord.token);

await deleteExistingCommands(rest, discord);

await rest.put(Routes.applicationGuildCommands(discord.clientId, discord.guildId), {
  body: [voiceOnDemandCommand, fartCommand, quoiFeurCommand],
});

const guild = await client.guilds.fetch(discord.guildId);
await handleRoleCreation(guild);

console.log('Bot started.');
