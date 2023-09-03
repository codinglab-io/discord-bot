import { Client } from 'discord.js';

import { config } from './config';
import { loadModules } from './core/loaderModules';
import { modules } from './modules/modules';

const { discord } = config;
const client = new Client({
  intents: ['Guilds', 'GuildVoiceStates', 'GuildMembers', 'GuildMessages', 'MessageContent'],
});

await client.login(discord.token);
await new Promise<void>((resolve) => {
  client.on('ready', () => {
    resolve();
  });
});

if (!client.isReady()) {
  throw new Error('Client should be ready at this stage');
}

await loadModules(client, modules);

console.log('Bot started.');
