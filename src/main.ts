import { Client } from 'discord.js';

import { config } from './config';
import { createAllModules } from './core/createAllModules';
import { getIntentsFromModules } from './core/getIntentsFromModules';
import { loadModules } from './core/loadModules';
import { modules } from './modules/modules';

const { discord } = config;

const createdModules = await createAllModules(modules);

const client = new Client({
  intents: ['Guilds', ...getIntentsFromModules(createdModules)],
});

await client.login(discord.token);

if (!client.isReady()) {
  throw new Error('Client should be ready at this stage');
}

await loadModules(client, createdModules);

console.log('Bot started.');
