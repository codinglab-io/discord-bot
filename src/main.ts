import { Client } from 'discord.js';

import { createAllModules } from './core/createEnvForModule';
import { env } from './core/env';
import { getIntentsFromModules } from './core/getIntentsFromModules';
import { loadModules } from './core/loadModules';
import { modules } from './modules/modules';

const createdModules = await createAllModules(modules);

const client = new Client({
  intents: ['Guilds', ...getIntentsFromModules(createdModules)],
});

await client.login(env.discordToken);

if (!client.isReady()) {
  throw new Error('Client should be ready at this stage');
}

await loadModules(client, createdModules);

console.log('Bot started.');
